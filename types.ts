
export type RNGType = 'pseudo' | 'quantum';

export interface SimulationParams {
  duration: number;
  threshold: number;
  noiseLevel: number;
  rngType: RNGType;
  seed?: number;
  segmentDuration: number; // For node counting analysis
}

export interface Node {
  tick: number;
  interferenceValue: number;
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
}

export interface RNG {
  next(): number;
}
