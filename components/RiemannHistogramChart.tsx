
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Label } from 'recharts';
import { CHART_STROKE_COLOR_INTERFERENCE } from '../constants';

interface RiemannHistogramChartProps {
  data: number[]; // Array of Re(s) proxy values
  criticalLine: number;
  threshold: number;
}

// Helper to create histogram data
const createHistogramData = (values: number[], numBins: number, minVal: number, maxVal: number) => {
  if (values.length === 0) return [];
  
  // Handle edge case where minVal is greater or equal to maxVal
  if (minVal >= maxVal) {
    // If all values are effectively the same, or range is zero/invalid
    // Create a single bin representing this value range
    const singleBinName = `${minVal.toFixed(2)}-${maxVal.toFixed(2)}`;
    return [{
        rangeStart: parseFloat(minVal.toFixed(3)),
        name: singleBinName,
        count: values.filter(v => v >= minVal && v <= maxVal).length // Count values within this specific point/range
    }];
  }

  const binSize = (maxVal - minVal) / numBins;
  const bins = Array(numBins).fill(0).map((_, i) => ({
    rangeStart: parseFloat((minVal + i * binSize).toFixed(3)), // Store numeric start for sorting
    name: `${(minVal + i * binSize).toFixed(2)}-${(minVal + (i + 1) * binSize).toFixed(2)}`,
    count: 0,
  }));

  values.forEach(value => {
    if (value >= minVal && value <= maxVal) {
      let binIndex = Math.floor((value - minVal) / binSize);
      // Handle edge case where value is exactly maxVal
      if (binIndex >= numBins) binIndex = numBins - 1;
      
      // Ensure binIndex is valid (it should be if minVal < maxVal)
      if (bins[binIndex]) {
        bins[binIndex].count++;
      }
    }
  });
  return bins;
};

export const RiemannHistogramChart: React.FC<RiemannHistogramChartProps> = ({ data, criticalLine, threshold }) => {
  if (!data || data.length === 0) return <p className="text-slate-500">No Riemann data to display.</p>;

  const numBins = 15; 
  const minVal = threshold;
  // Ensure maxVal is at least slightly larger than minVal if all data points are at minVal,
  // or correctly use the actual max if data exists and is greater.
  // This also handles the case where data might be empty, defaulting maxVal to 1.0.
  const dataMax = data.length > 0 ? Math.max(...data) : minVal;
  const maxVal = Math.max(minVal + 0.001, dataMax, 1.0); // Ensure maxVal > minVal, and at least 1.0 or actual data max
  
  const histogramData = createHistogramData(data, numBins, minVal, maxVal);

  return (
    <div className="h-80 bg-slate-800 p-4 rounded-lg shadow">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={histogramData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
          <XAxis dataKey="name" name="Interference Value (Re(s) Proxy)" stroke="#94a3b8" angle={-30} textAnchor="end" height={50} />
          <YAxis allowDecimals={false} stroke="#94a3b8" />
          <Tooltip
            contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '0.375rem' }}
            labelStyle={{ color: '#e2e8f0' }}
            itemStyle={{ color: CHART_STROKE_COLOR_INTERFERENCE }}
          />
          <Bar dataKey="count" name="Frequency" fill={CHART_STROKE_COLOR_INTERFERENCE} radius={[4, 4, 0, 0]} />
          <ReferenceLine 
            // For a categorical XAxis, direct numerical placement is tricky.
            // This attempts to place it visually if a bin starts near criticalLine.
            // A more robust solution would involve custom logic or a numerical XAxis.
            x={histogramData.find(bin => bin.rangeStart <= criticalLine && (bin.rangeStart + (maxVal-minVal)/numBins) > criticalLine)?.name || criticalLine.toString()} 
            stroke="#f87171" 
            strokeDasharray="4 4"
            ifOverflow="extendDomain"
          >
            <Label value={`Re(s) = ${criticalLine}`} position="insideTopRight" fill="#f87171" fontSize={12} />
          </ReferenceLine>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
