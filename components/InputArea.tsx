/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useCallback } from 'react';
import { CloudArrowUpIcon, PhotoIcon } from '@heroicons/react/24/outline';

interface PropertyUploaderProps {
  onUpload: (file: File) => void;
  isAnalyzing: boolean;
}

export const PropertyUploader: React.FC<PropertyUploaderProps> = ({ onUpload, isAnalyzing }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (isAnalyzing) return;
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onUpload(e.dataTransfer.files[0]);
    }
  }, [onUpload, isAnalyzing]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        onUpload(e.target.files[0]);
    }
  };

  return (
    <div className="w-full h-full min-h-[250px]">
      <label
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={() => setIsDragging(false)}
        className={`
            relative flex flex-col items-center justify-center w-full h-full
            rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer overflow-hidden group
            ${isDragging 
                ? 'border-blue-500 bg-blue-50/50 scale-[0.98]' 
                : 'border-slate-200 bg-white/50 hover:bg-white hover:border-blue-400 hover:shadow-lg hover:shadow-blue-500/5'
            }
            ${isAnalyzing ? 'cursor-not-allowed' : 'opacity-100'}
        `}
      >
        {isAnalyzing && (
            <div className="absolute inset-0 bg-white/90 z-20 backdrop-blur-sm flex items-center justify-center">
                 <div className="flex flex-col items-center">
                    <div className="relative mb-6">
                         <div className="w-20 h-20 border-4 border-blue-100 rounded-full"></div>
                         <div className="absolute top-0 left-0 w-20 h-20 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                         <div className="absolute inset-0 flex items-center justify-center">
                             <PhotoIcon className="w-8 h-8 text-blue-600 animate-pulse" />
                         </div>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">Analyzing Property</h3>
                    <p className="text-sm text-slate-500 mt-1">AI is generating your listing...</p>
                </div>
            </div>
        )}

        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4 relative z-10 transition-transform duration-300 group-hover:-translate-y-1">
            <div className={`p-5 rounded-2xl mb-4 transition-all duration-300 ${isDragging ? 'bg-blue-100 text-blue-600' : 'bg-slate-50 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 group-hover:scale-110 shadow-sm'}`}>
                <CloudArrowUpIcon className="w-10 h-10" />
            </div>
            <p className="mb-2 text-sm text-slate-700">
                <span className="font-bold text-blue-600 hover:underline">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-slate-400 max-w-[240px] leading-relaxed">
                Upload a clear photo (JPG, PNG). Our Gemini AI models will extract amenities, condition, and value automatically.
            </p>
        </div>
        <input 
            type="file" 
            className="hidden" 
            accept="image/*"
            onChange={handleChange}
            disabled={isAnalyzing}
        />
      </label>
    </div>
  );
};