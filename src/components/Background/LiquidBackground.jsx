import React, { memo } from 'react';

function LiquidBackgroundComponent() {
  return (
    <div className="liquid-bg-layer" aria-hidden="true">
      <div className="liquid-blob liquid-blob-1"></div>
      <div className="liquid-blob liquid-blob-2"></div>
      <div className="liquid-blob liquid-blob-3"></div>
      <div className="liquid-blob liquid-blob-4"></div>
      <div className="liquid-mesh-overlay"></div>
    </div>
  );
}

export const LiquidBackground = memo(LiquidBackgroundComponent);
