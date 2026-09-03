'use client';

import React, { useRef, useEffect } from 'react';

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  disabled?: boolean;
  onComplete?: (code: string) => void;
}

export function OtpInput({
  value,
  onChange,
  length = 6,
  disabled = false,
  onComplete,
}: OtpInputProps) {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const digits = value.split('').concat(Array(Math.max(0, length - value.length)).fill(''));

  useEffect(() => {
    // Auto-focus first input on mount
    if (inputsRef.current[0]) {
      inputsRef.current[0].focus();
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, idx: number) => {
    const val = e.target.value.replace(/\D/g, ''); // Keep numbers only

    if (!val) {
      // Empty
      const newDigits = [...digits];
      newDigits[idx] = '';
      const newVal = newDigits.join('').slice(0, length);
      onChange(newVal);
      return;
    }

    if (val.length === 1) {
      const newDigits = [...digits];
      newDigits[idx] = val;
      const newVal = newDigits.join('').slice(0, length);
      onChange(newVal);

      // Advance to next box
      if (idx < length - 1 && inputsRef.current[idx + 1]) {
        inputsRef.current[idx + 1]?.focus();
      }

      if (newVal.length === length && onComplete) {
        onComplete(newVal);
      }
    } else {
      // Pasted or multiple characters typed
      const pasted = val.slice(0, length);
      onChange(pasted);
      const nextFocus = Math.min(pasted.length, length - 1);
      inputsRef.current[nextFocus]?.focus();
      if (pasted.length === length && onComplete) {
        onComplete(pasted);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, idx: number) => {
    if (e.key === 'Backspace' && !digits[idx] && idx > 0) {
      inputsRef.current[idx - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    if (pastedData) {
      onChange(pastedData);
      const nextFocus = Math.min(pastedData.length, length - 1);
      inputsRef.current[nextFocus]?.focus();
      if (pastedData.length === length && onComplete) {
        onComplete(pastedData);
      }
    }
  };

  return (
    <div className="flex items-center justify-center gap-2 md:gap-3" onPaste={handlePaste}>
      {Array.from({ length }).map((_, idx) => (
        <input
          key={idx}
          ref={(el) => {
            inputsRef.current[idx] = el;
          }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          disabled={disabled}
          value={digits[idx] || ''}
          onChange={(e) => handleChange(e, idx)}
          onKeyDown={(e) => handleKeyDown(e, idx)}
          className={`w-11 h-13 md:w-12 md:h-14 text-center text-xl font-extrabold rounded-2xl border transition-all focus:outline-none ${
            digits[idx]
              ? 'bg-[#1f2937] border-[#8b5cf6] text-white shadow-[0_0_12px_rgba(139,92,246,0.3)]'
              : 'bg-[#111827] border-[rgba(255,255,255,0.1)] text-[#cbd5e1] focus:border-[#3b82f6]'
          } disabled:opacity-50`}
        />
      ))}
    </div>
  );
}
