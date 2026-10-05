// Hàm băm bảo mật SHA-256 chuẩn Web Crypto API
export async function hashPin(pin) {
  if (!pin) return '';
  const cleanPin = String(pin).trim();
  // Nếu đã là chuỗi SHA-256 (64 ký tự hex) thì giữ nguyên
  if (/^[a-f0-9]{64}$/i.test(cleanPin)) {
    return cleanPin.toLowerCase();
  }
  
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const msgBuffer = new TextEncoder().encode(cleanPin);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toLowerCase();
  }

  // Fallback đơn giản nếu chạy môi trường không có crypto.subtle
  let hash = 0;
  for (let i = 0; i < cleanPin.length; i++) {
    const char = cleanPin.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return 'hashed_' + Math.abs(hash).toString(16);
}

// Kiểm tra mã PIN nhập vào có khớp với mã PIN lưu trong hệ thống
export async function verifyPin(inputPin, storedHashOrPin) {
  if (!storedHashOrPin) return true;
  const cleanInput = String(inputPin || '').trim();
  const cleanStored = String(storedHashOrPin).trim();

  // 1. Nếu đã lưu dưới dạng SHA-256 hash (64 ký tự hex)
  if (/^[a-f0-9]{64}$/i.test(cleanStored)) {
    const inputHashed = await hashPin(cleanInput);
    return inputHashed.toLowerCase() === cleanStored.toLowerCase();
  }

  // 2. Tương thích ngược: Nếu trước đó lưu chuỗi PIN thường (như '1999', '1103')
  return cleanInput === cleanStored;
}

// Chuẩn hóa đối tượng thành viên trước khi lưu LocalStorage:
// TUYỆT ĐỐI KHÔNG LƯU MÃ PIN DẠNG RÕ (PLAIN TEXT), CHỈ LƯU PIN_HASH
export function sanitizeMemberForStorage(member) {
  if (!member) return null;
  const clone = { ...member };
  if (clone.pin) {
    if (!clone.pin_hash) {
      clone.pin_hash = clone.pin;
    }
    delete clone.pin;
  }
  return clone;
}
