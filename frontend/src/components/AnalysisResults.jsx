import React, { useState } from 'react';
import { ShieldAlert, ShieldCheck, Shield, Activity, Layers } from 'lucide-react';

export default function AnalysisResults({ results, imageUrl }) {
  const [heatmapOpacity, setHeatmapOpacity] = useState(60);

  if (!results || !results.predictions) return null;

  const { top_prediction, predictions, heatmap } = results;

  const getRiskColor = (severity) => {
    switch (severity) {
      case 'High Risk': return 'text-red-400 border-red-500/30 bg-red-500/10 shadow-[0_0_20px_rgba(248,113,113,0.2)]';
      case 'Moderate Risk': return 'text-amber-400 border-amber-500/30 bg-amber-500/10 shadow-[0_0_20px_rgba(251,191,36,0.2)]';
      default: return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10 shadow-[0_0_20px_rgba(52,211,153,0.2)]';
    }
  };

  const getRiskIcon = (severity) => {
    switch (severity) {
      case 'High Risk': return <ShieldAlert className="w-8 h-8 text-red-400" />;
      case 'Moderate Risk': return <Shield className="w-8 h-8 text-amber-400" />;
      default: return <ShieldCheck className="w-8 h-8 text-emerald-400" />;
    }
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Top Prediction Card */}
      <div className="glass-panel rounded-2xl p-6 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
          <Activity className="w-32 h-32 text-primary" />
        </div>
        
        <div className="relative z-10">
          <p className="text-sm font-medium text-slate-400 uppercase tracking-widest mb-1">Primary Diagnosis</p>
          <div className="flex items-end gap-4 mb-4">
            <h2 className="text-4xl font-bold text-white bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
              {top_prediction.class_name}
            </h2>
            <span className="text-2xl font-light text-slate-300 mb-1">
              {(top_prediction.probability * 100).toFixed(1)}%
            </span>
          </div>

          <div className={`inline-flex items-center gap-3 px-4 py-2 rounded-full border ${getRiskColor(top_prediction.info.severity)}`}>
            {getRiskIcon(top_prediction.info.severity)}
            <span className="font-semibold">{top_prediction.info.severity}</span>
          </div>
        </div>
      </div>

      {/* Heatmap & Probabilities Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Heatmap Visualizer */}
        {heatmap && imageUrl && (
          <div className="glass-panel rounded-2xl p-6 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2 text-white">
                <Layers className="w-5 h-5 text-primary" />
                AI Attention Heatmap
              </h3>
            </div>
            
            <div className="relative w-full flex-grow rounded-xl overflow-hidden bg-black aspect-square">
              <img src={imageUrl} alt="Original" className="absolute inset-0 w-full h-full object-contain" />
              <img 
                src={heatmap} 
                alt="Grad-CAM Heatmap" 
                className="absolute inset-0 w-full h-full object-contain transition-opacity duration-200"
                style={{ opacity: heatmapOpacity / 100, mixBlendMode: 'screen' }}
              />
            </div>
            
            <div className="mt-4 flex items-center gap-4">
              <span className="text-sm text-slate-400">Image</span>
              <input 
                type="range" 
                min="0" max="100" 
                value={heatmapOpacity} 
                onChange={(e) => setHeatmapOpacity(e.target.value)}
                className="flex-grow accent-primary cursor-pointer"
              />
              <span className="text-sm text-primary font-medium">Heatmap</span>
            </div>
          </div>
        )}

        {/* Top 5 Probabilities */}
        <div className="glass-panel rounded-2xl p-6 flex flex-col">
          <h3 className="text-lg font-semibold mb-6 text-white">Probability Breakdown</h3>
          <div className="space-y-4 flex-grow flex flex-col justify-center">
            {predictions.map((pred, idx) => (
              <div key={idx} className="relative">
                <div className="flex justify-between text-sm mb-1">
                  <span className={idx === 0 ? "text-white font-medium" : "text-slate-300"}>
                    {pred.class_name}
                  </span>
                  <span className={idx === 0 ? "text-primary font-bold" : "text-slate-400"}>
                    {(pred.probability * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-slate-800/50 rounded-full h-2.5 overflow-hidden">
                  <div 
                    className={`h-2.5 rounded-full ${idx === 0 ? 'bg-gradient-to-r from-primary to-accent shadow-[0_0_10px_rgba(56,189,248,0.5)]' : 'bg-slate-600'}`}
                    style={{ width: `${pred.probability * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
