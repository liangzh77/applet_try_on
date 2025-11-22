import React, { useState } from 'react';
import { ImageItem } from '../types';
import ImageSelector from './ImageSelector';
import { Wand2, Loader2 } from 'lucide-react';
import { generateGarmentImage } from '../services/geminiService';

interface StepTwoProps {
  garments: ImageItem[];
  selectedGarmentId: string | null;
  onSelect: (item: ImageItem) => void;
  onUpload: (file: File) => void;
  onGenerateGarment: (item: ImageItem) => void;
}

const StepTwoGarment: React.FC<StepTwoProps> = ({
  garments,
  selectedGarmentId,
  onSelect,
  onUpload,
  onGenerateGarment
}) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    setError(null);
    
    try {
      const base64Image = await generateGarmentImage(prompt);
      const newItem: ImageItem = {
        id: `gen-${Date.now()}`,
        url: base64Image,
        isGenerated: true
      };
      onGenerateGarment(newItem);
      setPrompt('');
    } catch (err) {
      setError("AI生成衣服失败，请重试。");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500 fade-in">
      {/* AI Generation Input */}
      <div className="bg-gradient-to-r from-violet-50 to-fuchsia-50 rounded-3xl p-6 border border-violet-100">
        <h3 className="text-lg font-bold text-violet-900 mb-3 flex items-center gap-2">
          <Wand2 className="text-violet-600" size={20} />
          AI 设计服装 (Nano Banana)
        </h3>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="输入描述，例如：一件红色的丝绸晚礼服，复古风格..."
            className="flex-1 px-4 py-3 rounded-xl border border-violet-200 focus:outline-none focus:ring-2 focus:ring-violet-500/50 bg-white"
            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
          />
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="px-6 py-3 rounded-xl bg-violet-600 text-white font-medium shadow-lg shadow-violet-200 hover:bg-violet-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[120px]"
          >
            {isGenerating ? (
              <>
                <Loader2 size={18} className="animate-spin mr-2" />
                设计中
              </>
            ) : (
              '生成衣服'
            )}
          </button>
        </div>
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      </div>

      {/* Selection Grid */}
      <ImageSelector
        title="选择或上传服装"
        items={garments}
        selectedId={selectedGarmentId}
        onSelect={onSelect}
        onUpload={onUpload}
      />
    </div>
  );
};

export default StepTwoGarment;