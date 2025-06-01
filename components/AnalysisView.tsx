
import React, { useRef, useEffect } from 'react';
import type { AnalysisData, SimulationParams } from '../types';
import { NodeCountChart } from './NodeCountChart';
import { RiemannHistogramChart } from './RiemannHistogramChart';
import { ClusterTimeMapChart } from './ClusterTimeMapChart'; // Import new chart

interface AnalysisViewProps {
  analysisData: AnalysisData;
  params: SimulationParams;
  onChartRendered?: (chartType: 'nodeCount' | 'riemann' | 'clusterTimeMap', svgContent: string | null) => void;
}

export const AnalysisView: React.FC<AnalysisViewProps> = ({ analysisData, params, onChartRendered }) => {
  const nodeCountChartRef = useRef<HTMLDivElement>(null);
  const riemannChartRef = useRef<HTMLDivElement>(null);
  const clusterTimeMapChartRef = useRef<HTMLDivElement>(null); // Ref for the new chart

  const getSVGContent = (ref: React.RefObject<HTMLDivElement>): string | null => {
    if (ref.current) {
      const svgElement = ref.current.querySelector('svg');
      if (svgElement) {
        const clone = svgElement.cloneNode(true) as SVGSVGElement;
        // Ensure essential attributes for standalone SVG rendering
        if (!clone.getAttribute('xmlns')) clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        
        // Recharts often uses specific class names for styling that might not be globally available.
        // It's generally better to rely on inline styles set by Recharts or ensure global styles are compatible.
        // For simplicity, we'll set a default background if none is present, assuming dark theme.
        if (!clone.style.backgroundColor) {
            // Check if the parent of the SVG (the chart wrapper) has a dark background
            let parent = svgElement.parentElement;
            let bgColor = 'rgb(30, 41, 59)'; // slate-800
            while(parent){
                const parentBg = window.getComputedStyle(parent).backgroundColor;
                if(parentBg && parentBg !== 'rgba(0, 0, 0, 0)' && parentBg !== 'transparent'){
                    bgColor = parentBg;
                    break;
                }
                parent = parent.parentElement;
            }
            clone.style.backgroundColor = bgColor;
        }


        let computedWidth = clone.getAttribute('width');
        let computedHeight = clone.getAttribute('height');

        if (!computedWidth || computedWidth === '100%') {
            computedWidth = ref.current.offsetWidth ? `${ref.current.offsetWidth}px` : '600px';
        }
        if (!computedHeight || computedHeight === '100%') {
            computedHeight = ref.current.offsetHeight ? `${ref.current.offsetHeight}px` : '400px';
        }
        clone.setAttribute('width', computedWidth);
        clone.setAttribute('height', computedHeight);


        return new XMLSerializer().serializeToString(clone);
      }
    }
    return null;
  };

  useEffect(() => {
    if (onChartRendered) {
      const timer = setTimeout(() => {
        onChartRendered('nodeCount', getSVGContent(nodeCountChartRef));
        onChartRendered('riemann', getSVGContent(riemannChartRef));
        onChartRendered('clusterTimeMap', getSVGContent(clusterTimeMapChartRef)); // Capture new chart
      }, 700); // Increased timeout slightly for potentially more complex charts
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
         {params.comparativeContext && (
          <p className="text-xs text-slate-400 mb-2 ">
            <span className="font-semibold">Comparative Context:</span> <span className="italic">{params.comparativeContext}</span>
          </p>
        )}
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
          Distribution of interference values for all formed nodes.
          A comparison with Re(s) ≈ 0.5 is suggested by SubQG theory. Vertical line indicates this.
        </p>
        {analysisData.riemannData.length > 0 ? (
          <RiemannHistogramChart data={analysisData.riemannData} criticalLine={0.5} threshold={params.threshold} />
        ) : (
          <p className="text-slate-500">No data for Riemann histogram.</p>
        )}
      </div>
      <div ref={clusterTimeMapChartRef}> {/* New chart section */}
        <h4 className="text-lg font-semibold text-sky-300 mb-3">Cluster Time Map (Nodes: Tick vs. Interference)</h4>
         <p className="text-xs text-slate-500 mb-2">
          Shows each node's formation tick against its interference value. Points are colored by spin.
        </p>
        {analysisData.clusterTimeMapData && analysisData.clusterTimeMapData.length > 0 ? (
          <ClusterTimeMapChart data={analysisData.clusterTimeMapData} />
        ) : (
          <p className="text-slate-500">No data for Cluster Time Map.</p>
        )}
      </div>
    </div>
  );
};