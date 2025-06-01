
import type { SimulationParams } from './types';

export const DEFAULT_SIMULATION_PARAMS: SimulationParams = {
  duration: 100,
  threshold: 0.7,
  noiseLevel: 0.1,
  rngType: 'subqg', // Changed from 'pseudo'
  seed: 42,
  segmentDuration: 10,
  comparativeContext: "", 
};

export const CHART_STROKE_COLOR_ENERGY = '#34d399'; // Emerald 400
export const CHART_STROKE_COLOR_PHASE = '#fbbf24'; // Amber 400
export const CHART_STROKE_COLOR_INTERFERENCE = '#60a5fa'; // Sky 400
export const CHART_NODE_COLOR = '#f472b6'; // Pink 400
export const CHART_SPIN_PLUS_COLOR = '#818cf8'; // Indigo 400
export const CHART_SPIN_MINUS_COLOR = '#f87171'; // Red 400

export const MAX_DATA_POINTS_WAVE_CHART = 200; // Limit points for performance on live chart