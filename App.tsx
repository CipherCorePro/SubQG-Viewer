
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { ConfigurationPanel } from './components/ConfigurationPanel';
import { SimulationView } from './components/SimulationView';
import { AnalysisView } from './components/AnalysisView';
import type { SimulationParams, TickData, Node, AnalysisData, RNGType } from './types'; // Added RNGType
import { runSimulation } from './services/simulationService';
import type { SimulationEngine } from './services/simulationService';
import { analyzeData } from './services/analysisService';
import { DEFAULT_SIMULATION_PARAMS } from './constants';
import { PlayIcon } from './components/icons/PlayIcon';
import { PauseIcon } from './components/icons/PauseIcon';
import { ResetIcon } from './components/icons/ResetIcon';
import { exportNodesToJSON, exportNodesToCSV, downloadMarkdownReport } from './utils/exportUtils';
import type { SubQGRNG } from './utils/rng'; // For type casting

enum AppView {
  SIMULATION = 'Simulation',
  ANALYSIS = 'Analysis',
}

type ModalContentType = 'markdownReport' | 'publicationAnalysis' | 'error' | null;

function formatSimulationDataForPrompt(params: SimulationParams, nodes: Node[], analysis: AnalysisData | null): string {
  let dataString = `Simulation Parameters:\n${JSON.stringify(params, null, 2)}\n\n`;
  if (params.comparativeContext) {
    dataString += `User-Provided Comparative Context/Notes: ${params.comparativeContext}\n\n`;
  }
  dataString += `Total Nodes Formed: ${nodes.length}\n\n`;
  
  const nodesSample = nodes.slice(0, 20).map(n => ({
    tick: n.tick, 
    interferenceValue: parseFloat(n.interferenceValue.toFixed(3)),
    spin: n.spin,
    topologyType: n.topologyType
  }));
  dataString += `Node Data (sample of up to 20 nodes - includes tick, interferenceValue, spin, topologyType):\n${JSON.stringify(nodesSample, null, 2)}\n\n`;

  if (analysis) {
    dataString += `Node Counts Per Segment (Segment Duration: ${params.segmentDuration} ticks):\n${JSON.stringify(analysis.nodeCountsPerSegment, null, 2)}\n\n`;
    const riemannSample = analysis.riemannData.slice(0, 50).map(val => parseFloat(val.toFixed(3)));
    dataString += `Riemann Histogram Data (Node Interference Values - sample of up to 50 for distribution analysis):\n${JSON.stringify(riemannSample, null, 2)}\n\n`;
    dataString += `Cluster Time Map Data: ${analysis.clusterTimeMapData.length} nodes are plotted (tick vs. interference, colored by spin). This visualizes node emergence patterns over time and interference strength.\n\n`;
  }
  return dataString;
}

function formatRawDataForBackendPrompt(params: SimulationParams, nodes: Node[]): string {
    let dataString = `Simulation Parameters:\n${JSON.stringify(params, null, 2)}\n\n`;
    if (params.comparativeContext) {
        dataString += `User-Provided Comparative Context/Notes: ${params.comparativeContext}\n\n`;
    }
    dataString += `Total Nodes Formed: ${nodes.length}\n\n`;
    const nodesFullSample = nodes.slice(0, 200).map(n => ({ // Sample increased to 200 for more raw data
        tick: n.tick,
        interferenceValue: parseFloat(n.interferenceValue.toFixed(3)),
        spin: n.spin,
        topologyType: n.topologyType
    }));
    dataString += `Full Node List (sample of up to 200 nodes, including tick, interferenceValue, spin, topologyType):\n${JSON.stringify(nodesFullSample, null, 2)}\n\n`;
    return dataString;
}


