import React, { useMemo } from 'react';

export default function FloatingAmbience() {
  // Tạo danh sách các hạt bong bóng và trái tim với các thông số ngẫu nhiên tinh tế
  const particles = useMemo(() => {
    return [
      { id: 1, type: 'bubble', left: 4, size: 22, duration: 13, delay: -2, sway: 18, swayDur: 3.5, opacity: 0.55 },
      { id: 2, type: 'heart', left: 9, size: 16, duration: 15, delay: -8, sway: -22, swayDur: 4.2, opacity: 0.65, rotate: 12 },
      { id: 3, type: 'bubble', left: 16, size: 32, duration: 18, delay: -5, sway: 25, swayDur: 5.0, opacity: 0.45 },
      { id: 4, type: 'heart', left: 23, size: 20, duration: 14, delay: -11, sway: -18, swayDur: 3.8, opacity: 0.7, rotate: -15 },
      { id: 5, type: 'bubble', left: 29, size: 16, duration: 12, delay: -3, sway: 15, swayDur: 3.2, opacity: 0.5 },
      { id: 6, type: 'heart', left: 36, size: 14, duration: 17, delay: -9, sway: 20, swayDur: 4.5, opacity: 0.6, rotate: 8 },
      { id: 7, type: 'bubble', left: 42, size: 28, duration: 16, delay: -1, sway: -20, swayDur: 4.8, opacity: 0.5 },
      { id: 8, type: 'heart', left: 49, size: 22, duration: 13, delay: -7, sway: 16, swayDur: 3.6, opacity: 0.75, rotate: -10 },
      { id: 9, type: 'bubble', left: 55, size: 18, duration: 14, delay: -13, sway: -24, swayDur: 4.0, opacity: 0.55 },
      { id: 10, type: 'heart', left: 62, size: 18, duration: 16, delay: -4, sway: 22, swayDur: 4.4, opacity: 0.65, rotate: 15 },
      { id: 11, type: 'bubble', left: 69, size: 34, duration: 19, delay: -10, sway: -18, swayDur: 5.2, opacity: 0.4 },
      { id: 12, type: 'heart', left: 76, size: 15, duration: 12, delay: -2, sway: 15, swayDur: 3.4, opacity: 0.7, rotate: -12 },
      { id: 13, type: 'bubble', left: 82, size: 20, duration: 15, delay: -6, sway: -20, swayDur: 4.1, opacity: 0.5 },
      { id: 14, type: 'heart', left: 88, size: 24, duration: 14, delay: -12, sway: 18, swayDur: 3.9, opacity: 0.65, rotate: 10 },
      { id: 15, type: 'bubble', left: 94, size: 26, duration: 17, delay: -4, sway: -16, swayDur: 4.6, opacity: 0.45 },
      { id: 16, type: 'heart', left: 12, size: 12, duration: 11, delay: -14, sway: 14, swayDur: 3.1, opacity: 0.6, rotate: -8 },
      { id: 17, type: 'bubble', left: 65, size: 14, duration: 13, delay: -15, sway: -15, swayDur: 3.7, opacity: 0.5 },
      { id: 18, type: 'heart', left: 45, size: 16, duration: 15, delay: -16, sway: 19, swayDur: 4.3, opacity: 0.65, rotate: 14 },
    ];
  }, []);

  return (
    <div 
      className="fixed inset-0 pointer-events-none overflow-hidden z-20 select-none"
      aria-hidden="true"
    >
      {particles.map((p) => (
        <div
          key={p.id}
          className="floating-particle-wrapper"
          style={{
            left: `${p.left}%`,
            '--duration': `${p.duration}s`,
            '--delay': `${p.delay}s`,
            '--target-opacity': p.opacity,
            '--target-rotate': `${p.rotate || 0}deg`,
          }}
        >
          <div
            className="floating-particle-inner"
            style={{
              '--sway-distance': `${p.sway}px`,
              '--sway-duration': `${p.swayDur}s`,
            }}
          >
            {p.type === 'bubble' ? (
              /* Bong bóng xà phòng ánh hồng ngọc trai */
              <div
                className="soap-bubble"
                style={{
                  width: `${p.size}px`,
                  height: `${p.size}px`,
                }}
              />
            ) : (
              /* Trái tim hồng mềm mại nhẹ nhàng */
              <div
                className="flex items-center justify-center filter drop-shadow-xs"
                style={{
                  width: `${p.size}px`,
                  height: `${p.size}px`,
                }}
              >
                <svg viewBox="0 0 32 32" className="w-full h-full" fill="url(#pinkHeartFloating)">
                  <defs>
                    <linearGradient id="pinkHeartFloating" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#FDA4AF" />
                      <stop offset="50%" stopColor="#F472B6" />
                      <stop offset="100%" stopColor="#FB7185" />
                    </linearGradient>
                  </defs>
                  <path d="M16 28.5C15.5 28.5 15 28.3 14.6 28C13.2 26.9 2 17.8 2 10.5C2 5.8 5.8 2 10.5 2C13.2 2 15.6 3.2 16 3.5C16.4 3.2 18.8 2 21.5 2C26.2 2 30 5.8 30 10.5C30 17.8 18.8 26.9 17.4 28C17 28.3 16.5 28.5 16 28.5Z" />
                </svg>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
