import React from 'react';
import { ImageItem } from '../types';
import { Upload, Check } from 'lucide-react';

interface ImageSelectorProps {
  title: string;
  items: ImageItem[];
  selectedId: string | null;
  onSelect: (item: ImageItem) => void;
  onUpload: (file: File) => void;
  uploadLoading?: boolean;
}

const ImageSelector: React.FC<ImageSelectorProps> = ({ 
  title, 
  items, 
  selectedId, 
  onSelect, 
  onUpload,
  uploadLoading = false
}) => {
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onUpload(e.target.files[0]);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
      <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
        {title}
      </h3>
      
      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {/* Upload Button */}
        <label className="cursor-pointer group relative flex flex-col items-center justify-center aspect-[3/4] rounded-2xl border-2 border-dashed border-slate-300 hover:border-primary hover:bg-slate-50 transition-colors">
          <input 
            type="file" 
            accept="image/*" 
            className="hidden" 
            onChange={handleFileChange}
            disabled={uploadLoading}
          />
          {uploadLoading ? (
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <div className="p-3 rounded-full bg-slate-100 text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors mb-2">
                <Upload size={24} />
              </div>
              <span className="text-xs font-medium text-slate-500">上传图片</span>
            </>
          )}
        </label>

        {/* Preset Items */}
        {items.map((item) => {
          const isSelected = selectedId === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelect(item)}
              className={`
                relative aspect-[3/4] rounded-2xl overflow-hidden transition-all duration-300
                ${isSelected ? 'ring-4 ring-primary ring-offset-2 scale-95' : 'hover:scale-105 opacity-90 hover:opacity-100'}
              `}
            >
              <img 
                src={item.url} 
                alt="Preset" 
                className="w-full h-full object-cover" 
                loading="lazy"
              />
              {isSelected && (
                <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                  <div className="bg-primary text-white p-2 rounded-full shadow-lg">
                    <Check size={20} strokeWidth={3} />
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ImageSelector;