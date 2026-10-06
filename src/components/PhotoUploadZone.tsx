import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, X, AlertCircle } from 'lucide-react';

interface PhotoUploadZoneProps {
  onFileSelected: (file: File) => void;
  selectedFile: File | null;
  onClear: () => void;
  progressPercent?: number;
  isUploading?: boolean;
}

export const PhotoUploadZone: React.FC<PhotoUploadZoneProps> = ({
  onFileSelected,
  selectedFile,
  onClear,
  progressPercent = 0,
  isUploading = false,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateAndHandleFile = (file: File) => {
    setErrorMessage(null);

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      setErrorMessage('Unsupported format. Please upload JPG, PNG, or WEBP images.');
      return;
    }

    const MAX_MB = 10;
    if (file.size > MAX_MB * 1024 * 1024) {
      setErrorMessage(`Image exceeds maximum size limit of ${MAX_MB}MB.`);
      return;
    }

    // Generate local preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    onFileSelected(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndHandleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndHandleFile(e.target.files[0]);
    }
  };

  const handleRemove = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setErrorMessage(null);
    onClear();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {selectedFile && previewUrl ? (
        <div className="relative rounded-2xl overflow-hidden border border-slate-700/80 bg-slate-900 group">
          <img
            src={previewUrl}
            alt="Upload preview"
            className="w-full h-80 object-cover rounded-2xl"
          />

          {/* Remove Button */}
          {!isUploading && (
            <button
              type="button"
              onClick={handleRemove}
              className="absolute top-3 right-3 p-2 rounded-full bg-slate-950/80 text-slate-200 hover:text-white hover:bg-rose-600 transition-colors shadow-lg cursor-pointer"
              title="Remove image"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          {/* Upload Progress Bar Overlay */}
          {isUploading && (
            <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
              <div className="w-full max-w-md space-y-3">
                <div className="flex justify-between text-xs font-semibold text-violet-300">
                  <span>Uploading to Firebase Storage...</span>
                  <span>{progressPercent}%</span>
                </div>
                <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700">
                  <div
                    className="h-full bg-gradient-to-r from-violet-600 via-purple-500 to-amber-500 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* File Metadata overlay */}
          {!isUploading && (
            <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-slate-950/90 to-transparent text-xs text-slate-300 flex items-center justify-between">
              <div className="truncate font-medium max-w-[70%]">{selectedFile.name}</div>
              <div className="text-slate-400">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</div>
            </div>
          )}
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-3 ${
            isDragOver
              ? 'border-violet-500 bg-violet-950/30'
              : 'border-slate-700/80 bg-slate-900/60 hover:bg-slate-900 hover:border-slate-600'
          }`}
        >
          <div className="w-14 h-14 rounded-2xl bg-violet-950/60 border border-violet-500/30 flex items-center justify-center text-violet-400 shadow-md">
            <Upload className="w-7 h-7 animate-bounce" />
          </div>

          <div className="space-y-1">
            <p className="text-sm font-semibold text-slate-200">
              Drag & drop your photograph here, or <span className="text-violet-400 underline">browse</span>
            </p>
            <p className="text-xs text-slate-400">
              Supports JPG, PNG, WEBP (Up to 10MB)
            </p>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
};
