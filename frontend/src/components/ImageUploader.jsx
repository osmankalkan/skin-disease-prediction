import React, { useCallback, useState } from 'react';
import { UploadCloud, Image as ImageIcon, Camera, Loader2, X } from 'lucide-react';

export default function ImageUploader({ onImageUpload, isAnalyzing }) {
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState(null);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file) => {
    if (!file.type.match('image.*')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target.result);
      onImageUpload(file);
    };
    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    setPreview(null);
  };

  if (preview) {
    return (
      <div className="relative w-full rounded-2xl overflow-hidden shadow-2xl glass-panel group h-[400px]">
        <img 
          src={preview} 
          alt="Skin Lesion Preview" 
          className="w-full h-full object-contain bg-black/50"
        />
        {isAnalyzing ? (
          <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center backdrop-blur-sm transition-all">
            <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
            <p className="text-xl font-medium text-white tracking-wide animate-pulse">
              Analyzing skin lesion...
            </p>
            <p className="text-sm text-slate-300 mt-2">Running ConvNeXt Tiny Model</p>
          </div>
        ) : (
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
            <button 
              onClick={clearImage}
              className="bg-red-500/80 hover:bg-red-500 text-white p-3 rounded-full shadow-lg transform hover:scale-110 transition-all"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div 
      className={`glass-panel w-full rounded-2xl h-[400px] flex flex-col items-center justify-center p-8 transition-all duration-300 border-2 border-dashed ${
        dragActive ? 'border-primary bg-primary/10 scale-[1.02]' : 'border-slate-600 hover:border-slate-500 hover:bg-white/5'
      }`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(56,189,248,0.3)]">
        <UploadCloud className="w-10 h-10 text-primary" />
      </div>
      
      <h3 className="text-2xl font-semibold mb-2 text-white">Upload Skin Image</h3>
      <p className="text-slate-400 text-center mb-8 max-w-md">
        Drag and drop a clear, well-lit photo of the skin lesion or click to browse files.
      </p>

      <div className="flex gap-4">
        <label className="relative cursor-pointer bg-primary hover:bg-primary/90 text-slate-900 font-semibold py-3 px-6 rounded-xl shadow-lg shadow-primary/25 transition-all hover:scale-105 flex items-center gap-2">
          <ImageIcon className="w-5 h-5" />
          <span>Browse Files</span>
          <input 
            type="file" 
            className="hidden" 
            accept="image/jpeg,image/png,image/webp" 
            onChange={handleChange}
          />
        </label>
      </div>
    </div>
  );
}
