
import React from 'react';
import type { SimulationParams, RNGType } from '../types';

interface ConfigurationPanelProps {
  params: SimulationParams;
  onParamsChange: (newParams: Partial<SimulationParams>) => void;
  isRunning: boolean;
  // New props for actions
  onExportJSON: () => void;
  onExportCSV: () => void;
  onGenerateMarkdownReport: () => void;
  isGeneratingReport: boolean;
  onGeneratePublicationAnalysis: () => void;
  isGeneratingPublicationAnalysis: boolean;
}

export const ConfigurationPanel: React.FC<ConfigurationPanelProps> = ({ 
    params, 
    onParamsChange, 
    isRunning,
    onExportJSON,
    onExportCSV,
    onGenerateMarkdownReport,
    isGeneratingReport,
    onGeneratePublicationAnalysis,
    isGeneratingPublicationAnalysis
}) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    let processedValue: string | number = value;
    if (type === 'number' || e.target.dataset.type === 'number') {
        processedValue = value === '' ? '' : parseFloat(value);
        if (name === 'seed' && value === '') {
             onParamsChange({ [name]: undefined });
             return;
        }
         if (name === 'seed' && !isNaN(Number(value))) {
            processedValue = parseInt(value, 10);
        }
    }
    onParamsChange({ [name]: processedValue });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-sky-400 border-b border-slate-700 pb-2">Configuration</h2>
        
        <div>
          <label htmlFor="duration" className="block text-sm font-medium text-slate-300 mb-1 mt-4">Duration (Ticks)</label>
          <input
            type="number"
            name="duration"
            id="duration"
            value={params.duration}
            onChange={handleInputChange}
            data-type="number"
            min="10"
            max="1000"
            step="10"
            disabled={isRunning}
            className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 text-slate-100 disabled:opacity-50"
          />
        </div>

        <div>
          <label htmlFor="threshold" className="block text-sm font-medium text-slate-300 mb-1 mt-4">Node Threshold ({params.threshold.toFixed(2)})</label>
          <input
            type="range"
            name="threshold"
            id="threshold"
            value={params.threshold}
            onChange={handleInputChange}
            data-type="number"
            min="0.1"
            max="1.0"
            step="0.01"
            disabled={isRunning}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-500 disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        <div>
          <label htmlFor="noiseLevel" className="block text-sm font-medium text-slate-300 mb-1 mt-4">Noise Level ({params.noiseLevel.toFixed(2)})</label>
          <input
            type="range"
            name="noiseLevel"
            id="noiseLevel"
            value={params.noiseLevel}
            onChange={handleInputChange}
            data-type="number"
            min="0.0"
            max="0.5"
            step="0.01"
            disabled={isRunning}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-500 disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        <div>
          <label htmlFor="rngType" className="block text-sm font-medium text-slate-300 mb-1 mt-4">RNG Type</label>
          <select
            name="rngType"
            id="rngType"
            value={params.rngType}
            onChange={handleInputChange}
            disabled={isRunning}
            className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 text-slate-100 disabled:opacity-50"
          >
            <option value="pseudo">Pseudo RNG</option>
            <option value="quantum">Quantum RNG (Simulated)</option>
          </select>
        </div>

        {params.rngType === 'pseudo' && (
          <div>
            <label htmlFor="seed" className="block text-sm font-medium text-slate-300 mb-1 mt-4">Seed (for Pseudo RNG)</label>
            <input
              type="number"
              name="seed"
              id="seed"
              value={params.seed === undefined ? '' : params.seed}
              onChange={handleInputChange}
              data-type="number"
              disabled={isRunning}
              placeholder="Random if empty"
              className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 text-slate-100 disabled:opacity-50"
            />
          </div>
        )}
        <div>
          <label htmlFor="segmentDuration" className="block text-sm font-medium text-slate-300 mb-1 mt-4">Analysis Segment Duration (Ticks)</label>
          <input
            type="number"
            name="segmentDuration"
            id="segmentDuration"
            value={params.segmentDuration}
            onChange={handleInputChange}
            data-type="number"
            min="1"
            max="100"
            step="1"
            disabled={isRunning}
            className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 text-slate-100 disabled:opacity-50"
          />
        </div>
      </div>
      
      {/* Actions Section */}
      <div className="pt-6 border-t border-slate-700">
        <h2 className="text-xl font-semibold text-sky-400 border-b border-slate-700 pb-2 mb-4">Actions</h2>
        <div className="space-y-3">
          <button
            onClick={onExportJSON}
            disabled={isRunning || isGeneratingReport || isGeneratingPublicationAnalysis}
            className="w-full px-3 py-2.5 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-md disabled:opacity-60 disabled:cursor-not-allowed font-medium transition-colors"
            aria-label="Export node data to JSON"
          >
            Export Nodes to JSON
          </button>
          <button
            onClick={onExportCSV}
            disabled={isRunning || isGeneratingReport || isGeneratingPublicationAnalysis}
            className="w-full px-3 py-2.5 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-md disabled:opacity-60 disabled:cursor-not-allowed font-medium transition-colors"
            aria-label="Export node data to CSV"
          >
            Export Nodes to CSV
          </button>
          <button
            onClick={onGenerateMarkdownReport}
            disabled={isRunning || isGeneratingReport || isGeneratingPublicationAnalysis}
            className="w-full px-3 py-2.5 text-sm bg-teal-600 hover:bg-teal-700 text-white rounded-md disabled:opacity-60 disabled:cursor-not-allowed font-medium transition-colors flex items-center justify-center"
            aria-label="Generate Markdown report with Gemini analysis"
          >
            {isGeneratingReport && <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-r-2 border-white mr-2"></span>}
            Generate Report (Gemini)
          </button>
          <button
            onClick={onGeneratePublicationAnalysis}
            disabled={isRunning || isGeneratingPublicationAnalysis || isGeneratingReport}
            className="w-full px-3 py-2.5 text-sm bg-purple-600 hover:bg-purple-700 text-white rounded-md disabled:opacity-60 disabled:cursor-not-allowed font-medium transition-colors flex items-center justify-center"
            aria-label="Generate publication-style analysis with Gemini"
          >
             {isGeneratingPublicationAnalysis && <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-r-2 border-white mr-2"></span>}
            Publication Analysis (Gemini)
          </button>
        </div>
        <p className="text-xs text-slate-500 mt-3">
            Gemini features require API Key. Reports may take a moment. Data export uses currently formed nodes.
        </p>
      </div>
    </div>
  );
};
