import React from 'react';
import { Info, Stethoscope, AlertTriangle } from 'lucide-react';

export default function DiseaseDetails({ info }) {
  if (!info) return null;

  return (
    <div className="glass-panel rounded-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-1000 mt-6">
      <div className="border-b border-white/5 bg-white/5 p-6 flex items-center gap-3">
        <Info className="w-6 h-6 text-primary" />
        <h3 className="text-xl font-semibold text-white">Clinical Insights</h3>
      </div>
      
      <div className="p-6 md:p-8 space-y-6">
        
        <div className="bg-slate-800/40 rounded-xl p-5 border border-slate-700/50 flex gap-4 items-start">
          <div className="bg-primary/20 p-3 rounded-lg shrink-0">
            <Stethoscope className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h4 className="text-white font-medium mb-1 text-lg">Medical Advice</h4>
            <p className="text-slate-300 leading-relaxed">
              {info.advice}
            </p>
          </div>
        </div>

        <div className="bg-red-950/20 rounded-xl p-5 border border-red-900/30 flex gap-4 items-start">
          <div className="bg-red-500/20 p-3 rounded-lg shrink-0">
            <AlertTriangle className="w-6 h-6 text-red-400" />
          </div>
          <div>
            <h4 className="text-white font-medium mb-1 text-lg">Medical Disclaimer</h4>
            <p className="text-slate-400 text-sm leading-relaxed">
              This AI application is designed for educational and decision-support purposes only. It is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