const App: React.FC = () => {
  const [params, setParams] = useState<SimulationParams>(DEFAULT_SIMULATION_PARAMS);
  const [simulationData, setSimulationData] = useState<TickData[]>([]);
  const [formedNodes, setFormedNodes] = useState<Node[]>([]);
  const [analysisResults, setAnalysisResults] = useState<AnalysisData | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [currentTick, setCurrentTick] = useState<number>(0);
  const [activeView, setActiveView] = useState<AppView>(AppView.SIMULATION);
  
  const engineRef = useRef<SimulationEngine | null>(null);
  const currentSimulationRunRef = useRef<{ tickDataBuffer: TickData[], nodeBuffer: Node[], rngState: any } | null>(null);
  
  const isPausedRef = useRef(isPaused);
  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  const [geminiAnalysisContent, setGeminiAnalysisContent] = useState<string | null>(null);
  const [geminiContentIsError, setGeminiContentIsError] = useState<boolean>(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState<boolean>(false);
  const [isGeneratingPublicationAnalysis, setIsGeneratingPublicationAnalysis] = useState<boolean>(false);
  const [showReportModal, setShowReportModal] = useState<boolean>(false);
  const [modalContentType, setModalContentType] = useState<ModalContentType>(null);
  const chartSVGsRef = useRef<{ nodeCountSVG?: string; riemannSVG?: string; clusterTimeMapSVG?: string }>({});


  const handleChartRendered = useCallback((chartType: 'nodeCount' | 'riemann' | 'clusterTimeMap', svgContent: string | null) => {
    if (svgContent) {
        if (chartType === 'nodeCount') chartSVGsRef.current.nodeCountSVG = svgContent;
        else if (chartType === 'riemann') chartSVGsRef.current.riemannSVG = svgContent;
        else if (chartType === 'clusterTimeMap') chartSVGsRef.current.clusterTimeMapSVG = svgContent;
    }
  }, []);

  const handleStopSimulation = useCallback(() => {
    setIsRunning(false);
    setIsPaused(false);
    if (engineRef.current) {
      engineRef.current.stop();
      engineRef.current = null;
    }
  }, []);

  const processSimulationCompletion = useCallback(() => {
    if (currentSimulationRunRef.current && currentSimulationRunRef.current.nodeBuffer.length >= 0) { // Allow analysis even for 0 nodes
      const analysis = analyzeData(currentSimulationRunRef.current.nodeBuffer, params.duration, params.segmentDuration);
      setAnalysisResults(analysis);
    }
    handleStopSimulation();
  }, [params.duration, params.segmentDuration, handleStopSimulation]);


  const startNewSimulation = useCallback(() => {
    handleStopSimulation(); 
    
    setSimulationData([]);
    setFormedNodes([]);
    setAnalysisResults(null);
    setCurrentTick(0);
    chartSVGsRef.current = {};
    setModalContentType(null); 
    setGeminiContentIsError(false);
    
    currentSimulationRunRef.current = {
      tickDataBuffer: [],
      nodeBuffer: [],
      rngState: null,
    };

    setIsRunning(true); 
    setIsPaused(false);

    const onTickUpdateCallback = (tickData: TickData, rngState: any) => { 
        if (currentSimulationRunRef.current) {
            currentSimulationRunRef.current.tickDataBuffer.push(tickData);
            if (tickData.node) {
                currentSimulationRunRef.current.nodeBuffer.push(tickData.node);
            }
            if (params.rngType === 'subqg') { // Only save state for SubQG RNG
                 currentSimulationRunRef.current.rngState = rngState;
            }

            if (!isPausedRef.current) {
                setSimulationData(prev => [...prev, tickData]);
                if (tickData.node) {
                    setFormedNodes(prev => [...prev, tickData.node!]);
                }
                setCurrentTick(tickData.tick);
            }
        }
        return true; 
      };

    const newEngine = runSimulation(
      params,
      onTickUpdateCallback,
      processSimulationCompletion,
      // Pass rngState only if it's SubQG RNG and state exists
      params.rngType === 'subqg' && currentSimulationRunRef.current?.rngState ? currentSimulationRunRef.current.rngState : undefined
    );
    engineRef.current = newEngine;
  }, [params, processSimulationCompletion, handleStopSimulation]);


  const handlePlayPause = () => {
    if (!isRunning && !isPaused) { 
      startNewSimulation();
    } else if (isRunning && !isPaused) { 
      setIsPaused(true);
      if (params.rngType === 'subqg' && engineRef.current && currentSimulationRunRef.current) { // Check for subqg
        const rngInstance = (engineRef.current as SimulationEngine).rng as SubQGRNG; 
        if (rngInstance && typeof rngInstance.getState === 'function') {
            currentSimulationRunRef.current.rngState = rngInstance.getState();
        }
      }
    } else if (isRunning && isPaused) { 
      setIsPaused(false);
    }
  };
  
  const handleReset = useCallback(() => {
    handleStopSimulation();
    setParams(DEFAULT_SIMULATION_PARAMS);
    setSimulationData([]);
    setFormedNodes([]);
    setAnalysisResults(null);
    setCurrentTick(0);
    currentSimulationRunRef.current = null;
    chartSVGsRef.current = {};
    setGeminiAnalysisContent(null);
    setGeminiContentIsError(false);
    setShowReportModal(false);
    setModalContentType(null);
  }, [handleStopSimulation]);

  const handleParamsChange = useCallback((newParams: Partial<SimulationParams>) => {
    if (isRunning) return; 
    setParams(prev => ({ ...prev, ...newParams }));
  }, [isRunning]);

  const handleExportJSON = useCallback(() => {
    const nodesToExport = currentSimulationRunRef.current?.nodeBuffer ?? formedNodes;
    if (nodesToExport.length > 0) {
        exportNodesToJSON(nodesToExport);
    } else {
        alert("No node data to export. Run a simulation first.");
    }
  }, [formedNodes]);

  const handleExportCSV = useCallback(() => {
    const nodesToExport = currentSimulationRunRef.current?.nodeBuffer ?? formedNodes;
    if (nodesToExport.length > 0) {
        exportNodesToCSV(nodesToExport);
    } else {
        alert("No node data to export. Run a simulation first.");
    }
  }, [formedNodes]);

  const callGeminiApi = async (prompt: string): Promise<string> => {
    const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt })
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: `HTTP error! status: ${response.status} ${response.statusText}` }));
        throw new Error(errorData.error || `HTTP error! status: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    if (data.error) {
        throw new Error(data.error);
    }
    return data.result;
  }

  const handleGenerateMarkdownReport = useCallback(async () => {
    if (!analysisResults || !(currentSimulationRunRef.current?.nodeBuffer)) {
        alert("Please run a simulation. Analysis results and node data are needed for the report.");
        if (!analysisResults) setActiveView(AppView.ANALYSIS); 
        return;
    }
    setIsGeneratingReport(true);
    setModalContentType('markdownReport');
    setGeminiContentIsError(false);
    setShowReportModal(true);
    setGeminiAnalysisContent("Generating scientific analysis via backend...\nThis may take a moment.");

    try {
        const nodesToAnalyze = currentSimulationRunRef.current.nodeBuffer;
        const simulationSummary = formatSimulationDataForPrompt(params, nodesToAnalyze, analysisResults);
        
        const rngTypeExplanation = params.rngType === 'subqg' 
            ? "The 'SubQG RNG' is deterministic and theorized to represent the SubQuantumField (SubQG), a layer below the standard quantum field, influencing its behavior. This field is considered more fundamental and ordered."
            : "The 'Quantum RNG (Simulated)' uses Math.random() to simulate non-deterministic quantum fluctuations, representing the standard quantum field behavior.";

        const chartGuidance = `
Chart Interpretation Guidance:
- Node Count Chart: Analyze trends in node formation over time (e.g., bursts, steady state, decline).
- Riemann Histogram: This plots the distribution of node interference values (a proxy for Re(s) or resonance strength). Discuss clustering, especially around 0.5, and the range/implications for node strength.
- Cluster Time Map: This plots nodes (tick vs. interference), colored by 'spin' (+1 blue, -1 red). Analyze for temporal clusters, interference strength patterns, and any correlation between 'spin', 'topologyType', and formation conditions.

Deep Dive Analysis Points:
- **Spin Analysis**: What is the distribution of 'spin' (+1 vs -1)? Is it balanced? Does 'spin' correlate with node interference strength, formation time, or 'topologyType'? What could spin represent in this pre-geometric SubQG model?
- **TopologyType Analysis**: What are the dominant 'topologyType's (e.g. HighInterference, MidInterference, LowInterference)? Do they correlate with interference values, spin values, or appear in specific phases of the simulation (e.g., early, mid, late)? What might these types signify about the nature of emergent nodes?
- **RNG Type Implications**: Crucially, differentiate your analysis based on the RNG type used. If 'SubQG RNG' was used, interpret findings in light of it representing a deterministic, underlying SubQuantumField. If 'Quantum RNG' was used, interpret as standard quantum field fluctuations. How do these conceptual differences impact the interpretation of node emergence, spin, and topology?
- **Comparative Context (If Provided)**: If a 'Comparative Context' (e.g., notes on CDT, GFT, LQG) is provided by the user (see parameters section below), *explicitly and deeply* relate your findings on node patterns, spin, topology, and the cluster map to this context. Discuss potential links, analogies, or divergences between the SubQG simulation results and the concepts of these other theories.
`;
        const fullPrompt = `
You are an expert physicist specializing in quantum gravity, emergence, and foundational theories, analyzing data from a SubQG (SubQuantenfeld-Grundfeld) simulation.
The SubQG model posits that physical reality emerges from interference of energy/phase waves. Constructive interference above a threshold forms "SubQG Nodes."
Nodes have metadata: 'spin' (+1/-1, randomly assigned for now) and 'topologyType' (e.g., 'HighInterference', 'MidInterference', 'LowInterference', derived from interference strength).
The simulation used RNG type: '${params.rngType}'. ${rngTypeExplanation}
${params.comparativeContext ? `User-Provided Comparative Context: ${params.comparativeContext}\n` : ""}
Based on the following simulation data and adhering strictly to the chart interpretation guidance and deep dive analysis points, provide a detailed scientific analysis.

Simulation Data:
${simulationSummary}

${chartGuidance}

Provide your analysis in well-structured Markdown format. Be thorough, critical, and insightful.
`;
        const geminiReportSection = await callGeminiApi(fullPrompt);
        
        let markdownContent = `# SubQG Simulation Report\n\n`;
        markdownContent += `## Simulation Parameters\n\`\`\`json\n${JSON.stringify(params, null, 2)}\n\`\`\`\n\n`;
        if (params.comparativeContext) {
            markdownContent += `### User-Provided Comparative Context:\n${params.comparativeContext}\n\n`;
        }
        markdownContent += `## Analysis Summary\n- RNG Type Used: ${params.rngType === 'subqg' ? 'SubQG RNG (Deterministic SubQuantumField)' : 'Quantum RNG (Simulated Quantum Field)'}\n`;
        markdownContent += `- Total Nodes Formed: ${analysisResults.totalNodes}\n`;
        markdownContent += `- Node Counts per Segment (Segment Duration: ${params.segmentDuration} ticks):\n`;
        analysisResults.nodeCountsPerSegment.forEach(segment => {
            markdownContent += `  - Tick ${segment.segmentStartTick}-${segment.segmentStartTick + params.segmentDuration -1}: ${segment.count} nodes\n`;
        });
        markdownContent += `\n- Riemann Histogram Data: ${analysisResults.riemannData.length} node interference values collected.\n`;
        markdownContent += `- Cluster Time Map Data: ${analysisResults.clusterTimeMapData.length} nodes plotted.\n\n`;

        if (chartSVGsRef.current.nodeCountSVG) {
            markdownContent += `## Node Count Chart (SVG)\n${chartSVGsRef.current.nodeCountSVG}\n\n`;
        }
        if (chartSVGsRef.current.riemannSVG) {
            markdownContent += `## Riemann Histogram Proxy Chart (SVG)\n${chartSVGsRef.current.riemannSVG}\n\n`;
        }
        if (chartSVGsRef.current.clusterTimeMapSVG) {
            markdownContent += `## Cluster Time Map Chart (SVG)\n${chartSVGsRef.current.clusterTimeMapSVG}\n\n`;
        }
        markdownContent += `## Scientific Analysis (via Gemini)\n${geminiReportSection}\n`;
        setGeminiAnalysisContent(markdownContent);
        setGeminiContentIsError(false);
    } catch (error) {
        console.error("Error in handleGenerateMarkdownReport:", error);
        const errorMessage = `Failed to generate Markdown report. ${error instanceof Error ? error.message : String(error)}`;
        setGeminiAnalysisContent(errorMessage);
        setGeminiContentIsError(true);
    } finally {
        setIsGeneratingReport(false);
    }
  }, [analysisResults, params]);

  const handleGeneratePublicationAnalysis = useCallback(async () => {
    const nodesToAnalyze = currentSimulationRunRef.current?.nodeBuffer;
    if (!nodesToAnalyze || nodesToAnalyze.length === 0) {
        alert("Please run a simulation to generate node data before requesting publication analysis.");
        return;
    }
    setIsGeneratingPublicationAnalysis(true);
    setModalContentType('publicationAnalysis');
    setGeminiContentIsError(false);
    setShowReportModal(true);
    setGeminiAnalysisContent("Generating publication-style analysis via backend...\nThis may take a few moments.");
    
    try {
        const rawDataSummary = formatRawDataForBackendPrompt(params, nodesToAnalyze);
        const rngTypeExplanation = params.rngType === 'subqg' 
            ? "The simulation used a 'SubQG RNG', which is deterministic and theorized to represent the SubQuantumField (SubQG). This SubQG field is considered a more fundamental, ordered layer below the standard quantum field, influencing its behavior."
            : "The simulation used a 'Quantum RNG (Simulated)' employing Math.random() to represent non-deterministic quantum fluctuations typically associated with the standard quantum field.";

        const fullPrompt = `
You are an AI research assistant drafting a preliminary analysis for a scientific publication, based on data from a SubQG (SubQuantenfeld-Grundfeld) simulation.
The SubQG model posits that physical reality (represented by "nodes" with metadata: 'spin' [+1/-1, randomly assigned] and 'topologyType' [e.g., 'HighInterference', derived from interference strength]) emerges from the interference of energy and phase waves within a subquantum field.
The simulation was run with RNG type: '${params.rngType}'. ${rngTypeExplanation}
${params.comparativeContext ? `User-Provided Comparative Context: ${params.comparativeContext}\n` : ""}
Simulation parameters (duration, threshold, noise, seed if SubQG, comparative context) are provided below.

Data Provided (Includes parameters and a sample of up to 200 nodes with tick, interferenceValue, spin, topologyType):
${rawDataSummary}

Task: Generate a structured scientific analysis suitable for a publication draft. Focus on deep interpretation of the provided data, especially the new metadata (spin, topologyType) and consider the implications of the RNG type used.

1.  **Executive Summary**: Briefly state the simulation setup (key params, RNG type, comparative context if any) and summarize the most significant findings regarding node emergence, and the characteristics of node metadata (spin, topologyType).
2.  **Key Quantitative & Qualitative Findings**:
    *   Total nodes formed, peak node formation periods/rates.
    *   Statistics and distribution of node interference values (proxy for resonance strength).
    *   **Spin Analysis**: Analyze the distribution of 'spin' (+1 vs -1). Is it balanced? Are there any discernible correlations between 'spin' and node interference strength, formation time, or 'topologyType' from the provided data sample? Speculate on what 'spin' might represent in this pre-geometric SubQG context.
    *   **TopologyType Analysis**: Analyze the dominant \\\`topologyType\\\`s (e.g., HighInterference, MidInterference, LowInterference). How do these types correlate with interference values, spin, or specific simulation phases (e.g., early vs. late) within the data sample? What could these 'types' signify about the nature of emergent nodes or different energy regimes?
3.  **Observed Patterns, Trends, and Potential Clusters**:
    *   Describe patterns in node formation over time and interference strength.
    *   Based on the raw node data (tick, interference, spin, topology), are there any indications of clustering? For example, do nodes with similar spin or topologyType tend to form in temporal proximity or at similar interference levels?
4.  **Correlation with Parameters & Theoretical Context (Hypothesize)**:
    *   How might the input parameters (threshold, noise, RNG type, seed) have influenced the observed results, especially the node metadata (spin, topology) and any clustering behavior?
    *   **Crucially, if a 'Comparative Context' (e.g., notes on CDT, GFT, LQG) is provided in the parameters, *explicitly and deeply discuss potential links, analogies, or divergences* between these SubQG simulation findings (including spin, topology, and clusters) and the concepts/predictions of those other fundamental theories.**
5.  **Significance for SubQG Theory & Emergence (Considering RNG Type)**:
    *   How do the findings on emergence, resonance, and the assigned metadata (spin, topologyType) contribute to understanding the SubQG model?
    *   Discuss the implications of the RNG type used. If 'SubQG RNG', how do the results support or challenge the idea of an underlying deterministic field influencing a quantum one? If 'Quantum RNG', how do the results compare to expectations from standard quantum field fluctuations?
6.  **Suggestions for Further Investigation**: Based on *these specific results and your analysis*, what aspects (e.g., detailed spin dynamics, evolution of topology types, specific parameter regimes for phase transitions or clustering, refined comparative studies) warrant more detailed future simulations or theoretical work?

Present in a clear, concise, and formal scientific tone using Markdown. Ensure depth in analysis, especially regarding the new metadata and the chosen RNG type.
`;
        const publicationText = await callGeminiApi(fullPrompt);
        setGeminiAnalysisContent(publicationText);
        setGeminiContentIsError(false);
    } catch (error) {
        console.error("Error in handleGeneratePublicationAnalysis:", error);
        const errorMessage = `Failed to generate publication analysis. ${error instanceof Error ? error.message : String(error)}`;
        setGeminiAnalysisContent(errorMessage);
        setGeminiContentIsError(true);
    } finally {
        setIsGeneratingPublicationAnalysis(false);
    }
  }, [params]);

  const progressPercentage = params.duration > 0 ? ((currentTick +1) / params.duration) * 100 : 0;

  let reportModalTitle = "Analysis Results"; // Default title
  if (modalContentType === 'markdownReport') {
    reportModalTitle = "Markdown Report";
  } else if (modalContentType === 'publicationAnalysis') {
    reportModalTitle = "Publication Analysis";
  }


  const ReportModal: React.FC<{ title: string; content: string | null; isLoading: boolean; onClose: () => void; onDownload?: () => void }> = 
  ({ title: initialTitle, content, isLoading: modalIsLoading, onClose, onDownload }) => { // Renamed isLoading to modalIsLoading to avoid conflict
    if (!showReportModal) return null; 
    
    let currentLoadingMessage = "Processing...";
    let displayTitle = initialTitle;

    if (modalIsLoading) { // Use modalIsLoading here
        if (modalContentType === 'markdownReport') {
            displayTitle = "Generating Report...";
            currentLoadingMessage = "Generating scientific analysis via backend...\nThis may take a moment.";
        } else if (modalContentType === 'publicationAnalysis') {
            displayTitle = "Generating Analysis...";
            currentLoadingMessage = "Generating publication-style analysis via backend...\nThis may take a few moments.";
        }
    } else if (geminiContentIsError) {
        displayTitle = "Error Generating Content";
    }


    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" aria-labelledby="report-modal-title">
        <div className="bg-slate-800 p-6 rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 id="report-modal-title" className="text-xl font-semibold text-sky-400">{displayTitle}</h3>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-200 text-2xl leading-none" aria-label="Close modal">&times;</button>
          </div>
          <div className="overflow-y-auto flex-grow mb-4 pr-2">
            {modalIsLoading ? ( // Use modalIsLoading here
                 <div className="flex flex-col items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mb-4"></div>
                    <p className="text-slate-300 text-center whitespace-pre-wrap">{currentLoadingMessage}</p>
                 </div>
            ) : content ? (
              <pre className={`whitespace-pre-wrap text-sm ${geminiContentIsError ? 'text-red-400' : 'text-slate-200'} bg-slate-900 p-4 rounded-md`}>{content}</pre>
            ) : (
              <p className="text-slate-500">No content to display or an error occurred preparing the content.</p>
            )}
          </div>
          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-700">
            {onDownload && !modalIsLoading && content && !geminiContentIsError && modalContentType === 'markdownReport' && ( // Use modalIsLoading here
                <button
                    onClick={onDownload}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md font-semibold transition-colors"
                    aria-label="Download report as Markdown file"
                >
                    Download Report (.md)
                </button>
            )}
            <button 
                onClick={onClose} 
                className="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-md font-semibold transition-colors"
                aria-label="Close"
            >
                Close
            </button>
          </div>
        </div>
      </div>
    );
  };


  return (
    <div className="min-h-screen flex flex-col bg-slate-900 text-slate-100">
      <header className="bg-slate-800 shadow-md p-4">
        <h1 className="text-3xl font-bold text-sky-400 text-center">SubQG-Viewer</h1>
        <p className="text-center text-sm text-slate-400 mt-1">Simulating Emergence from SubQuantum Fluctuations</p>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-96 bg-slate-800 p-6 space-y-6 overflow-y-auto shadow-lg">
          <ConfigurationPanel 
            params={params} 
            onParamsChange={handleParamsChange} 
            isRunning={isRunning}
            onExportJSON={handleExportJSON}
            onExportCSV={handleExportCSV}
            onGenerateMarkdownReport={handleGenerateMarkdownReport}
            isGeneratingReport={isGeneratingReport}
            onGeneratePublicationAnalysis={handleGeneratePublicationAnalysis}
            isGeneratingPublicationAnalysis={isGeneratingPublicationAnalysis}
          />
          <div className="space-y-3 pt-6 border-t border-slate-700">
            <h2 className="text-xl font-semibold text-sky-400 border-b border-slate-700 pb-2 mb-4">Controls</h2>
            <button
              onClick={handlePlayPause}
              className={`w-full flex items-center justify-center px-4 py-3 rounded-md font-semibold text-white transition-all duration-150 ease-in-out
                ${isPaused ? 'bg-yellow-500 hover:bg-yellow-600' : isRunning ? 'bg-red-500 hover:bg-red-600' : 'bg-sky-500 hover:bg-sky-600'}
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 ${isPaused ? 'focus:ring-yellow-400' : isRunning ? 'focus:ring-red-400' : 'focus:ring-sky-400'}`}
              aria-label={isPaused ? 'Resume simulation' : isRunning ? 'Pause simulation' : 'Start simulation'}
            >
              {isPaused ? <PlayIcon className="w-5 h-5 mr-2" /> : isRunning ? <PauseIcon className="w-5 h-5 mr-2" /> : <PlayIcon className="w-5 h-5 mr-2" />}
              {isPaused ? 'Resume' : isRunning ? 'Pause' : 'Start Simulation'}
            </button>
            <button
              onClick={handleReset}
              className="w-full flex items-center justify-center px-4 py-3 rounded-md font-semibold text-slate-300 bg-slate-700 hover:bg-slate-600 transition-all duration-150 ease-in-out
                         focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-slate-500"
              aria-label="Reset simulation parameters and data"
            >
              <ResetIcon className="w-5 h-5 mr-2" />
              Reset
            </button>
          </div>
          {(isRunning || currentTick > 0) && (
            <div className="mt-4 pt-6 border-t border-slate-700">
               <h2 className="text-xl font-semibold text-sky-400 border-b border-slate-700 pb-2 mb-4">Progress</h2>
              <div className="text-sm text-slate-400 mb-1">Simulation Progress: Tick {currentTick}/{params.duration}</div>
              <div className="w-full bg-slate-700 rounded-full h-2.5" role="progressbar" aria-valuenow={currentTick} aria-valuemin={0} aria-valuemax={params.duration}>
                <div
                  className="bg-sky-500 h-2.5 rounded-full transition-all duration-100 ease-linear"
                  style={{ width: `${Math.min(100, progressPercentage)}%` }}
                ></div>
              </div>
            </div>
          )}
        </aside>

        <main className="flex-1 p-6 overflow-y-auto bg-slate-900">
          <div className="mb-6">
            <nav className="flex space-x-1 rounded-lg bg-slate-800 p-1" aria-label="Main navigation">
              {(Object.values(AppView) as AppView[]).map((view) => (
                <button
                  key={view}
                  onClick={() => setActiveView(view)}
                  className={`flex-1 py-2.5 px-4 text-sm font-medium rounded-md transition-colors duration-150
                    ${activeView === view ? 'bg-sky-500 text-white shadow' : 'text-slate-300 hover:bg-slate-700 hover:text-white'}
                    focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-opacity-50`}
                  role="tab"
                  aria-selected={activeView === view}
                >
                  {view}
                </button>
              ))}
            </nav>
          </div>

          <div role="tabpanel" aria-labelledby={`tab-${activeView}`}>
            {activeView === AppView.SIMULATION && (
              <SimulationView tickData={simulationData} formedNodes={formedNodes} />
            )}
            {activeView === AppView.ANALYSIS && analysisResults && (
              <AnalysisView analysisData={analysisResults} params={params} onChartRendered={handleChartRendered} />
            )}
            {activeView === AppView.ANALYSIS && !analysisResults && (
              <div className="flex items-center justify-center h-full text-slate-500">
                <p>Run a simulation to see analysis results.</p>
              </div>
            )}
          </div>
        </main>
      </div>
      {showReportModal && (
        <ReportModal
          title={reportModalTitle}
          content={geminiAnalysisContent}
          isLoading={isGeneratingReport || isGeneratingPublicationAnalysis}
          onClose={() => {
            setShowReportModal(false);
            setGeminiAnalysisContent(null); 
            setModalContentType(null);
            setGeminiContentIsError(false);
          }}
          onDownload={
            modalContentType === 'markdownReport' && geminiAnalysisContent && !geminiContentIsError
              ? () => downloadMarkdownReport(geminiAnalysisContent)
              : undefined
          }
        />
      )}
    </div>
  );
};

export default App;