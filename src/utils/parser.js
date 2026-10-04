/**
 * Smart SMS & Natural Language Transaction Parser
 * Bóc tách theo đúng các cột: ngay, noi_dung, thu, chi, phan_loai, loai, vault, author
 */

export function parseBankSMS(text, activeUser = 'nhut') {
  if (!text || typeof text !== 'string') return null;

  const cleanText = text.trim();
  let amount = 0;
  let isIncome = false;
  let noi_dung = 'Giao dịch ngân hàng';
  let phan_loai = 'khác';
  let loai = 'thiết yếu';
  let vault = 'shared';
  const author = activeUser === 'nhut' ? 'Nhựt' : 'Trang';
  const today = new Date().toISOString().split('T')[0];

  // 1. Kiểm tra Thu (+) hay Chi (-)
  if (text.includes('+') || text.toLowerCase().includes('nhan duoc') || text.toLowerCase().includes('chuyen khoan den')) {
    isIncome = true;
  }

  // 2. Bóc tách số tiền
  const amountRegexes = [
    /[-+–]\s*([0-9]{1,3}(?:[.,][0-9]{3})+)\s*(?:VND|vnd|d|đ)?/i,
    /(?:so tien|GD|thanh toan|thanh cong)\s*[:\-–]?\s*([0-9]{1,3}(?:[.,][0-9]{3})+)\s*(?:VND|vnd|d|đ)?/i,
    /([0-9]{1,3}(?:[.,][0-9]{3})+)\s*(?:VND|vnd|d|đ)/i,
    /([0-9]{1,3}(?:[.,][0-9]{3})+)/
  ];

  for (const regex of amountRegexes) {
    const match = cleanText.match(regex);
    if (match && match[1]) {
      const rawNum = match[1].replace(/[.,]/g, '');
      const num = parseInt(rawNum, 10);
      if (num >= 1000 && num <= 500000000) {
        amount = num;
        break;
      }
    }
  }

  // 3. Phân loại theo từ khóa dựa trên các danh mục mẫu của bạn
  const lower = cleanText.toLowerCase();

  if (lower.includes('web') || lower.includes('ads') || lower.includes('hosting') || lower.includes('khach hang') || lower.includes('luong') || lower.includes('thuong')) {
    phan_loai = 'công việc';
    loai = 'công việc';
    noi_dung = isIncome ? 'Thu nhập công việc / web / ads' : 'Chi phí công việc';
    vault = 'shared';
  } else if (lower.includes('winmart') || lower.includes('bach hoa') || lower.includes('nuoc giat') || lower.includes('pin') || lower.includes('dau an') || lower.includes('gia vi')) {
    phan_loai = 'tiêu hao';
    loai = 'thiết yếu';
    noi_dung = 'Bách hóa / Tiêu hao gia đình';
    vault = 'shared';
  } else if (lower.includes('tra sua') || lower.includes('cafe') || lower.includes('coffee') || lower.includes('highlands') || lower.includes('phuc long') || lower.includes('mixue')) {
    phan_loai = 'ăn uống';
    loai = 'hưởng thụ';
    noi_dung = 'Cà phê & Trà sữa';
    vault = `personal_${activeUser}`;
  } else if (lower.includes('com') || lower.includes('pho') || lower.includes('bun') || lower.includes('an sang') || lower.includes('sua dau nanh') || lower.includes('banh')) {
    phan_loai = 'ăn uống';
    loai = 'thiết yếu';
    noi_dung = 'Ăn uống hàng ngày';
    vault = 'shared';
  } else if (lower.includes('mung cuoi') || lower.includes('dam cuoi') || lower.includes('bieu') || lower.includes('sinh nhat')) {
    phan_loai = 'biếu tặng';
    loai = 'thiết yếu';
    noi_dung = 'Mừng cưới / Quà tặng';
    vault = 'shared';
  } else if (lower.includes('homemate') || lower.includes('dien') || lower.includes('nuoc') || lower.includes('internet')) {
    phan_loai = 'nhà cửa';
    loai = 'thiết yếu';
    noi_dung = 'Nhà cửa & Hóa đơn';
    vault = 'shared';
  } else if (lower.includes('xang') || lower.includes('grab') || lower.includes('be ')) {
    phan_loai = 'đi lại';
    loai = 'thiết yếu';
    noi_dung = 'Đi lại / Đổ xăng';
    vault = 'shared';
  } else {
    const ndMatch = cleanText.match(/(?:ND|Ref|tai|cho)\s*[:\-–]?\s*([^.]+)/i);
    if (ndMatch && ndMatch[1]) {
      noi_dung = ndMatch[1].trim().slice(0, 50);
    }
  }

  return {
    id: 'tx-' + Date.now(),
    ngay: today,
    noi_dung: noi_dung || 'Giao dịch ngân hàng',
    thu: isIncome ? (amount || 1000000) : 0,
    chi: !isIncome ? (amount || 50000) : 0,
    phan_loai,
    loai,
    vault,
    author,
    ghi_chu: cleanText.slice(0, 80)
  };
}

