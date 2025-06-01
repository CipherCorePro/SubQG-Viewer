
export type RNGType = 'subqg' | 'quantum';

export interface SimulationParams {
  duration: number;
  threshold: number;
  noiseLevel: number;
  rngType: RNGType;
  seed?: number;
  segmentDuration: number; // For node counting analysis
  comparativeContext?: string; // For CDT/GFT comparison notes
}

export interface Node {
  tick: number;
  interferenceValue: number;
  spin?: number; // e.g., +1 or -1
  topologyType?: string; // e.g., 'TypeA', 'TypeB'
}

export interface TickData {
  tick: number;
  energyWave: number;
  phaseWave: number;
  interference: number;
  node: Node | null;
}

export interface NodeCountSegment {
  segmentStartTick: number;
  count: number;
}

export interface AnalysisData {
  nodeCountsPerSegment: NodeCountSegment[];
  riemannData: number[]; // Array of Re(s) proxy values for histogram
  totalNodes: number;
  clusterTimeMapData: Node[]; // For the new ClusterTimeMapChart
}

export interface RNG {
  next(): number;
  getState?(): any;
  setState?(state: any): void;
}