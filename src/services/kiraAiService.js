// =========================================================================
// DỊCH VỤ KIRA AI ASSISTANT (OPENAI-COMPATIBLE CLIENT)
// =========================================================================

export const AVAILABLE_MODELS = [
  {
    id: 'kira-mini-1.0',
    name: 'Kira Mini 1.0 (Mặc định ⭐)',
    badge: 'Mặc định ⭐',
    description: 'Mô hình gọn nhẹ, phản hồi nhanh và tiết kiệm',
    isDefault: true
  },
  {
    id: 'laguna-xs-2.1-free',
    name: 'Laguna XS 2.1 (Siêu tốc ~0.6s ⚡)',
    badge: 'Siêu tốc ⚡',
    description: 'Tốc độ phản hồi nhanh nhất (~0.6s - 2s), nhập thu chi tức thì'
  },
  {
    id: 'laguna-s-2.1-free',
    name: 'Laguna S 2.1 (Nhanh & Tự nhiên ~1.3s 🚀)',
    badge: 'Đa nhiệm',
    description: 'Cân bằng hoàn hảo giữa tốc độ nhanh và câu thoại tự nhiên'
  },
  {
    id: 'qwen3.8-flash-free',
    name: 'Qwen 3.8 Flash (Tốc độ cao ⚡)',
    badge: 'Tốc độ cao ⚡',
    description: 'Phản hồi nhanh, nhận diện thông tin tốt'
  },
  {
    id: 'qwen3.8-max-free',
    name: 'Qwen 3.8 Max (Phân tích sâu 🧠)',
    badge: 'Phân tích sâu',
    description: 'Mô hình lớn, tính toán và suy luận sâu nhưng cần 5-6s phản hồi'
  },
  {
    id: 'longcat-2.5-preview-free',
    name: 'LongCat 2.5 (Ngữ cảnh dài 📜)',
    badge: 'Ngữ cảnh dài',
    description: 'Xử lý lịch sử giao dịch dài, phân tích nhiều tháng'
  }
];

const CONFIG_STORAGE_KEY = 'nt_kiraai_config';

/**
 * Lấy cấu hình Kira AI hiện tại (ưu tiên localStorage, fallback sang .env)
 */
export function getAiConfig() {
  try {
    const saved = localStorage.getItem(CONFIG_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        baseUrl: parsed.baseUrl || import.meta.env.VITE_KIRAAI_BASE_URL || 'https://kiraai.vn/api/v1',
        apiKey: parsed.apiKey || import.meta.env.VITE_KIRAAI_API_KEY || '',
        model: parsed.model || import.meta.env.VITE_KIRAAI_DEFAULT_MODEL || 'kira-mini-1.0',
      };
    }
  } catch (e) {
    console.warn('Lỗi đọc cấu hình AI:', e);
  }

  return {
    baseUrl: import.meta.env.VITE_KIRAAI_BASE_URL || 'https://kiraai.vn/api/v1',
    apiKey: import.meta.env.VITE_KIRAAI_API_KEY || '',
    model: import.meta.env.VITE_KIRAAI_DEFAULT_MODEL || 'kira-mini-1.0',
  };
}

/**
 * Lưu cấu hình Kira AI vào localStorage
 */
export function saveAiConfig(config) {
  try {
    const toSave = {
      baseUrl: (config.baseUrl || '').trim(),
      apiKey: (config.apiKey || '').trim(),
      model: config.model || 'qwen3.8-max-free',
    };
    localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(toSave));
    return true;
  } catch (e) {
    console.error('Lỗi lưu cấu hình AI:', e);
    return false;
  }
}

/**
 * Kiểm tra kết nối tới Endpoint Kira AI
 */
