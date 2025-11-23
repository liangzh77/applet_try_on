import React from 'react';
import { HistoryItem } from '../types';
import { Clock, Download } from 'lucide-react';

interface GalleryProps {
  history: HistoryItem[];
}

const Gallery: React.FC<GalleryProps> = ({ history }) => {
  if (history.length === 0) return null;

  return (
    <div className="mt-16 max-w-5xl mx-auto px-4 pb-12">
      <div className="flex items-center gap-2 mb-6">
        <Clock className="text-slate-400" />
        <h2 className="text-2xl font-bold text-slate-800">生成记录</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {history.map((item) => (
          <div key={item.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex gap-4 hover:shadow-md transition-shadow">
            {/* Small thumbnails of source */}
            <div className="flex flex-col gap-2 w-1/4">
              <img src={item.personImage} className="w-full aspect-[3/4] object-cover rounded-lg border border-slate-100" alt="Source Person" />
              <img src={item.garmentImage} className="w-full aspect-[3/4] object-cover rounded-lg border border-slate-100" alt="Source Garment" />
            </div>
            
            {/* Result */}
            <div className="flex-1 relative group">
              <img src={item.resultImage} className="w-full aspect-[3/4] object-cover rounded-xl" alt="Result" />
              <a 
                href={item.resultImage} 
                download={`ai-tryon-${item.id}.png`}
                className="absolute top-2 right-2 bg-white/90 p-2 rounded-full text-slate-700 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:text-primary"
              >
                <Download size={16} />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Gallery;