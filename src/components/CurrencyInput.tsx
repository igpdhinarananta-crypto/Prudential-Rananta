import React, { useEffect, useState } from 'react';
import { parseRawNumber, formatThousands } from '../utils/tvm';

interface CurrencyInputProps {
  id?: string;
  value: number;
  onChange: (val: number) => void;
  className?: string;
  placeholder?: string;
  prefix?: string;
}

export const CurrencyInput: React.FC<CurrencyInputProps> = ({
  id,
  value,
  onChange,
  className = '',
  placeholder = '0',
  prefix = 'Rp',
}) => {
  const [displayValue, setDisplayValue] = useState<string>(formatThousands(value));

  useEffect(() => {
    setDisplayValue(formatThousands(value));
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    const parsed = parseRawNumber(rawVal);
    setDisplayValue(formatThousands(parsed));
    onChange(parsed);
  };

  return (
    <div className="relative flex items-center">
      {prefix && (
        <span className="absolute left-3.5 text-xs font-bold text-slate-400 pointer-events-none select-none">
          {prefix}
        </span>
      )}
      <input
        id={id}
        type="text"
        value={displayValue}
        onChange={handleChange}
        placeholder={placeholder}
        className={`w-full ${
          prefix ? 'pl-10' : 'pl-3.5'
        } pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${className}`}
      />
    </div>
  );
};