export function parseNaturalVoicePrompt(prompt, activeUser = 'nhut') {
  if (!prompt || typeof prompt !== 'string') return null;

  const lower = prompt.toLowerCase();
  let amount = 0;
  let isIncome = false;
  let author = activeUser === 'nhut' ? 'Nhựt' : 'Trang';
  let vault = 'shared';
  let phan_loai = 'ăn uống';
  let loai = 'thiết yếu';
  const today = new Date().toISOString().split('T')[0];

  if (lower.includes('trang')) author = 'Trang';
  if (lower.includes('nhựt') || lower.includes('nhut')) author = 'Nhựt';

  if (lower.includes('ví riêng') || lower.includes('vi rieng') || lower.includes('cá nhân')) {
    vault = author === 'Nhựt' ? 'personal_nhut' : 'personal_trang';
  }

  if (lower.includes('thu') || lower.includes('nhận') || lower.includes('lương') || lower.includes('phí web') || lower.includes('tiền về')) {
    isIncome = true;
    phan_loai = 'công việc';
    loai = 'công việc';
  }

  // Parse amount with k / tr
  const kMatch = lower.match(/(\d+(?:[.,]\d+)?)\s*(k|nghìn|nghin|tr|triệu|trieu|đ|d)/i);
  if (kMatch) {
    const val = parseFloat(kMatch[1].replace(',', '.'));
    const unit = kMatch[2].toLowerCase();
    if (unit === 'k' || unit === 'nghìn' || unit === 'nghin') {
      amount = Math.round(val * 1000);
    } else if (unit === 'tr' || unit === 'triệu' || unit === 'trieu') {
      amount = Math.round(val * 1000000);
    } else {
      amount = Math.round(val);
    }
  } else {
    const rawNumberMatch = lower.match(/\b(\d{4,9})\b/);
    if (rawNumberMatch) {
      amount = parseInt(rawNumberMatch[1], 10);
    }
  }

  if (lower.includes('web') || lower.includes('ads') || lower.includes('hosting')) {
    phan_loai = 'công việc';
    loai = 'công việc';
  } else if (lower.includes('bách hóa') || lower.includes('nước giặt') || lower.includes('pin') || lower.includes('tiêu hao')) {
    phan_loai = 'tiêu hao';
    loai = 'thiết yếu';
  } else if (lower.includes('cưới') || lower.includes('biếu') || lower.includes('tặng')) {
    phan_loai = 'biếu tặng';
    loai = 'thiết yếu';
  } else if (lower.includes('trà sữa')) {
    phan_loai = 'ăn uống';
    loai = 'hưởng thụ';
  }

  return {
    id: 'tx-' + Date.now(),
    ngay: today,
    noi_dung: prompt.trim().slice(0, 50),
    thu: isIncome ? (amount || 500000) : 0,
    chi: !isIncome ? (amount || 45000) : 0,
    phan_loai,
    loai,
    vault,
    author,
    ghi_chu: 'Ghi nhanh bằng câu nói/chữ'
  };
}
