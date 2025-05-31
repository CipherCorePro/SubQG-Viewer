
import React, { useRef, useEffect } from 'react';
import type { AnalysisData, SimulationParams } from '../types';
import { NodeCountChart } from './NodeCountChart';
import { RiemannHistogramChart } from './RiemannHistogramChart';

interface AnalysisViewProps {
  analysisData: AnalysisData;
  params: SimulationParams;
  onChartRendered?: (chartType: 'nodeCount' | 'riemann', svgContent: string | null) => void;
}

export const AnalysisView: React.FC<AnalysisViewProps> = ({ analysisData, params, onChartRendered }) => {
  const nodeCountChartRef = useRef<HTMLDivElement>(null);
  const riemannChartRef = useRef<HTMLDivElement>(null);

  const getSVGContent = (ref: React.RefObject<HTMLDivElement>): string | null => {
    if (ref.current) {
      const svgElement = ref.current.querySelector('svg');
      if (svgElement) {
        // Create a clone to avoid modifying the original
        const clone = svgElement.cloneNode(true) as SVGSVGElement;
        // Ensure width and height are set for standalone SVG viewing
        if (!clone.getAttribute('width')) clone.setAttribute('width', '600'); // Default width
        if (!clone.getAttribute('height')) clone.setAttribute('height', '400'); // Default height
        // Add XML namespace if missing for proper SVG rendering outside HTML
        if (!clone.getAttribute('xmlns')) clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        return clone.outerHTML;
      }
    }
    return null;
  };

  useEffect(() => {
    if (onChartRendered) {
      // Use a timeout to ensure charts are fully rendered after data update
      const timer = setTimeout(() => {
        onChartRendered('nodeCount', getSVGContent(nodeCountChartRef));
        onChartRendered('riemann', getSVGContent(riemannChartRef));
      }, 500); // Adjust delay if necessary
      return () => clearTimeout(timer);
    }
  }, [analysisData, onChartRendered]);

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-xl font-semibold text-sky-400 mb-1">Analysis Results</h3>
        <p className="text-sm text-slate-400 mb-4">
          Total Nodes Formed: <span className="font-bold text-sky-300">{analysisData.totalNodes}</span>
        </p>
      </div>
      <div ref={nodeCountChartRef}>
        <h4 className="text-lg font-semibold text-sky-300 mb-3">Node Counts per Segment (Segment Duration: {params.segmentDuration} Ticks)</h4>
        {analysisData.nodeCountsPerSegment.length > 0 ? (
          <NodeCountChart data={analysisData.nodeCountsPerSegment} />
        ) : (
          <p className="text-slate-500">No node count data available.</p>
        )}
      </div>
      <div ref={riemannChartRef}>
        <h4 className="text-lg font-semibold text-sky-300 mb-3">Riemann Hypothesis Proxy (Distribution of Node Interference Values)</h4>
        <p className="text-xs text-slate-500 mb-2">
          This histogram shows the distribution of interference values for all formed nodes.
          The SubQG theory suggests a comparison with Re(s) ≈ 0.5. The vertical line indicates this critical value.
        </p>
        {analysisData.riemannData.length > 0 ? (
          <RiemannHistogramChart data={analysisData.riemannData} criticalLine={0.5} threshold={params.threshold} />
        ) : (
          <p className="text-slate-500">No data for Riemann histogram.</p>
        )}
      </div>
    </div>
  );
};
