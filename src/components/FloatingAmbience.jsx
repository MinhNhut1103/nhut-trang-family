import React, { useMemo } from 'react';

export default function FloatingAmbience() {
  // Danh sách dày đặc 36 hạt bong bóng và trái tim bay liên tục không ngắt quãng
  const particles = useMemo(() => {
    return [
      { id: 1, type: 'bubble', left: 3, size: 24, duration: 11, delay: -1, sway: 18, swayDur: 3.5, opacity: 0.65 },
      { id: 2, type: 'heart', left: 7, size: 18, duration: 13, delay: -7, sway: -22, swayDur: 4.2, opacity: 0.75, rotate: 12 },
      { id: 3, type: 'bubble', left: 12, size: 34, duration: 15, delay: -4, sway: 24, swayDur: 4.8, opacity: 0.55 },
      { id: 4, type: 'heart', left: 17, size: 20, duration: 12, delay: -10, sway: -18, swayDur: 3.8, opacity: 0.8, rotate: -15 },
      { id: 5, type: 'bubble', left: 22, size: 18, duration: 10, delay: -2, sway: 15, swayDur: 3.2, opacity: 0.6 },
      { id: 6, type: 'heart', left: 26, size: 15, duration: 14, delay: -8, sway: 20, swayDur: 4.5, opacity: 0.7, rotate: 8 },
      { id: 7, type: 'bubble', left: 31, size: 30, duration: 13, delay: -12, sway: -20, swayDur: 4.4, opacity: 0.6 },
      { id: 8, type: 'heart', left: 35, size: 22, duration: 11, delay: -5, sway: 16, swayDur: 3.6, opacity: 0.85, rotate: -10 },
      { id: 9, type: 'bubble', left: 40, size: 20, duration: 12, delay: -14, sway: -22, swayDur: 4.0, opacity: 0.65 },
      { id: 10, type: 'heart', left: 44, size: 17, duration: 15, delay: -3, sway: 20, swayDur: 4.3, opacity: 0.75, rotate: 14 },
      { id: 11, type: 'bubble', left: 48, size: 36, duration: 16, delay: -9, sway: -19, swayDur: 5.0, opacity: 0.5 },
      { id: 12, type: 'heart', left: 53, size: 24, duration: 12, delay: -1, sway: 17, swayDur: 3.4, opacity: 0.8, rotate: -12 },
      { id: 13, type: 'bubble', left: 58, size: 22, duration: 14, delay: -6, sway: -20, swayDur: 4.1, opacity: 0.6 },
      { id: 14, type: 'heart', left: 63, size: 19, duration: 13, delay: -11, sway: 18, swayDur: 3.9, opacity: 0.75, rotate: 10 },
      { id: 15, type: 'bubble', left: 67, size: 28, duration: 15, delay: -3, sway: -17, swayDur: 4.6, opacity: 0.55 },
      { id: 16, type: 'heart', left: 72, size: 16, duration: 10, delay: -13, sway: 15, swayDur: 3.1, opacity: 0.7, rotate: -8 },
      { id: 17, type: 'bubble', left: 77, size: 26, duration: 12, delay: -5, sway: -18, swayDur: 3.7, opacity: 0.6 },
      { id: 18, type: 'heart', left: 81, size: 21, duration: 14, delay: -9, sway: 19, swayDur: 4.3, opacity: 0.8, rotate: 15 },
      { id: 19, type: 'bubble', left: 86, size: 32, duration: 16, delay: -2, sway: -21, swayDur: 4.9, opacity: 0.55 },
      { id: 20, type: 'heart', left: 91, size: 18, duration: 11, delay: -8, sway: 16, swayDur: 3.5, opacity: 0.75, rotate: -14 },
      { id: 21, type: 'bubble', left: 96, size: 20, duration: 13, delay: -12, sway: -15, swayDur: 4.2, opacity: 0.6 },
      
      // Hàng xen kẽ tiếp sức để không có một giây nào bị trống
      { id: 22, type: 'heart', left: 5, size: 25, duration: 12, delay: -15, sway: 19, swayDur: 3.9, opacity: 0.8, rotate: 16 },
      { id: 23, type: 'bubble', left: 15, size: 16, duration: 11, delay: -7, sway: -16, swayDur: 3.3, opacity: 0.65 },
      { id: 24, type: 'heart', left: 24, size: 14, duration: 13, delay: -3, sway: 14, swayDur: 4.1, opacity: 0.7, rotate: -6 },
      { id: 25, type: 'bubble', left: 33, size: 26, duration: 14, delay: -11, sway: -20, swayDur: 4.5, opacity: 0.6 },
      { id: 26, type: 'heart', left: 38, size: 19, duration: 10, delay: -6, sway: 17, swayDur: 3.4, opacity: 0.75, rotate: 11 },
      { id: 27, type: 'bubble', left: 46, size: 22, duration: 12, delay: -16, sway: -18, swayDur: 3.8, opacity: 0.65 },
      { id: 28, type: 'heart', left: 51, size: 15, duration: 15, delay: -8, sway: 15, swayDur: 4.6, opacity: 0.7, rotate: -13 },
      { id: 29, type: 'bubble', left: 60, size: 30, duration: 13, delay: -2, sway: -22, swayDur: 4.0, opacity: 0.55 },
      { id: 30, type: 'heart', left: 69, size: 23, duration: 11, delay: -14, sway: 18, swayDur: 3.6, opacity: 0.8, rotate: 9 },
      { id: 31, type: 'bubble', left: 74, size: 18, duration: 12, delay: -7, sway: -16, swayDur: 3.7, opacity: 0.6 },
      { id: 32, type: 'heart', left: 84, size: 17, duration: 14, delay: -4, sway: 21, swayDur: 4.4, opacity: 0.75, rotate: -10 },
      { id: 33, type: 'bubble', left: 89, size: 25, duration: 10, delay: -10, sway: -19, swayDur: 3.2, opacity: 0.65 },
      { id: 34, type: 'heart', left: 94, size: 20, duration: 13, delay: -15, sway: 16, swayDur: 4.0, opacity: 0.8, rotate: 12 },
      { id: 35, type: 'bubble', left: 10, size: 28, duration: 14, delay: -13, sway: 20, swayDur: 4.3, opacity: 0.6 },
      { id: 36, type: 'heart', left: 56, size: 18, duration: 12, delay: -4, sway: -17, swayDur: 3.8, opacity: 0.75, rotate: -7 },
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
