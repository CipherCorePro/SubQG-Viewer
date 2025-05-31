
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { TickData } from '../types';
import { CHART_STROKE_COLOR_ENERGY, CHART_STROKE_COLOR_PHASE, CHART_STROKE_COLOR_INTERFERENCE } from '../constants';

interface WaveChartProps {
  data: TickData[];
}

export const WaveChart: React.FC<WaveChartProps> = ({ data }) => {
  if (!data || data.length === 0) return <p className="text-slate-500">No wave data to display.</p>;
  
  return (
    <div className="h-96 bg-slate-800 p-4 rounded-lg shadow">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#475569" /> {/* slate-600 */}
          <XAxis dataKey="tick" stroke="#94a3b8" /> {/* slate-400 */}
          <YAxis domain={[-1, 1]} stroke="#94a3b8" /> {/* slate-400 */}
          <Tooltip
            contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '0.375rem' }} // slate-800, slate-700
            labelStyle={{ color: '#e2e8f0' }} // slate-200
            itemStyle={{ color: '#cbd5e1' }} // slate-300
          />
          <Legend wrapperStyle={{ color: '#cbd5e1' }} /> {/* slate-300 */}
          <Line type="monotone" dataKey="energyWave" name="Energy Wave" stroke={CHART_STROKE_COLOR_ENERGY} strokeWidth={2} dot={false} isAnimationActive={false}/>
          <Line type="monotone" dataKey="phaseWave" name="Phase Wave" stroke={CHART_STROKE_COLOR_PHASE} strokeWidth={2} dot={false} isAnimationActive={false}/>
          <Line type="monotone" dataKey="interference" name="Interference" stroke={CHART_STROKE_COLOR_INTERFERENCE} strokeWidth={2} dot={false} isAnimationActive={false}/>
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
