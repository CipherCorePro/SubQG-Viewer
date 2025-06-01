
import React from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ZAxis, Cell } from 'recharts';
import type { Node } from '../types';
import { CHART_NODE_COLOR, CHART_SPIN_PLUS_COLOR, CHART_SPIN_MINUS_COLOR } from '../constants';

interface ClusterTimeMapChartProps {
  data: Node[];
}

export const ClusterTimeMapChart: React.FC<ClusterTimeMapChartProps> = ({ data }) => {
  if (!data || data.length === 0) return <p className="text-slate-500">No node data for cluster time map.</p>;

  // Prepare data for scatter plot, assigning color based on spin
  const scatterData = data.map(node => ({
    ...node,
    color: node.spin === 1 ? CHART_SPIN_PLUS_COLOR : (node.spin === -1 ? CHART_SPIN_MINUS_COLOR : CHART_NODE_COLOR),
  }));

  return (
    <div className="h-96 bg-slate-800 p-4 rounded-lg shadow">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
          <XAxis 
            type="number" 
            dataKey="tick" 
            name="Tick" 
            stroke="#94a3b8" 
            label={{ value: "Simulation Tick", position: 'insideBottom', offset: -15, fill: '#94a3b8' }}
          />
          <YAxis 
            type="number" 
            dataKey="interferenceValue" 
            name="Interference Value" 
            stroke="#94a3b8" 
            domain={['auto', 'auto']}
            label={{ value: "Interference", angle: -90, position: 'insideLeft', fill: '#94a3b8' }}
          />
          {/* ZAxis can be used to control point size if desired, but not strictly necessary for color differentiation */}
          {/* <ZAxis type="number" dataKey="interferenceValue" range={[20, 100]} name="size" unit="" /> */}
          <Tooltip
            cursor={{ strokeDasharray: '3 3' }}
            contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '0.375rem' }}
            labelStyle={{ color: '#e2e8f0' }}
            formatter={(value: any, name: string, props: any) => {
                // The 'props' here refers to the data point object from scatterData
                const payload = props.payload;
                if (name === 'interferenceValue') return [value.toFixed(3), "Interference"];
                if (name === 'tick') return [value, "Tick"];
                // To show spin and topologyType in tooltip, they need to be part of the dataKey or handled via custom tooltip
                if (payload && payload.spin !== undefined) return [payload.spin, "Spin"];
                if (payload && payload.topologyType) return [payload.topologyType, "Type"];
                return [value, name];
            }}
             itemSorter={(item) => { // Ensure consistent tooltip order
                if (item.name === "Tick") return -3;
                if (item.name === "Interference Value") return -2;
                if (item.name === "Spin") return -1;
                return 1;
            }}
          />
           <Legend 
            payload={[
                { value: 'Spin +1', type: 'circle', id: 'ID01', color: CHART_SPIN_PLUS_COLOR },
                { value: 'Spin -1', type: 'circle', id: 'ID02', color: CHART_SPIN_MINUS_COLOR },
                { value: 'Other/No Spin', type: 'circle', id: 'ID03', color: CHART_NODE_COLOR },
            ]}
            wrapperStyle={{ color: '#cbd5e1', paddingTop: '10px' }} 
           />
          <Scatter name="Nodes" data={scatterData} fillOpacity={0.7}>
            {
              scatterData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))
            }
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};