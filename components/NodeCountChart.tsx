
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { NodeCountSegment } from '../types';
import { CHART_NODE_COLOR } from '../constants';

interface NodeCountChartProps {
  data: NodeCountSegment[];
}

export const NodeCountChart: React.FC<NodeCountChartProps> = ({ data }) => {
  if (!data || data.length === 0) return <p className="text-slate-500">No node count data to display.</p>;

  return (
    <div className="h-80 bg-slate-800 p-4 rounded-lg shadow">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
          <XAxis dataKey="segmentStartTick" name="Tick Segment Start" stroke="#94a3b8" />
          <YAxis allowDecimals={false} stroke="#94a3b8" />
          <Tooltip
            contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '0.375rem' }}
            labelStyle={{ color: '#e2e8f0' }}
            itemStyle={{ color: CHART_NODE_COLOR }}
          />
          <Legend wrapperStyle={{ color: '#cbd5e1' }} />
          <Bar dataKey="count" name="Nodes Formed" fill={CHART_NODE_COLOR} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