export async function testAiConnection(config) {
  const baseUrl = (config?.baseUrl || getAiConfig().baseUrl).replace(/\/+$/, '');
  const apiKey = (config?.apiKey || getAiConfig().apiKey).trim();
  const model = config?.model || getAiConfig().model;

  if (!apiKey) {
    return { success: false, error: 'Chưa có API Key. Vui lòng nhập API Key để kiểm tra!' };
  }

  try {
    const endpoint = `${baseUrl}/chat/completions`;
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: 'system', content: 'Bạn là trợ lý kiểm tra kết nối API.' },
          { role: 'user', content: 'Xin chào! Trả lời ngắn gọn: Kết nối thành công.' }
        ],
        temperature: 0.3,
        max_tokens: 50,
      })
    });

    if (!res.ok) {
      const errBody = await res.text();
      let errorMsg = `Mã lỗi HTTP ${res.status}`;
      try {
        const errJson = JSON.parse(errBody);
        errorMsg = errJson?.error?.message || errJson?.message || errorMsg;
      } catch (e) {
        errorMsg = errBody || errorMsg;
      }
      return { success: false, error: errorMsg };
    }

    const data = await res.json();
    const reply = data?.choices?.[0]?.message?.content || 'Kết nối thành công!';
    return { success: true, reply };
  } catch (err) {
    return { success: false, error: err.message || 'Lỗi mạng hoặc không thể kết nối tới máy chủ AI' };
  }
}

/**
 * Chuẩn hóa ngày về định dạng YYYY-MM-DD
 */
