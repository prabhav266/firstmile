'use client';

import React, { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={`w-8 h-8 rounded border border-[#242424] bg-[#0a0a0a] ${className || ''}`} />
    );
  }

  const isDark = resolvedTheme === 'dark';

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={`p-1.5 rounded border transition-colors flex items-center justify-center ${
        isDark
          ? 'border-[#242424] bg-[#0a0a0a] text-[#888888] hover:text-[#ffffff] hover:border-[#444444]'
          : 'border-[#e4e4e7] bg-[#f4f4f5] text-[#71717a] hover:text-[#09090b] hover:border-[#a1a1aa]'
      } ${className || ''}`}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-label="Toggle theme"
    >
      {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
    </button>
  );
}
