import React from 'react';
import { Check } from 'lucide-react';

interface CheckboxProps {
  checked: boolean;
  onChange: (e: React.MouseEvent | React.KeyboardEvent) => void;
  ariaLabel: string;
  size?: 'md' | 'sm';
}

export const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  onChange,
  ariaLabel,
  size = 'md',
}) => {
  const boxSize = size === 'sm' ? 'w-[18px] h-[18px]' : 'w-5 h-5';

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={(e) => {
        e.stopPropagation();
        onChange(e);
      }}
      className="min-w-[44px] min-h-[44px] -ml-2.5 flex items-center justify-center rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F6F54] dark:focus-visible:ring-[#4FB58C] shrink-0 group cursor-pointer"
    >
      <span
        className={`${boxSize} rounded-[6px] flex items-center justify-center transition-all duration-150 ease-out ${
          checked
            ? 'bg-[#1F6F54] dark:bg-[#4FB58C] border-[1.5px] border-[#1F6F54] dark:border-[#4FB58C] text-white dark:text-[#121815] scale-100'
            : 'bg-transparent border-[1.5px] border-[#65776C] dark:border-[#7E9689] group-hover:border-[#1F6F54] dark:group-hover:border-[#4FB58C]'
        }`}
      >
        {checked && (
          <Check
            className="w-3.5 h-3.5 stroke-[2.6]"
            aria-hidden="true"
          />
        )}
      </span>
    </button>
  );
};