function normalizeDateISO(dateStr) {
  if (!dateStr) return '';
  const clean = String(dateStr).split('T')[0].trim();
  if (clean.includes('-')) {
    const parts = clean.split('-');
    if (parts.length >= 3) {
      const year = parts[0];
      const month = String(Number(parts[1])).padStart(2, '0');
      const day = String(Number(parts[2])).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
  } else if (clean.includes('/')) {
    const parts = clean.split('/');
    if (parts.length >= 3) {
      if (parts[0].length === 4) {
        return `${parts[0]}-${String(Number(parts[1])).padStart(2, '0')}-${String(Number(parts[2])).padStart(2, '0')}`;
      }
      const fullYear = parts[2].length === 2 ? '20' + parts[2] : parts[2];
      return `${fullYear}-${String(Number(parts[1])).padStart(2, '0')}-${String(Number(parts[0])).padStart(2, '0')}`;
    }
  }
  return clean;
}

/**
 * Định dạng ngày hiển thị theo chuẩn Việt Nam: DD/MM/YYYY
 */
function formatDateDisplay(dateStr) {
  if (!dateStr) return '';
  const clean = String(dateStr).split('T')[0].trim();
  if (clean.includes('-')) {
    const parts = clean.split('-');
    if (parts.length >= 3) {
      const [year, month, day] = parts;
      return `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
    }
  } else if (clean.includes('/')) {
    const parts = clean.split('/');
    if (parts.length >= 3) {
      if (parts[0].length === 4) {
        return `${String(parts[2]).padStart(2, '0')}/${String(parts[1]).padStart(2, '0')}/${parts[0]}`;
      }
      return `${String(parts[0]).padStart(2, '0')}/${String(parts[1]).padStart(2, '0')}/${parts[2]}`;
    }
  }
  return clean;
}

/**
 * Chuẩn bị System Prompt với bối cảnh tài chính đầy đủ của Nhựt & Trang
 */
function buildSystemPrompt(contextData) {
  const {
    currentMonth,
    activeUser,
    members = [],
    categories = [],
    macroTypes = [],
    summary = {},
    transactions = [],
    recentTransactions = [],
    monthlyConfig = {},
    monthlyConfigs = {},
    goals = [],
    currentFunds = {},
  } = contextData;

  // Lấy ngày giờ theo giờ địa phương thực tế (tránh lệch timezone UTC)
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const todayISO = `${year}-${month}-${day}`;
  const todayDisplay = `${day}/${month}/${year}`;

  const yDate = new Date(now);
  yDate.setDate(now.getDate() - 1);
  const yYear = yDate.getFullYear();
  const yMonth = String(yDate.getMonth() + 1).padStart(2, '0');
  const yDay = String(yDate.getDate()).padStart(2, '0');
  const yesterdayISO = `${yYear}-${yMonth}-${yDay}`;
  const yesterdayDisplay = `${yDay}/${yMonth}/${yYear}`;

  const bDate = new Date(now);
  bDate.setDate(now.getDate() - 2);
  const bYear = bDate.getFullYear();
  const bMonth = String(bDate.getMonth() + 1).padStart(2, '0');
  const bDay = String(bDate.getDate()).padStart(2, '0');
  const beforeYesterdayISO = `${bYear}-${bMonth}-${bDay}`;
  const beforeYesterdayDisplay = `${bDay}/${bMonth}/${bYear}`;

  const activeRoleName = activeUser === 'trang' ? 'cô chủ Trang' : 'cậu chủ Nhựt';

  // Toàn bộ danh sách giao dịch được sắp xếp từ mới nhất tới cũ nhất
  const rawList = transactions && transactions.length > 0 ? transactions : recentTransactions;
  const sortedTransactions = [...rawList].sort((a, b) => {
    const isoA = normalizeDateISO(a?.ngay);
    const isoB = normalizeDateISO(b?.ngay);
    return (isoB || '').localeCompare(isoA || '');
  });

  // Định dạng rõ ràng từng giao dịch kèm tag thời gian tường minh
  const formattedTxLines = sortedTransactions.map((t, idx) => {
    const iso = normalizeDateISO(t.ngay);
    const display = formatDateDisplay(t.ngay);
    let timeLabel = `[${display} - ${iso}]`;
    if (iso === todayISO) {
      timeLabel = `[HÔM NAY - ${display} / ${iso}]`;
    } else if (iso === yesterdayISO) {
      timeLabel = `[HÔM QUA - ${display} / ${iso}]`;
    } else if (iso === beforeYesterdayISO) {
      timeLabel = `[HÔM KIA - ${display} / ${iso}]`;
    }

    const isThu = (Number(t.thu) || 0) > 0;
    const amountVal = isThu ? Number(t.thu) : Number(t.chi || 0);
    const moneyStr = isThu 
      ? `Thu: +${new Intl.NumberFormat('vi-VN').format(amountVal)} đ`
      : `Chi: -${new Intl.NumberFormat('vi-VN').format(amountVal)} đ`;

    const catStr = t.phan_loai || 'khác';
    const loaiStr = t.loai ? ` [${t.loai}]` : '';
    const authorStr = t.author || (t.vault === 'personal_trang' ? 'Trang' : 'Nhựt');
    const vaultStr = t.vault === 'shared' ? 'Quỹ chung' : t.vault === 'personal_trang' ? 'Ví Trang' : 'Ví Nhựt';
    const isAi = Boolean(t.is_ai || (t.ghi_chu && t.ghi_chu.includes('Quản gia')));
    const aiNote = isAi ? ` | ⭐ Tag: "Quản gia nhập", ID: "${t.id}"` : '';

    return `  ${idx + 1}. ${timeLabel} "${t.noi_dung}" | ${moneyStr} | Phân loại: ${catStr}${loaiStr} | Bởi: ${authorStr} (${vaultStr})${aiNote}`;
  });

  // Lọc các giao dịch có tag Quản gia nhập
  const aiTxList = sortedTransactions.filter(t => 
    Boolean(t.is_ai || (t.ghi_chu && t.ghi_chu.includes('Quản gia')))
  );

  // Thống kê phân loại danh mục
  const categoryStats = summary.categoryBreakdown || {};
  const categoryLines = Object.entries(categoryStats).map(([cat, s]) =>
    `  • ${cat}: Chi ${new Intl.NumberFormat('vi-VN').format(s.chi || 0)} đ (${s.count || 0} khoản)${s.thu > 0 ? `, Thu ${new Intl.NumberFormat('vi-VN').format(s.thu)} đ` : ''}`
  );

  // Thống kê theo thành viên & ví
  const memberStats = summary.memberBreakdown || {};
  const memberLines = Object.entries(memberStats).map(([k, s]) =>
    `  • ${s.name}: Đã chi ${new Intl.NumberFormat('vi-VN').format(s.chi || 0)} đ, Thu ${new Intl.NumberFormat('vi-VN').format(s.thu || 0)} đ (${s.count || 0} giao dịch)`
  );

  // Mục tiêu tích lũy
  const goalLines = (goals || []).map(g =>
    `  • Mục tiêu "${g.title}": Đã có ${new Intl.NumberFormat('vi-VN').format(g.current || 0)} đ / ${new Intl.NumberFormat('vi-VN').format(g.target || 0)} đ (${Math.round(((g.current || 0) / (g.target || 1)) * 100)}%)`
  );

  // Lịch sử các tháng
  const monthlyConfigLines = Object.entries(monthlyConfigs || {}).map(([mId, c]) =>
    `  • Tháng ${mId}: Hạn mức ${new Intl.NumberFormat('vi-VN').format(c.han_muc_chi || 0)} đ | Mục tiêu: "${c.banner_focus || ''}"`
  );

  return `Bạn là "Quản gia nhà Nhựt Trang" 💕 — một người quản gia tài chính thông minh, mực thước, chu đáo, tinh tế, nắm rõ 100% sổ sách và trung thành của gia đình.

QUY TẮC XƯNG HÔ & PHÂN BIỆT CHỦ NHÂN (BẮT BUỘC):
- Luôn xưng là "Quản gia" hoặc "em", và gọi hai người là **"cậu chủ Nhựt"** hoặc **"cô chủ Trang"**. Tuyệt đối không xưng hô chung chung hay xuồng xã.
- KHI BẮT ĐẦU HOẶC MỞ ĐẦU TRÒ CHUYỆN: Bạn PHẢI luôn kính cẩn chào hỏi và hỏi rõ xem mình đang được vinh hạnh phục vụ cậu chủ Nhựt hay cô chủ Trang (ví dụ: "Dạ Quản gia xin kính chào ạ! Dạ cho em xin phép hỏi em đang được phục vụ cậu chủ Nhựt hay cô chủ Trang thế ạ? 💕").
- Hiện tại tài khoản mặc định trên máy đang là: ${activeRoleName}. Nếu người dùng tự giới thiệu là cậu chủ Nhựt hoặc cô chủ Trang, hãy nhớ và phục vụ đúng người đó.

MỐC THỜI GIAN THỰC TẾ CỦA GIA ĐÌNH:
- HÔM NAY là: Ngày ${todayDisplay} (Định dạng ISO: ${todayISO})
- HÔM QUA là: Ngày ${yesterdayDisplay} (Định dạng ISO: ${yesterdayISO})
- HÔM KIA là: Ngày ${beforeYesterdayDisplay} (Định dạng ISO: ${beforeYesterdayISO})
- Tháng đang xem: ${currentMonth || '2026-10'}

THÔNG TIN BỐI CẢNH GIA ĐÌNH & TÀI KHOẢN:
- Cậu chủ Nhựt: Chủ gia đình, Ví cá nhân: personal_nhut.
- Cô chủ Trang: Nữ chủ nhân, Ví cá nhân: personal_trang.
- Quỹ chung gia đình: shared.
- Danh mục hợp lệ: ${categories.join(', ')}
- Phân nhóm lớn: ${macroTypes.join(', ')}

TỔNG QUAN TÀI CHÍNH THÁNG NÀY (${currentMonth || '2026-10'}):
- Tổng thu trong tháng: ${new Intl.NumberFormat('vi-VN').format(summary.totalIncome || 0)} đ
- Tổng chi trong tháng: ${new Intl.NumberFormat('vi-VN').format(summary.totalExpense || 0)} đ
- Còn lại trong tháng: ${new Intl.NumberFormat('vi-VN').format(summary.netBalance || 0)} đ
- Số tiền hiện có (Ví & Tài khoản): ${new Intl.NumberFormat('vi-VN').format(summary.currentFunds || currentFunds?.so_tien_hien_co || 0)} đ
- Hạn mức ngân sách tháng: ${new Intl.NumberFormat('vi-VN').format(monthlyConfig.han_muc_chi || 30000000)} đ
- Tiêu điểm / Focus tháng: "${monthlyConfig.banner_focus || 'Tối ưu chi tiêu & tiết kiệm'}"

THỐNG KÊ CHI TIÊU THEO DANH MỤC THÁNG NÀY:
${categoryLines.length === 0 ? '  (Chưa có dữ liệu danh mục)' : categoryLines.join('\n')}

THỐNG KÊ CHI TIÊU THEO THÀNH VIÊN & VÍ:
${memberLines.length === 0 ? '  (Chưa có dữ liệu thành viên)' : memberLines.join('\n')}

MỤC TIÊU TIẾT KIỆM GIA ĐÌNH:
${goalLines.length === 0 ? '  (Chưa có mục tiêu)' : goalLines.join('\n')}

HẠN MỨC & CẤU HÌNH CÁC THÁNG:
${monthlyConfigLines.length === 0 ? '  (Chưa có cấu hình)' : monthlyConfigLines.join('\n')}

TOÀN BỘ CÁC KHOẢN GIAO DỊCH TRONG SỔ (ĐÃ SẮP XẾP TỪ MỚI ĐẾN CŨ):
${formattedTxLines.length === 0 ? '  (Sổ thu chi hiện đang trống)' : formattedTxLines.join('\n')}

CÁC KHOẢN GIAO DỊCH DO QUẢN GIA NHẬP (CÓ THỂ SỬA/XÓA):
${aiTxList.length === 0 ? '  (Hiện chưa có giao dịch nào do Quản gia nhập)' : aiTxList.map(t => `  - ID: "${t.id}" | ${formatDateDisplay(t.ngay)} | "${t.noi_dung}" | ${(Number(t.chi) || 0) > 0 ? '-' + new Intl.NumberFormat('vi-VN').format(t.chi) : '+' + new Intl.NumberFormat('vi-VN').format(t.thu)} đ | Tag: "Quản gia nhập"`).join('\n')}

QUY TẮC TRA CỨU & VẬN DỤNG KIẾN THỨC TOÀN BỘ APP:
1. TRA CỨU THEO NGÀY (CỰC KỲ CHÍNH XÁC):
- Khi người dùng hỏi "hôm qua": Bạn PHẢI đối chiếu ngay các dòng có tag [HÔM QUA - ...] (chính là ngày ${yesterdayDisplay} / ${yesterdayISO}). Liệt kê chi tiết toàn bộ các khoản thu/chi diễn ra vào ngày đó, nêu rõ tên khoản, số tiền, và tổng kết. TUYỆT ĐỐI KHÔNG BÁO "không có dữ liệu" khi đã có các khoản mang tag [HÔM QUA]!
- Khi người dùng hỏi "hôm nay": Đối chiếu các dòng có tag [HÔM NAY - ...] (ngày ${todayDisplay} / ${todayISO}).
- Khi người dùng hỏi "hôm kia": Đối chiếu các dòng có tag [HÔM KIA - ...] (ngày ${beforeYesterdayDisplay} / ${beforeYesterdayISO}).
- Khi người dùng hỏi bất kỳ ngày nào khác (ví dụ: ngày 07/10, ngày 6/10...): Tra cứu ngày tương ứng trong danh sách để liệt kê.

2. TRA CỨU THEO DANH MỤC, VÍ, THÀNH VIÊN & MỤC TIÊU:
- Khi hỏi về ăn uống, đi lại, công việc, nhà cửa...: Sử dụng mục "THỐNG KÊ CHI TIÊU THEO DANH MỤC" để trả lời con số chính xác kèm các khoản tiêu biểu.
- Khi hỏi ai chi nhiều hơn, Nhựt chi bao nhiêu, Trang chi bao nhiêu: Sử dụng mục "THỐNG KÊ CHI TIÊU THEO THÀNH VIÊN & VÍ".
- Khi hỏi về các tháng trước hoặc kế hoạch tiết kiệm: Sử dụng mục "HẠN MỨC & CẤU HÌNH CÁC THÁNG" và "MỤC TIÊU TIẾT KIỆM".

3. TỰ ĐỘNG THÊM THU CHI KHI CẬU CHỦ HOẶC CÔ CHỦ YÊU CẦU:
Khi người dùng nói các câu biểu thị thêm khoản tiền, trả về khối JSON. ĐẶC BIỆT: luôn gán tag "ghi_chu": "Quản gia nhập":
\`\`\`json
{
  "type": "ACTION_ADD_TRANSACTIONS",
  "transactions": [
    {
      "noi_dung": "Tên khoản chi hoặc thu",
      "so_tien": 45000,
      "is_thu": false,
      "phan_loai": "ăn uống",
      "loai": "thiết yếu",
      "author": "Nhựt",
      "vault": "personal_nhut",
      "ngay": "${todayISO}",
      "ghi_chu": "Quản gia nhập"
    }
  ],
  "reply": "Dạ em đã ghi nhận khoản ăn trưa 45k vào sổ cho cậu chủ Nhựt rồi ạ! 💕"
}
\`\`\`
Quy tắc tự suy luận ví và người:
- Cô chủ Trang nói / nhắc Trang: author "Trang", vault "personal_trang" (hoặc "shared" nếu đồ chung gia đình).
- Cậu chủ Nhựt nói / nhắc Nhựt: author "Nhựt", vault "personal_nhut".
- Tiền ghi bằng k/K (45k = 45000, 1tr = 1000000).
- ghi_chu: BẮT BUỘC gán "Quản gia nhập" để nhận diện tag.

4. NGUYÊN TẮC BẢO MẬT & PHÂN QUYỀN SỬA/XÓA:
- CHỈ CÓ QUẢN GIA MỚI ĐƯỢC TỰ SỬA VÀ XÓA NHỮNG MỤC CÓ TAG "Quản gia nhập" (nằm trong danh sách "CÁC KHOẢN GIAO DỊCH DO QUẢN GIA NHẬP" ở trên).
- NHỮNG KHOẢN KHÔNG CÓ TAG "Quản gia nhập" (do cậu chủ hoặc cô chủ tự nhập tay): Quản gia TUYỆT ĐỐI KHÔNG ĐƯỢC SỬA HOẶC XÓA! Nếu người dùng yêu cầu xóa hoặc sửa những khoản tự nhập này, bạn PHẢI từ chối lịch sự: "Dạ thưa cậu chủ/cô chủ, khoản này không có tag 'Quản gia nhập' (do mình tự nhập tay vào sổ) nên Quản gia không được phép can thiệp để bảo toàn dữ liệu gốc ạ. Cậu chủ/cô chủ vui lòng thao tác trực tiếp trên Bảng sổ giúp em nhé! 💕"
- KHI CẬU CHỦ/CÔ CHỦ YÊU CẦU XÓA MỘT KHOẢN CÓ TAG "Quản gia nhập":
  BẮT BUỘC PHẢI CẦN CHỦ NHÀ XÁC NHẬN QUA POPUP (Không tự ý xóa ngầm). Hãy tìm đúng ID của giao dịch có tag "Quản gia nhập" đó và xuất khối JSON:
\`\`\`json
{
  "type": "ACTION_CONFIRM_DELETE",
  "target_tx": {
    "id": "ID_chính_xác_của_giao_dịch_có_tag_Quản_gia_nhập",
    "noi_dung": "Tên khoản chi cần xóa",
    "so_tien": 45000,
    "is_thu": false,
    "ngay": "${todayISO}"
  },
  "reply": "Dạ Quản gia đã mở popup xác nhận xóa khoản có tag 'Quản gia nhập' này rồi ạ. Cậu chủ / cô chủ vui lòng bấm xác nhận trên popup để em xóa khỏi database nhé! 💕"
}
\`\`\`
- KHI CẬU CHỦ/CÔ CHỦ YÊU CẦU SỬA MỘT KHOẢN CÓ TAG "Quản gia nhập":
  Hãy tìm đúng ID của giao dịch đó trong danh sách và trả về khối JSON:
\`\`\`json
{
  "type": "ACTION_UPDATE_TRANSACTION",
  "target_tx_id": "ID_chính_xác_của_giao_dịch_có_tag_Quản_gia_nhập",
  "updates": {
    "noi_dung": "Tên mới nếu có đổi",
    "so_tien": 50000,
    "phan_loai": "ăn uống"
  },
  "reply": "Dạ em đã cập nhật lại khoản có tag 'Quản gia nhập' này theo đúng ý của cậu chủ / cô chủ rồi ạ! 💕"
}
\`\`\`

5. VĂN PHONG GIAO TIẾP:
- Lễ phép, ấm áp, chu đáo, tinh tế, số liệu rõ ràng và chính xác.
- Khi được yêu cầu liệt kê hay tổng hợp: Hãy liệt kê chi tiết từng khoản, có số tiền cụ thể và tổng cộng. Cân đối dung lượng câu trả lời để cung cấp đầy đủ thông tin nhất.
- Điểm xuyết emoji ấm áp (💕, ✨, 🌸). Tuyệt đối không để lộ mã JSON ra lời thoại hiển thị cho chủ nhà.

6. QUY TẮC KHI ĐƯỢC YÊU CẦU "TIẾP TỤC" / "VIẾT TIẾP":
- Khi người dùng bấm nút "Tiếp tục" hoặc nhắn "tiếp tục", "viết tiếp", "tiếp theo", "còn gì nữa không":
  + Bạn PHẢI viết tiếp ngay phần danh sách hoặc nội dung còn dang dở của câu trả lời trước.
  + TUYỆT ĐỐI KHÔNG chào lại từ đầu ("Dạ Quản gia xin kính chào...").
  + TUYỆT ĐỐI KHÔNG lặp lại các khoản mục đã nêu ở tin nhắn trước.
  + Nối tiếp trực tiếp ngay từ khoản tiếp theo cho đến khi hoàn tất đầy đủ.`;
}

/**
 * Gửi tin nhắn đến Kira AI và xử lý phản hồi
 */
export async function sendChatMessageToAi({
  messages,
  contextData,
  configOverride,
}) {
  const config = configOverride || getAiConfig();
  const baseUrl = config.baseUrl.replace(/\/+$/, '');
  const apiKey = (config.apiKey || '').trim();
  const model = config.model || 'qwen3.8-max-free';

  if (!apiKey) {
    return {
      success: false,
      needsApiKey: true,
      reply: '⚠️ Bạn chưa cài đặt API Key! Vui lòng mở Cài đặt API để điền API Key nhé 💕',
    };
  }

  const systemPrompt = buildSystemPrompt(contextData);

  const apiMessages = [
    { role: 'system', content: systemPrompt },
    ...messages.map((m) => ({
      role: m.role,
      content: m.content,
    })),
  ];

  try {
    const endpoint = `${baseUrl}/chat/completions`;
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model,
        messages: apiMessages,
        temperature: 0.2,
        max_tokens: 2500,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      let msg = `Lỗi máy chủ (${res.status})`;
      try {
        const j = JSON.parse(errText);
        msg = j?.error?.message || j?.message || msg;
      } catch (e) {
        msg = errText || msg;
      }
      return { success: false, error: msg };
    }

    const data = await res.json();
    const choice = data?.choices?.[0];
    const rawContent = choice?.message?.content || '';
    const finishReason = choice?.finish_reason || '';

    // Phân tích và trích xuất lệnh hành động (ACTION)
    let actionData = null;
    let cleanReply = '';

    // Cách 1: Tìm trong code block ```json ... ``` hoặc ``` ... ```
    const codeBlockMatch = rawContent.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    if (codeBlockMatch) {
      try {
        const parsed = JSON.parse(codeBlockMatch[1]);
        if (parsed && (parsed.type || parsed.action)) {
          actionData = parsed;
        }
      } catch (e) {
        // Format có thể bị lỗi cú pháp nhỏ, thử parse loose
      }
    }

    // Cách 2: Nếu chưa tìm được, tìm object JSON inline có chứa "type": "ACTION_..."
    if (!actionData) {
      const inlineMatch = rawContent.match(/\{[\s\r\n]*"(?:type|action)"[\s\S]*?\}(?!\s*\})/);
      if (inlineMatch) {
        try {
          const parsed = JSON.parse(inlineMatch[0]);
          if (parsed && (parsed.type || parsed.action)) {
            actionData = parsed;
          }
        } catch (e) {
          // Bỏ qua
        }
      }
    }

    // Loại bỏ triệt để mã JSON khỏi nội dung hiển thị cho người dùng (Tuyệt đối không hiển thị JSON)
    if (actionData && actionData.reply && typeof actionData.reply === 'string' && actionData.reply.trim()) {
      cleanReply = actionData.reply.trim();
    } else {
      let stripped = rawContent.replace(/```(?:json)?[\s\S]*?```/gi, '');
      stripped = stripped.replace(/\{[\s\S]*?"(?:type|action)"[\s\S]*?\}/gi, '');
      stripped = stripped.replace(/\{[\s\S]*?\}/g, '');
      cleanReply = stripped.trim();
    }

    // Nếu câu thoại bị rỗng hoặc còn dính code kỹ thuật, tạo câu thoại tự nhiên của Quản gia
    if (!cleanReply || cleanReply.length < 5 || cleanReply.includes('ACTION_') || cleanReply.includes('```')) {
      if (actionData?.type === 'ACTION_CONFIRM_DELETE') {
        cleanReply = 'Dạ Quản gia đã mở popup xác nhận xóa khoản có nhãn 🤖 Quản gia nhập trên màn hình rồi ạ! Cậu chủ / cô chủ vui lòng bấm xác nhận để em xóa khỏi database nhé! 💕';
      } else if (actionData?.type === 'ACTION_ADD_TRANSACTIONS') {
        cleanReply = 'Dạ em đã ghi nhận khoản chi tiêu có nhãn 🤖 Quản gia nhập vào sổ cho cậu chủ / cô chủ rồi ạ! 💕';
      } else if (actionData?.type === 'ACTION_UPDATE_TRANSACTION') {
        cleanReply = 'Dạ em đã cập nhật lại khoản có nhãn 🤖 Quản gia nhập theo đúng ý của cậu chủ / cô chủ rồi ạ! 💕';
      } else {
        cleanReply = 'Dạ em đã ghi nhận yêu cầu của cậu chủ / cô chủ rồi ạ! 💕';
      }
    }

    // Tự động kiểm tra xem phản hồi có bị ngắt token hoặc chưa hoàn thành không
    const trimmed = cleanReply.trim();
    const isTruncated = finishReason === 'length';
    const seemsIncomplete = isTruncated || (
      trimmed.length > 250 &&
      !/[.!?…💕✨🌸]["']?\s*$/.test(trimmed) &&
      !trimmed.endsWith('ạ!') &&
      !trimmed.endsWith('nhé!') &&
      !trimmed.endsWith('ạ.')
    );

    return {
      success: true,
      rawContent,
      reply: cleanReply,
      actionData,
      modelUsed: model,
      finishReason,
      isTruncated,
      canContinue: seemsIncomplete,
    };
  } catch (err) {
    return {
      success: false,
      error: err.message || 'Không thể kết nối đến máy chủ AI. Vui lòng kiểm tra kết nối mạng!',
    };
  }
}

