import React from 'react';
import { Step } from '../types';
import { User, Shirt, Sparkles } from 'lucide-react';

interface TopShowcaseProps {
  personUrl: string | null;
  garmentUrl: string | null;
  resultUrl: string | null;
  activeStep: Step;
}

const TopShowcase: React.FC<TopShowcaseProps> = ({ personUrl, garmentUrl, resultUrl, activeStep }) => {
  
  const Card = ({ 
    src, 
    title, 
    icon: Icon, 
    isActive, 
    placeholder 
  }: { 
    src: string | null, 
    title: string, 
    icon: React.ElementType, 
    isActive: boolean,
    placeholder: string
  }) => (
    <div 
      className={`
        relative w-full aspect-[3/4] rounded-3xl overflow-hidden shadow-2xl 
        transition-all duration-500 ease-out transform hover:rotate-0 hover:scale-105 hover:z-10
        ${isActive ? 'ring-4 ring-primary ring-offset-4 scale-105 z-10' : 'opacity-90 scale-95'}
        group
      `}
      style={{
        transform: !isActive ? 'perspective(1000px) rotateY(5deg) rotateX(2deg)' : 'none'
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-slate-300 flex flex-col items-center justify-center text-slate-400">
        {src ? (
          <img src={src} alt={title} className="w-full h-full object-cover" />
        ) : (
          <div className="flex flex-col items-center gap-2 animate-pulse">
            <Icon size={48} strokeWidth={1.5} />
            <span className="text-sm font-medium">{placeholder}</span>
          </div>
        )}
      </div>
      
      {/* Glassmorphism Label */}
      <div className="absolute bottom-4 left-4 right-4 bg-white/80 backdrop-blur-md p-3 rounded-xl shadow-sm border border-white/50 flex items-center gap-3">
        <div className={`p-2 rounded-full ${isActive ? 'bg-primary text-white' : 'bg-slate-200 text-slate-500'}`}>
          <Icon size={18} />
        </div>
        <span className="font-semibold text-slate-800 text-sm">{title}</span>
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-4xl mx-auto py-8 px-4 mb-8">
      <div className="grid grid-cols-3 gap-4 sm:gap-8 items-center justify-center">
        <div className="transform rotate-[-3deg] translate-y-4 transition-all duration-700">
          <Card 
            src={personUrl} 
            title="模特 / 人物" 
            icon={User} 
            isActive={activeStep === Step.PERSON} 
            placeholder="第一步：选人"
          />
        </div>
        <div className="transform z-20 -translate-y-2 transition-all duration-700">
          <Card 
            src={garmentUrl} 
            title="服装 / 穿搭" 
            icon={Shirt} 
            isActive={activeStep === Step.GARMENT} 
            placeholder="第二步：选衣"
          />
        </div>
        <div className="transform rotate-[3deg] translate-y-4 transition-all duration-700">
          <Card 
            src={resultUrl} 
            title="试穿效果" 
            icon={Sparkles} 
            isActive={activeStep === Step.RESULT} 
            placeholder="第三步：生成"
          />
        </div>
      </div>
    </div>
  );
};

export default TopShowcase;