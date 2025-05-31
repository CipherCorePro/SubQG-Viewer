
import React from 'react';
import type { TickData, Node } from '../types';
import { WaveChart } from './WaveChart';
import { CHART_NODE_COLOR, MAX_DATA_POINTS_WAVE_CHART } from '../constants';

interface SimulationViewProps {
  tickData: TickData[];
  formedNodes: Node[];
}

export const SimulationView: React.FC<SimulationViewProps> = ({ tickData, formedNodes }) => {
  const recentTickData = tickData.slice(-MAX_DATA_POINTS_WAVE_CHART);

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-xl font-semibold text-sky-400 mb-4">Wave Dynamics</h3>
        {tickData.length === 0 ? (
          <p className="text-slate-500">Simulation not started or no data yet.</p>
        ) : (
          <WaveChart data={recentTickData} />
        )}
      </div>
      <div>
        <h3 className="text-xl font-semibold text-sky-400 mb-4">Formed Nodes ({formedNodes.length})</h3>
        {formedNodes.length === 0 ? (
          <p className="text-slate-500">No nodes formed yet.</p>
        ) : (
          <div className="max-h-80 overflow-y-auto bg-slate-800 p-4 rounded-lg shadow">
            <ul className="space-y-2">
              {formedNodes.map((node, index) => (
                <li key={index} className="text-sm p-2 bg-slate-700 rounded">
                  Tick: <span className="font-semibold text-sky-400">{node.tick}</span>, 
                  Interference: <span style={{ color: CHART_NODE_COLOR }} className="font-semibold">{node.interferenceValue.toFixed(3)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};
