
import type { Node, AnalysisData, NodeCountSegment, SimulationParams } from '../types';

export const analyzeData = (nodes: Node[], duration: number, segmentDurationParam?: number): AnalysisData => {
  const segmentDuration = segmentDurationParam ?? 10; // Default if not provided by params

  // Node counts per segment
  const nodeCountsPerSegment: NodeCountSegment[] = [];
  const numSegments = Math.ceil(duration / segmentDuration);

  for (let i = 0; i < numSegments; i++) {
    const segmentStartTick = i * segmentDuration;
    const segmentEndTick = segmentStartTick + segmentDuration;
    const count = nodes.filter(node => node.tick >= segmentStartTick && node.tick < segmentEndTick).length;
    nodeCountsPerSegment.push({ segmentStartTick, count });
  }

  // Riemann data: Use interference values of formed nodes as proxy for Re(s)
  const riemannData = nodes.map(node => node.interferenceValue);

  return {
    nodeCountsPerSegment,
    riemannData,
    totalNodes: nodes.length,
    clusterTimeMapData: nodes, // Pass all nodes for the cluster time map
  };
};