// This file is no longer used for direct Gemini SDK interaction
// as it has been moved to the backend server.
// It can be removed or repurposed for other utility functions if needed.

// Example of how you might keep it for formatting prompts if App.tsx becomes too cluttered,
// though for now, prompt formatting is moved directly into App.tsx for simplicity with the new backend calls.

/*
import type { SimulationParams, Node, AnalysisData } from '../types';

export function formatSimulationDataForScientificPrompt(
  params: SimulationParams,
  nodes: Node[],
  analysis: AnalysisData,
  chartSVGs?: { nodeCountSVG?: string; riemannSVG?: string }
): string {
  // ... (prompt formatting logic can be moved here from App.tsx) ...
  return "Formatted prompt for scientific analysis";
}

export function formatSimulationDataForPublicationPrompt(
  params: SimulationParams,
  allNodes: Node[]
): string {
  // ... (prompt formatting logic can be moved here from App.tsx) ...
  return "Formatted prompt for publication analysis";
}
*/

// For now, leaving it nearly empty to signify the change.
export {};
