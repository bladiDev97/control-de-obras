import React from 'react';

interface AppleLoadingOverlayProps {
  open: boolean;
  title?: string;
  subtitle?: string;
}

export const AppleSpinner: React.FC<{ size?: number; color?: string }> = ({
  size = 46,
  color = '#ffffff',
}) => {
  const spokes = Array.from({ length: 12 });
  const spokeWidth = Math.max(2.5, size * 0.075);
  const spokeHeight = size * 0.27;

  return (
    <div
      style={{
        position: 'relative',
        width: size,
        height: size,
        display: 'inline-block',
      }}
    >
      {spokes.map((_, i) => {
        const rotation = i * 30;
        const delay = -((12 - i) / 12).toFixed(3);
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: `${spokeWidth}px`,
              height: `${spokeHeight}px`,
              marginLeft: `-${spokeWidth / 2}px`,
              marginTop: `-${size * 0.5}px`,
              borderRadius: `${spokeWidth / 2}px`,
              backgroundColor: color,
              transformOrigin: `center ${size * 0.5}px`,
              transform: `rotate(${rotation}deg)`,
              opacity: 0.15,
              animation: 'appleSpinnerFade 1s linear infinite',
              animationDelay: `${delay}s`,
            }}
          />
        );
      })}
    </div>
  );
};

export const AppleLoadingOverlay: React.FC<AppleLoadingOverlayProps> = ({
  open,
  title = 'Asignando obra...',
  subtitle = 'Procesando información, por favor espere',
}) => {
  if (!open) return null;

  return (
    <div className="apple-hud-overlay">
      <div className="apple-hud-card">
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div
            style={{
              position: 'absolute',
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(0,142,96,0.35) 0%, rgba(0,0,0,0) 70%)',
              animation: 'applePulseRing 2s ease-in-out infinite',
            }}
          />
          <AppleSpinner size={50} color="#ffffff" />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <h4 className="apple-hud-title">{title}</h4>
          {subtitle && <p className="apple-hud-subtitle">{subtitle}</p>}
        </div>
      </div>
    </div>
  );
};

export default AppleLoadingOverlay;
