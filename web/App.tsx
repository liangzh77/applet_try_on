import React, { useState } from 'react';
import { Step, ImageItem, HistoryItem } from './types';
import { PRESET_PEOPLE, PRESET_GARMENTS } from './constants';
import TopShowcase from './components/TopShowcase';
import ImageSelector from './components/ImageSelector';
import StepTwoGarment from './components/StepTwoGarment';
import Gallery from './components/Gallery';
import { generateTryOnImage, urlToBase64 } from './services/geminiService';
import { ChevronRight, ChevronLeft, RefreshCw, Loader2, Sparkles } from 'lucide-react';

const App: React.FC = () => {
  const [activeStep, setActiveStep] = useState<Step>(Step.PERSON);
  
  // Data States
  const [people, setPeople] = useState<ImageItem[]>(PRESET_PEOPLE);
  const [garments, setGarments] = useState<ImageItem[]>(PRESET_GARMENTS);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Selection States
  const [selectedPerson, setSelectedPerson] = useState<ImageItem | null>(null);
  const [selectedGarment, setSelectedGarment] = useState<ImageItem | null>(null);
  const [generatedResult, setGeneratedResult] = useState<string | null>(null);

  // Processing State
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handlers
  const handlePersonUpload = (file: File) => {
    const url = URL.createObjectURL(file);
    const newItem: ImageItem = { id: `upload-${Date.now()}`, url };
    setPeople([newItem, ...people]);
    setSelectedPerson(newItem);
  };

  const handleGarmentUpload = (file: File) => {
    const url = URL.createObjectURL(file);
    const newItem: ImageItem = { id: `upload-${Date.now()}`, url };
    setGarments([newItem, ...garments]);
    setSelectedGarment(newItem);
  };

  const handleGenerateTryOn = async () => {
    if (!selectedPerson || !selectedGarment) return;

    setIsProcessing(true);
    setError(null);
    setActiveStep(Step.RESULT);

    try {
      // Convert images to Base64 for the API
      const personB64 = await urlToBase64(selectedPerson.url);
      const garmentB64 = await urlToBase64(selectedGarment.url);

      const resultBase64 = await generateTryOnImage(personB64, garmentB64);

      setGeneratedResult(resultBase64);
      
      // Save to history
      const newHistoryItem: HistoryItem = {
        id: Date.now().toString(),
        personImage: selectedPerson.url,
        garmentImage: selectedGarment.url,
        resultImage: resultBase64,
        timestamp: Date.now(),
      };
      setHistory([newHistoryItem, ...history]);

    } catch (err) {
      console.error(err);
      setError("生成失败。请检查网络或更换图片重试。");
      setActiveStep(Step.GARMENT); // Go back on error
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setActiveStep(Step.PERSON);
    setSelectedPerson(null);
    setSelectedGarment(null);
    setGeneratedResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-primary">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center text-white font-bold">
              AI
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-800">霓裳换装</h1>
          </div>
          <div className="text-xs text-slate-400 font-mono border border-slate-200 px-2 py-1 rounded">
            Powered by Gemini 2.5
          </div>
        </div>
      </header>

      {/* Visualization Area */}
      <div className="bg-gradient-to-b from-slate-50 to-white pt-8">
        <TopShowcase 
          personUrl={selectedPerson?.url || null}
          garmentUrl={selectedGarment?.url || null}
          resultUrl={generatedResult}
          activeStep={activeStep}
        />
      </div>

      {/* Operation Area */}
      <main className="max-w-3xl mx-auto px-4 mt-6">
        
        {/* Navigation Progress */}
        <div className="flex items-center justify-between mb-6 px-2">
           <button 
            onClick={() => activeStep > Step.PERSON && !isProcessing && setActiveStep(Step.PERSON)}
            disabled={activeStep === Step.PERSON || isProcessing}
            className={`text-sm font-medium flex items-center gap-1 ${activeStep > Step.PERSON ? 'text-slate-500 hover:text-primary' : 'text-primary'}`}
           >
             {activeStep > Step.PERSON && <ChevronLeft size={16} />}
             第一步：选人
           </button>
           <div className="h-1 flex-1 mx-4 bg-slate-200 rounded-full overflow-hidden">
             <div 
              className="h-full bg-primary transition-all duration-500 ease-out"
              style={{ width: `${((activeStep - 1) / 2) * 100}%` }} 
             />
           </div>
           <span className={`text-sm font-medium ${activeStep === Step.RESULT ? 'text-primary' : 'text-slate-400'}`}>
             完成
           </span>
        </div>

        {/* Step 1: Select Person */}
        {activeStep === Step.PERSON && (
          <div className="animate-in slide-in-from-left-4 duration-300 fade-in space-y-6">
            <ImageSelector
              title="选择模特 / 上传照片"
              items={people}
              selectedId={selectedPerson?.id || null}
              onSelect={setSelectedPerson}
              onUpload={handlePersonUpload}
            />
            <div className="flex justify-end">
              <button
                onClick={() => setActiveStep(Step.GARMENT)}
                disabled={!selectedPerson}
                className="bg-primary hover:bg-indigo-600 text-white px-8 py-3 rounded-full font-semibold shadow-lg shadow-indigo-200 transition-all disabled:opacity-50 disabled:shadow-none flex items-center gap-2"
              >
                下一步：选择服装 <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Select Garment */}
        {activeStep === Step.GARMENT && (
          <div className="space-y-8">
            {/* Context from Step 1 */}
            {selectedPerson && (
               <div className="flex items-center gap-3 p-3 bg-slate-100 rounded-2xl border border-slate-200 w-fit mx-auto opacity-70">
                  <img src={selectedPerson.url} className="w-8 h-8 rounded-full object-cover" alt="Selected Person" />
                  <span className="text-xs font-medium text-slate-600">已选模特</span>
               </div>
            )}

            <StepTwoGarment
              garments={garments}
              selectedGarmentId={selectedGarment?.id || null}
              onSelect={setSelectedGarment}
              onUpload={handleGarmentUpload}
              onGenerateGarment={(item) => {
                setGarments([item, ...garments]);
                setSelectedGarment(item);
              }}
            />
            
            <div className="flex justify-between pt-4">
               <button
                onClick={() => setActiveStep(Step.PERSON)}
                className="text-slate-500 hover:text-slate-800 font-medium px-4 py-2"
              >
                上一步
              </button>
              <button
                onClick={handleGenerateTryOn}
                disabled={!selectedGarment}
                className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white px-10 py-3 rounded-full font-bold shadow-lg shadow-purple-200 transition-all disabled:opacity-50 disabled:shadow-none flex items-center gap-2 transform hover:scale-105"
              >
                <Sparkles size={18} /> 开始生成试穿
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Result & Loading */}
        {activeStep === Step.RESULT && (
          <div className="text-center py-12 animate-in zoom-in-95 duration-500">
            {isProcessing ? (
              <div className="flex flex-col items-center gap-6">
                 <div className="relative">
                   <div className="w-24 h-24 rounded-full border-4 border-slate-100 border-t-primary animate-spin" />
                   <div className="absolute inset-0 flex items-center justify-center">
                     <Sparkles className="text-secondary animate-pulse" size={32} />
                   </div>
                 </div>
                 <div className="space-y-2">
                   <h3 className="text-xl font-bold text-slate-800">正在编织魔法...</h3>
                   <p className="text-slate-500">AI 正在分析身形并进行试穿 (约需 10-20 秒)</p>
                 </div>
              </div>
            ) : error ? (
              <div className="bg-red-50 text-red-600 p-6 rounded-2xl border border-red-100 max-w-md mx-auto">
                <p className="font-medium mb-4">{error}</p>
                <button 
                  onClick={() => setActiveStep(Step.GARMENT)}
                  className="bg-white border border-red-200 px-4 py-2 rounded-lg text-sm hover:bg-red-50 transition-colors"
                >
                  返回重试
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-8">
                <div className="bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2">
                   <Sparkles size={14} /> 试穿生成成功
                </div>
                <button
                  onClick={handleReset}
                  className="flex items-center gap-2 text-slate-500 hover:text-primary transition-colors"
                >
                  <RefreshCw size={16} /> 再试一次
                </button>
              </div>
            )}
          </div>
        )}

      </main>

      {/* History Gallery */}
      <Gallery history={history} />

    </div>
  );
};

export default App;