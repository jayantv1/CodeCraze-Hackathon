'use client';

import { useState, DragEvent, ChangeEvent } from 'react';

interface FileUploadProps {
  onUpload: (files: File[]) => void;
  disabled?: boolean;
}

export default function FileUpload({ onUpload, disabled }: FileUploadProps) {

  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnter = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    const validFiles = files.filter(file => {
      const ext = file.name.split('.').pop()?.toLowerCase();
      return ['pdf', 'docx', 'pptx', 'txt'].includes(ext || '');
    });

    if (validFiles.length > 0) {
      onUpload(validFiles); // Upload all valid files
    }
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onUpload(Array.from(files));
    }
  };

  return (
    <div
      className={`mb-3 border-2 border-dashed rounded-lg p-4 text-center transition-colors ${isDragging
          ? 'border-purple-500 bg-purple-500/20'
          : 'border-white/20 hover:border-white/30'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => !disabled && document.getElementById('file-input')?.click()}
    >
      <input
        id="file-input"
        type="file"
        multiple
        accept=".pdf,.docx,.pptx,.txt"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled}
      />
      <p className="text-sm text-gray-200">
        📎 Drag and drop a file here, or click to select
      </p>
      <p className="text-xs text-gray-400 mt-1">
        Supported formats: PDF, DOCX, PPTX, TXT
      </p>
    </div>
  );
}

