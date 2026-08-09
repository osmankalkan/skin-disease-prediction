import React, { useState } from 'react';
import { Stethoscope, AlertCircle, RefreshCw } from 'lucide-react';
import ImageUploader from './components/ImageUploader';
import AnalysisResults from './components/AnalysisResults';
import DiseaseDetails from './components/DiseaseDetails';

function App() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);

  const handleImageUpload = async (file) => {
    setIsAnalyzing(true);
    setError(null);
    setResults(null);
    
    // Create local object URL for immediate display
    const objectUrl = URL.createObjectURL(file);
    setUploadedImage(objectUrl);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:8000/api/predict', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Analysis failed. Please try again.');
      }

      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError(err.message || 'Failed to connect to the AI engine.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetAnalysis = () => {
    setResults(null);
    setError(null);
    setUploadedImage(null);
  };

  return (
    <div className="min-h-screen bg-background text-slate-100 font-sans selection:bg-primary/30 selection:text-primary-200 overflow-x-hidden relative">
      
      {/* Background Decorative Elements */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-accent/20 blur-[120px] pointer-events-none" />
      
      {/* Header */}
      <header className="border-b border-white/5 bg-surface/40 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
              <Stethoscope className="w-6 h-6 text-slate-900" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Dermo<span className="text-primary">AI</span></h1>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
            <a href="#" className="hover:text-white transition-colors">Dashboard</a>
            <a href="#" className="hover:text-white transition-colors">Sample Gallery</a>
            <a href="#" className="hover:text-white transition-colors">About Model</a>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12 relative z-10">
        
        <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
            Advanced Skin Lesion <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">Analysis</span>
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg">
            Powered by PyTorch ConvNeXt architecture. Upload an image to instantly analyze across 22 skin conditions with Grad-CAM visualization.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Uploader */}
          <div className={`lg:col-span-${results ? '5' : '12 max-w-3xl mx-auto w-full'} transition-all duration-700`}>
            <ImageUploader 
              onImageUpload={handleImageUpload} 
              isAnalyzing={isAnalyzing} 
            />
            
            {results && (
              <button 
                onClick={resetAnalysis}
                className="w-full mt-4 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-white/10 hover:bg-white/5 transition-colors text-slate-300 font-medium"
              >
                <RefreshCw className="w-5 h-5" />
                Analyze Another Image
              </button>
            )}

            {error && (
              <div className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-start gap-3 animate-in fade-in">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}
          </div>

          {/* Right Column: Results */}
          {results && (
            <div className="lg:col-span-7 space-y-8">
              <AnalysisResults results={results} imageUrl={uploadedImage} />
              <DiseaseDetails info={results.top_prediction.info} />
            </div>
          )}

        </div>
      </main>

    </div>
  );
}

export default App;
