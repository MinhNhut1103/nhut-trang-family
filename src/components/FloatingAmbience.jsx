import React, { useMemo } from 'react';

export default function FloatingAmbience() {
  // Nhiều bong bóng hơn (13 bong bóng + 7 trái tim), bay thẳng đứng từ dưới lên, hoàn toàn không xoay hay lắc 3D
  const particles = useMemo(() => {
    return [
      { id: 1, type: 'bubble', left: 3, size: 22, duration: 17, delay: -2, opacity: 0.8 },
      { id: 2, type: 'bubble', left: 9, size: 30, duration: 22, delay: -11, opacity: 0.75 },
      { id: 3, type: 'heart', left: 16, size: 18, duration: 19, delay: -15, opacity: 0.8 },
      { id: 4, type: 'bubble', left: 23, size: 26, duration: 20, delay: -6, opacity: 0.8 },
      { id: 5, type: 'bubble', left: 29, size: 18, duration: 16, delay: -13, opacity: 0.75 },
      { id: 6, type: 'heart', left: 36, size: 20, duration: 21, delay: -8, opacity: 0.8 },
      { id: 7, type: 'bubble', left: 42, size: 32, duration: 23, delay: -18, opacity: 0.7 },
      { id: 8, type: 'bubble', left: 48, size: 20, duration: 18, delay: -3, opacity: 0.8 },
      { id: 9, type: 'heart', left: 54, size: 16, duration: 20, delay: -12, opacity: 0.85 },
      { id: 10, type: 'bubble', left: 60, size: 28, duration: 21, delay: -16, opacity: 0.75 },
      { id: 11, type: 'bubble', left: 67, size: 19, duration: 17, delay: -5, opacity: 0.8 },
      { id: 12, type: 'heart', left: 73, size: 22, duration: 22, delay: -19, opacity: 0.8 },
      { id: 13, type: 'bubble', left: 78, size: 25, duration: 19, delay: -9, opacity: 0.75 },
      { id: 14, type: 'bubble', left: 84, size: 30, duration: 24, delay: -14, opacity: 0.75 },
      { id: 15, type: 'heart', left: 89, size: 17, duration: 18, delay: -4, opacity: 0.85 },
      { id: 16, type: 'bubble', left: 94, size: 22, duration: 20, delay: -17, opacity: 0.8 },
      { id: 17, type: 'bubble', left: 12, size: 24, duration: 21, delay: -7, opacity: 0.75 },
      { id: 18, type: 'heart', left: 45, size: 18, duration: 19, delay: -1, opacity: 0.8 },
      { id: 19, type: 'bubble', left: 63, size: 27, duration: 22, delay: -10, opacity: 0.75 },
      { id: 20, type: 'heart', left: 81, size: 19, duration: 20, delay: -15, opacity: 0.8 },
    ];
  }, []);

  return (
    <div 
      className="fixed inset-0 pointer-events-none overflow-hidden z-10 select-none"
      aria-hidden="true"
    >
      {/* Định nghĩa SVG Gradient dùng chung một lần duy nhất cho toàn bộ trái tim */}
      <svg width="0" height="0" className="absolute w-0 h-0 overflow-hidden" aria-hidden="true">
        <defs>
          <linearGradient id="pinkHeartFloating" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FDA4AF" />
            <stop offset="50%" stopColor="#F472B6" />
            <stop offset="100%" stopColor="#FB7185" />
          </linearGradient>
        </defs>
      </svg>

      {particles.map((p) => (
        <div
          key={p.id}
          className="floating-particle-wrapper"
          style={{
            left: `${p.left}%`,
            '--duration': `${p.duration}s`,
            '--delay': `${p.delay}s`,
            '--target-opacity': p.opacity,
          }}
        >
          {p.type === 'bubble' ? (
            /* Bong bóng xà phòng ánh ngọc trai lấp lánh rõ nét, bay thẳng đứng */
            <div
              className="soap-bubble"
              style={{
                width: `${p.size}px`,
                height: `${p.size}px`,
              }}
            />
          ) : (
            /* Trái tim hồng thẳng đứng 100%, không xoay, không 3D */
            <div
              className="flex items-center justify-center"
              style={{
                width: `${p.size}px`,
                height: `${p.size}px`,
              }}
            >
              <svg viewBox="0 0 32 32" className="w-full h-full" fill="url(#pinkHeartFloating)">
                <path d="M16 28.5C15.5 28.5 15 28.3 14.6 28C13.2 26.9 2 17.8 2 10.5C2 5.8 5.8 2 10.5 2C13.2 2 15.6 3.2 16 3.5C16.4 3.2 18.8 2 21.5 2C26.2 2 30 5.8 30 10.5C30 17.8 18.8 26.9 17.4 28C17 28.3 16.5 28.5 16 28.5Z" />
              </svg>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}


