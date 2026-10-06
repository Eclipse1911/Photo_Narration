import React from 'react';

interface TagChipProps {
  label: string;
  selected?: boolean;
  onClick?: () => void;
  size?: 'sm' | 'md';
}

export const TagChip: React.FC<TagChipProps> = ({
  label,
  selected = false,
  onClick,
  size = 'sm'
}) => {
  const isSm = size === 'sm';

  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center justify-center font-medium transition-all duration-200 rounded-full cursor-pointer whitespace-nowrap ${
        isSm ? 'px-3 py-1 text-xs' : 'px-4 py-1.5 text-sm'
      } ${
        selected
          ? 'bg-violet-600 text-white shadow-md shadow-violet-900/30 border border-violet-500'
          : 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border border-slate-700/70 hover:border-slate-600'
      }`}
    >
      #{label}
    </button>
  );
};
