'use client';

import React from 'react';

export function MeshBackground() {
  return (
    <div className="fixed inset-0 w-full h-full -z-50 overflow-hidden bg-[#0f172a] pointer-events-none">
      {/* 1. Subtle Radial Gradient Blobs */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-[#3b82f6]/10 blur-[120px] animate-pulse" style={{ animationDuration: '10s' }} />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#8b5cf6]/8 blur-[100px] animate-pulse" style={{ animationDuration: '14s' }} />
      
      {/* 2. Custom grid pattern overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03]" 
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      {/* 3. Tactical SVG noise texture layer */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.015]" xmlns="http://www.w3.org/2000/svg">
        <filter id="noiseFilter">
          <feTurbulence 
            type="fractalNoise" 
            baseFrequency="0.65" 
            numOctaves="3" 
            stitchTiles="stitch" 
          />
        </filter>
        <rect width="100%" height="100%" filter="url(#noiseFilter)" />
      </svg>
    </div>
  );
}
export default MeshBackground;
