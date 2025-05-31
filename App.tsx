
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { ConfigurationPanel } from './components/ConfigurationPanel';
import { SimulationView } from './components/SimulationView';
import { AnalysisView } from './components/AnalysisView';
import type { SimulationParams, TickData, Node, AnalysisData } from './types';
import { runSimulation } from './services/simulationService';
import type { SimulationEngine } from './services/simulationService';
import { analyzeData } from './services/analysisService';
import { DEFAULT_SIMULATION_PARAMS } from './constants';
import { PlayIcon } from './components/icons/PlayIcon';
import { PauseIcon } from './components/icons/PauseIcon';
import { ResetIcon } from './components/icons/ResetIcon';
import { exportNodesToJSON, exportNodesToCSV, downloadMarkdownReport } from './utils/exportUtils';
// Removed direct Gemini service imports as it's now via backend

enum AppView {
  SIMULATION = 'Simulation',
  ANALYSIS = 'Analysis',
}

type ModalContentType = 'markdownReport' | 'publicationAnalysis' | 'error' | null;

// Helper function for formatting prompts (moved from old geminiService)
function formatSimulationDataForPrompt(params: SimulationParams, nodes: Node[], analysis: AnalysisData | null): string {
  let dataString = `Simulation Parameters:\n${JSON.stringify(params, null, 2)}\n\n`;
  dataString += `Total Nodes Formed: ${nodes.length}\n\n`;
  
  if (analysis) {
    dataString += `Node Counts Per Segment:\n${JSON.stringify(analysis.nodeCountsPerSegment, null, 2)}\n\n`;
    const riemannSample = analysis.riemannData.slice(0, 50).map(val => parseFloat(val.toFixed(3)));
    dataString += `Riemann Histogram Data (Node Interference Values - sample of up to 50):\n${JSON.stringify(riemannSample, null, 2)}\n\n`;
  } else {
    const nodesSample = nodes.slice(0, 50).map(n => ({tick: n.tick, interferenceValue: parseFloat(n.interferenceValue.toFixed(3))}));
    dataString += `Node Data (sample of up to 50 nodes):\n${JSON.stringify(nodesSample, null, 2)}\n\n`;
  }
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

  // State for Gemini features
  const [geminiAnalysisContent, setGeminiAnalysisContent] = useState<string | null>(null);
  const [geminiContentIsError, setGeminiContentIsError] = useState<boolean>(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState<boolean>(false);
  const [isGeneratingPublicationAnalysis, setIsGeneratingPublicationAnalysis] = useState<boolean>(false);
  const [showReportModal, setShowReportModal] = useState<boolean>(false);
  const [modalContentType, setModalContentType] = useState<ModalContentType>(null);
  const chartSVGsRef = useRef<{ nodeCountSVG?: string; riemannSVG?: string }>({});

  // Removed Gemini status check on mount as frontend no longer initializes SDK

  const handleChartRendered = useCallback((chartType: 'nodeCount' | 'riemann', svgContent: string | null) => {
    if (svgContent) {
        if (chartType === 'nodeCount') chartSVGsRef.current.nodeCountSVG = svgContent;
        else if (chartType === 'riemann') chartSVGsRef.current.riemannSVG = svgContent;
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
    if (currentSimulationRunRef.current && currentSimulationRunRef.current.nodeBuffer.length > 0) {
      const analysis = analyzeData(currentSimulationRunRef.current.nodeBuffer, params.duration, params.segmentDuration);
      setAnalysisResults(analysis);
    } else if (currentSimulationRunRef.current && currentSimulationRunRef.current.nodeBuffer.length === 0) {
      const emptyAnalysis = analyzeData([], params.duration, params.segmentDuration);
      setAnalysisResults(emptyAnalysis);
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
            currentSimulationRunRef.current.rngState = rngState;

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
      undefined 
    );
    engineRef.current = newEngine;
  }, [params, processSimulationCompletion, handleStopSimulation]);


  const handlePlayPause = () => {
    if (!isRunning && !isPaused) { 
      startNewSimulation();
    } else if (isRunning && !isPaused) { 
      setIsPaused(true);
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
        const errorData = await response.json().catch(() => ({ error: `HTTP error! status: ${response.status}` }));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
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
        const chartDescription = `
Chart Interpretation Guidance:
- Node Count Chart: Based on the 'Node Counts Per Segment' data, describe trends like initial bursts, steady formation, or decline in node activity.
- Riemann Histogram: Based on the 'Riemann Histogram Data' (node interference values), describe the distribution. Does it cluster around 0.5 (the critical line proxy)? Are there other notable peaks or skews? What does the range of these values imply about node strength?
`;
        const fullPrompt = `
You are an expert physicist analyzing data from a SubQG (SubQuantenfeld-Grundfeld) simulation.
The SubQG model posits that physical reality emerges from the interference of energy and phase waves in a subquantum field.
Constructive interference above a threshold forms "SubQG Nodes".

Based on the following simulation data and considering the chart interpretation guidance, provide a scientific analysis.
The analysis should be suitable for a section in a research report.

Focus on:
1.  Interpretation of the node formation patterns (e.g., trends in node counts over time).
2.  Interpretation of the Riemann Histogram proxy data (distribution of node interference values, especially in relation to 0.5).
3.  Potential implications of these findings within the SubQG theory.
4.  How the simulation parameters (duration, threshold, noise level, RNG type) might have influenced the results.
5.  Any surprising or noteworthy observations.

Simulation Data:
${simulationSummary}

${chartDescription}

Please provide your analysis in Markdown format.
Structure your response clearly.
`;
        const geminiReportSection = await callGeminiApi(fullPrompt);
        
        let markdownContent = `# SubQG Simulation Report\n\n`;
        markdownContent += `## Simulation Parameters\n\`\`\`json\n${JSON.stringify(params, null, 2)}\n\`\`\`\n\n`;
        markdownContent += `## Analysis Summary\n- Total Nodes Formed: ${analysisResults.totalNodes}\n`;
        markdownContent += `- Node Counts per Segment (Duration ${params.segmentDuration} ticks):\n`;
        analysisResults.nodeCountsPerSegment.forEach(segment => {
            markdownContent += `  - Tick ${segment.segmentStartTick}-${segment.segmentStartTick + params.segmentDuration -1}: ${segment.count} nodes\n`;
        });
        markdownContent += `\n- Riemann Histogram Data: ${analysisResults.riemannData.length} node interference values collected.\n\n`;

        if (chartSVGsRef.current.nodeCountSVG) {
            markdownContent += `## Node Count Chart (SVG)\n${chartSVGsRef.current.nodeCountSVG}\n\n`;
        }
        if (chartSVGsRef.current.riemannSVG) {
            markdownContent += `## Riemann Histogram Proxy Chart (SVG)\n${chartSVGsRef.current.riemannSVG}\n\n`;
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
        const rawDataSummary = `
Simulation Parameters:
${JSON.stringify(params, null, 2)}

Total Nodes Formed: ${nodesToAnalyze.length}

Full Node List (sample of up to 200 nodes, showing tick and interferenceValue formatted to 3 decimal places):
${JSON.stringify(nodesToAnalyze.slice(0, 200).map(n => ({tick: n.tick, interferenceValue: parseFloat(n.interferenceValue.toFixed(3))})), null, 2)}
`;
        const fullPrompt = `
You are an AI research assistant tasked with generating a preliminary analysis suitable for a scientific publication, based on raw data from a SubQG (SubQuantenfeld-Grundfeld) simulation.

The SubQG model suggests that physical reality (nodes) emerges from interference patterns in a subquantum field.
Key simulation parameters include duration, node formation threshold, noise level, and RNG type.

Data Provided:
${rawDataSummary}

Task:
Generate a structured analysis of this simulation run. Your analysis should identify:
1.  **Executive Summary**: A brief overview of the simulation and key findings.
2.  **Key Quantitative Findings**: e.g., total nodes, peak node formation periods (if any), average and range of interference values, notable statistical properties of the node distribution (e.g., clustering in time or interference value).
3.  **Observed Patterns and Trends**: Describe any patterns in how nodes form over time or in their interference values.
4.  **Correlation with Parameters (Hypothesize)**: Briefly suggest how the input parameters (threshold, noise level, RNG type, seed if applicable) might have led to the observed results.
5.  **Significance within SubQG Theory**: How do these findings relate to the core concepts of the SubQG model (e.g., emergence from chaos, role of interference, resonance, comparison to critical phenomena if interference values cluster)?
6.  **Suggestions for Further Investigation**: What aspects warrant more detailed study or follow-up simulations based on these results?

Present your analysis in a clear, concise, and scientific tone, using Markdown for structure.
Ensure the language is appropriate for a scientific audience.
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

  const ReportModal: React.FC<{ title: string; content: string | null; isLoading: boolean; onClose: () => void; onDownload?: () => void }> = 
  ({ title: initialTitle, content, isLoading, onClose, onDownload }) => {
    if (!showReportModal) return null; 
    
    let currentLoadingMessage = "Processing...";
    let displayTitle = initialTitle;

    if (isLoading) {
        if (modalContentType === 'markdownReport') {
            displayTitle = "Generating Report...";
            currentLoadingMessage = "Generating scientific analysis via backend...\nThis may take a moment.";
        } else if (modalContentType === 'publicationAnalysis') {
            displayTitle = "Generating Analysis...";
            currentLoadingMessage = "Generating publication-style analysis via backend...\nThis may take a few moments.";
        }
    } else if (geminiContentIsError) {
        displayTitle = "Error";
    }


    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" aria-labelledby="report-modal-title">
        <div className="bg-slate-800 p-6 rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 id="report-modal-title" className="text-xl font-semibold text-sky-400">{displayTitle}</h3>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-200 text-2xl leading-none" aria-label="Close modal">&times;</button>
          </div>
          <div className="overflow-y-auto flex-grow mb-4 pr-2">
            {isLoading ? (
                 <div className="flex flex-col items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mb-4"></div>
                    <p className="text-slate-300 text-center whitespace-pre-wrap">{currentLoadingMessage}</p>
                 </div>
            ) : content ? (
              <pre className={`whitespace-pre-wrap text-sm ${geminiContentIsError ? 'text-red-400' : 'text-slate-200'} bg-slate-900 p-4 rounded-md`}>{content}</pre>
            ) : (
              <p className="text-slate-500">No content to display or an error occurred.</p>
            )}
          </div>
          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-700">
            {onDownload && !isLoading && content && !geminiContentIsError && modalContentType === 'markdownReport' && (
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
          title={
            modalContentType === 'markdownReport' ? "Markdown Report" :
            modalContentType === 'publicationAnalysis' ? "Publication Analysis" :
            "Analysis Results" // Fallback base title
          }
          content={geminiAnalysisContent}
          isLoading={isGeneratingReport || isGeneratingPublicationAnalysis}
          onClose={() => {
            setShowReportModal(false);
            setGeminiAnalysisContent(null); // Clear content when closing
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
