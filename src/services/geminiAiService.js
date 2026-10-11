// =========================================================================
// DỊCH VỤ GOOGLE AI STUDIO (GEMINI ASSISTANT SERVICE)
// =========================================================================
import { getSharedAiConfig, upsertSharedAiConfig } from '../supabaseClient';

export const AVAILABLE_MODELS = [
  {
    id: 'gemini-3.5-flash-lite',
    name: 'Gemini 3.5 Flash Lite (Mặc định ⭐)',
    badge: 'Khuyên dùng ⭐',
    speed: '~0.4s - 0.7s Siêu tốc',
    rpm: '30 RPM',
    rpmDesc: '30 yêu cầu/phút',
    rpd: '1,500 RPD',
    rpdDesc: '1,500 yêu cầu/ngày',
    tpm: '1,000,000 TPM',
    tpmDesc: '1 triệu token/phút',
    cost: 'Miễn phí $0',
    description: 'Thế hệ mới nhất, tốc độ phản hồi nhanh nhất, hạn mức quota cao gấp đôi (30 RPM) — ghi chép thu chi tức thì không lo nghẽn',
    isDefault: true
  },
  {
    id: 'gemini-3.8-flash',
    name: 'Gemini 3.8 Flash (Thông minh & Đa nhiệm 🚀)',
    badge: 'Cân bằng ⚡',
    speed: '~0.9s - 1.2s Nhanh',
    rpm: '15 RPM',
    rpmDesc: '15 yêu cầu/phút',
    rpd: '1,500 RPD',
    rpdDesc: '1,500 yêu cầu/ngày',
    tpm: '1,000,000 TPM',
    tpmDesc: '1 triệu token/phút',
    cost: 'Miễn phí $0',
    description: 'Hiểu ngữ cảnh gia đình và suy luận câu lệnh tự nhiên cực kỳ xuất sắc, cân bằng giữa tốc độ và độ thông minh'
  },
  {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash (Tiêu chuẩn ⚡)',
    badge: 'Tiêu chuẩn',
    speed: '~1.0s - 1.4s',
    rpm: '15 RPM',
    rpmDesc: '15 yêu cầu/phút',
    rpd: '1,500 RPD',
    rpdDesc: '1,500 yêu cầu/ngày',
    tpm: '1,000,000 TPM',
    tpmDesc: '1 triệu token/phút',
    cost: 'Miễn phí $0',
    description: 'Mô hình thế hệ 2.5 tiêu chuẩn, tính toán thu chi chuẩn mực và phản hồi ổn định'
  },
  {
    id: 'gemini-2.5-pro',
    name: 'Gemini 2.5 Pro (Tư duy chuyên sâu 🧠)',
    badge: 'Suy luận 🧠',
    speed: '~3.0s - 5.0s',
    rpm: '2 RPM',
    rpmDesc: '2 yêu cầu/phút (Free Tier)',
    rpd: '50 RPD',
    rpdDesc: '50 yêu cầu/ngày (Free Tier)',
    tpm: '32,000 TPM',
    tpmDesc: '32k token/phút',
    cost: 'Miễn phí $0',
    description: 'Khả năng suy luận logic và tính toán tài chính phức tạp nhất; lưu ý gói Free giới hạn 2 req/phút'
  },
  {
    id: 'gemini-1.5-flash',
    name: 'Gemini 1.5 Flash (Kinh điển 🛡️)',
    badge: 'Ổn định',
    speed: '~1.2s',
    rpm: '15 RPM',
    rpmDesc: '15 yêu cầu/phút',
    rpd: '1,500 RPD',
    rpdDesc: '1,500 yêu cầu/ngày',
    tpm: '1,000,000 TPM',
    tpmDesc: '1 triệu token/phút',
    cost: 'Miễn phí $0',
    description: 'Bản 1.5 Flash kinh điển, độ ổn định cao và xử lý tốt các tác vụ cơ bản'
  },
  {
    id: 'gemini-1.5-pro',
    name: 'Gemini 1.5 Pro (Ngữ cảnh dài 📜)',
    badge: 'Ngữ cảnh dài',
    speed: '~3.5s',
    rpm: '2 RPM',
    rpmDesc: '2 yêu cầu/phút (Free Tier)',
    rpd: '50 RPD',
    rpdDesc: '50 yêu cầu/ngày (Free Tier)',
    tpm: '32,000 TPM',
    tpmDesc: '32k token/phút',
    cost: 'Miễn phí $0',
    description: 'Ngữ cảnh 2 triệu token, phù hợp đọc và phân tích toàn bộ lịch sử chi tiêu nhiều năm'
  }
];

const CONFIG_STORAGE_KEY = 'nt_gemini_config';
const OLD_KIRA_STORAGE_KEY = 'nt_kiraai_config';

/**
 * Đồng bộ cấu hình AI từ Supabase Cloud vào localStorage (dùng chung cho cả Nhựt & Trang)
 */
export function syncCloudAiConfigToLocal(cloudConfig) {
  if (!cloudConfig || !cloudConfig.apiKey) return;
  try {
    const current = getAiConfig();
    const updated = {
      baseUrl: cloudConfig.baseUrl || current.baseUrl || 'https://generativelanguage.googleapis.com/v1beta',
      apiKey: (cloudConfig.apiKey || current.apiKey || '').trim(),
      model: cloudConfig.model || current.model || 'gemini-3.5-flash-lite',
    };
    localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('Lỗi đồng bộ cấu hình AI cloud vào local:', e);
  }
}

/**
 * Lấy cấu hình Google AI Studio Gemini hiện tại (ưu tiên localStorage, fallback sang .env)
 */
export function getAiConfig() {
  try {
    // Xóa sạch cache cũ của Kira nếu còn lưu trên trình duyệt
    if (localStorage.getItem(OLD_KIRA_STORAGE_KEY)) {
      localStorage.removeItem(OLD_KIRA_STORAGE_KEY);
    }

    const saved = localStorage.getItem(CONFIG_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        baseUrl: parsed.baseUrl || import.meta.env.VITE_GEMINI_BASE_URL || 'https://generativelanguage.googleapis.com/v1beta',
        apiKey: parsed.apiKey || import.meta.env.VITE_GEMINI_API_KEY || '',
        model: parsed.model || import.meta.env.VITE_GEMINI_DEFAULT_MODEL || 'gemini-3.5-flash-lite',
      };
    }
  } catch (e) {
    console.warn('Lỗi đọc cấu hình AI:', e);
  }

  return {
    baseUrl: import.meta.env.VITE_GEMINI_BASE_URL || 'https://generativelanguage.googleapis.com/v1beta',
    apiKey: import.meta.env.VITE_GEMINI_API_KEY || '',
    model: import.meta.env.VITE_GEMINI_DEFAULT_MODEL || 'gemini-3.5-flash-lite',
  };
}

/**
 * Tải cấu hình dùng chung từ Supabase Cloud
 */
export async function fetchSharedAiConfigFromCloud() {
  try {
    const cloudCfg = await getSharedAiConfig();
    if (cloudCfg && cloudCfg.apiKey) {
      syncCloudAiConfigToLocal(cloudCfg);
      return cloudCfg;
    }
  } catch (e) {
    console.warn('Không thể tải AI config từ cloud:', e);
  }
  return null;
}

/**
 * Lưu cấu hình Google AI Studio vào localStorage VÀ tự động đồng bộ lên Supabase Cloud
 * Giúp cả Nhựt và Trang trên mọi thiết bị dùng chung 1 khóa API duy nhất!
 */
export async function saveAiConfig(config) {
  try {
    const toSave = {
      baseUrl: (config.baseUrl || 'https://generativelanguage.googleapis.com/v1beta').trim(),
      apiKey: (config.apiKey || '').trim(),
      model: config.model || 'gemini-3.5-flash-lite',
    };
    // 1. Lưu tức thì vào máy hiện tại
    localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(toSave));

    // 2. Tự động lưu lên Cloud Supabase để chia sẻ ngay cho tài khoản còn lại
    upsertSharedAiConfig(toSave).catch((err) => {
      console.warn('Đồng bộ Cloud AI Config ngầm thất bại (chỉ lưu cục bộ):', err);
    });

    return true;
  } catch (e) {
    console.error('Lỗi lưu cấu hình AI:', e);
    return false;
  }
}

/**
 * Kiểm tra kết nối tới Google AI Studio Endpoint
 */
export async function testAiConnection(config) {
  const baseUrl = (config?.baseUrl || getAiConfig().baseUrl || 'https://generativelanguage.googleapis.com/v1beta').replace(/\/+$/, '');
  const apiKey = (config?.apiKey || getAiConfig().apiKey).trim();
  const model = config?.model || getAiConfig().model || 'gemini-3.5-flash-lite';

  if (!apiKey) {
    return { success: false, error: 'Chưa có Google AI Studio API Key. Vui lòng nhập API Key để kiểm tra!' };
  }

  try {
    const endpoint = `${baseUrl}/models/${model}:generateContent?key=${apiKey}`;
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: 'Xin chào! Trả lời ngắn gọn: Kết nối Google AI Studio thành công.' }]
          }
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 50,
        }
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
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'Kết nối Google AI Studio thành công!';
    return { success: true, reply };
  } catch (err) {
    return { success: false, error: err.message || 'Lỗi mạng hoặc không thể kết nối tới Google AI Studio' };
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
    `  • Mục tiêu "${g.title}": Đã có ${new Intl.NumberFormat('vi-VN').format(g.current || 0)} đ / ${new Intl.NumberFormat('vi-VN').format(g.target || 0)} đ (${Math.round(((g.current || 0) / (g.target || 1)) * 100)}%) | Phân loại: ${g.category || 'Gia đình'}${g.deadline ? ` | Hạn chót: ${g.deadline}` : ''}`
  );

  // Lịch sử các tháng
  const monthlyConfigLines = Object.entries(monthlyConfigs || {}).map(([mId, c]) =>
    `  • Tháng ${mId}: Hạn mức ${new Intl.NumberFormat('vi-VN').format(c.han_muc_chi || 0)} đ | Mục tiêu: "${c.banner_focus || ''}"`
  );

  return `Bạn là "Quản gia nhà Nhựt Trang" 💕 — một người quản gia tài chính thông minh, mực thước, chu đáo, tinh tế, nắm rõ 100% sổ sách và trung thành của gia đình.

NGUYÊN TẮC BẢO TOÀN DỮ LIỆU & CHỐNG BỊA ĐẶT SỐ LIỆU (TUYỆT ĐỐI TUÂN THỦ):
1. QUẢN GIA CHỈ ĐƯỢC PHÉP ĐỌC VÀ TRÍCH DẪN DỮ LIỆU NỘI BỘ TỪ DATABASE NHÀ NHỰT TRANG:
- Toàn bộ thông số về các khoản thu chi, số tiền, ngày giờ, số dư ví hiện có, hạn mức ngân sách tháng và các mục tiêu tiết kiệm PHẢI 100% dựa trên dữ liệu thực tế được cung cấp trong bối cảnh database dưới đây.
- TUYỆT ĐỐI KHÔNG ĐƯỢC BỊA ĐẶT, hư cấu, đoán mò hay phóng đại bất kỳ số liệu, con số hoặc khoản chi tiêu nào.
- Nếu người dùng hỏi về một khoản chi tiêu, khoản thu, ngày hoặc món đồ mà TRONG SỔ SÁCH KHÔNG CÓ HOẶC CHƯA GHI NHẬN: Bạn PHẢI trả lời thành thật, lễ phép và rõ ràng: "Dạ thưa cậu chủ/cô chủ, trong dữ liệu sổ sách của gia đình hiện tại chưa có ghi nhận khoản này ạ. Cậu chủ/cô chủ có muốn em ghi nhận thêm khoản này vào sổ không ạ? 💕". TUYỆT ĐỐI KHÔNG tự bịa ra con số hay giả vờ là đã có khoản chi đó!
- Đối với Mục tiêu tiết kiệm: CHỈ ĐỌC đúng các mục tiêu đang có trong danh sách bên dưới. TUYỆT ĐỐI KHÔNG nhắc đến bất kỳ mục tiêu giả định hay mục tiêu mẫu cũ nào khác.

2. VỀ KHẢ NĂNG HỎI ĐÁP & TRÒ CHUYỆN BÌNH THƯỜNG:
- Bạn CÓ THỂ hỏi đáp, tâm sự, chào hỏi, chia sẻ kiến thức đời sống, tư vấn kinh nghiệm chi tiêu hợp lý, mẹo tiết kiệm, công thức nấu ăn, tính toán toán học, hỏi thăm sức khỏe... một cách tự nhiên, lịch thiệp, thông minh và ấm áp.
- Việc cấm bịa đặt chỉ áp dụng đối với DỮ LIỆU SỐ SÁCH THỰC TẾ CỦA GIA ĐÌNH. Đối với các câu hỏi kiến thức, trò chuyện thông thường hoặc tư vấn ý kiến, bạn hoàn toàn thoải mái trò chuyện như một người quản gia uyên bác, ân cần.

QUY TẮC XƯNG HÔ & TỰ ĐỘNG NHẬN BIẾT CHỦ NHÂN THEO TÀI KHOẢN (BẮT BUỘC):
- Luôn xưng là "Quản gia" hoặc "em", và gọi người đang trò chuyện là **"${activeRoleName}"** (hiện tại tài khoản đang đăng nhập là: ${activeRoleName}). Tuyệt đối không xưng hô chung chung hay xuồng xã.
- TỰ ĐỘNG NHẬN BIẾT 100% QUA TÀI KHOẢN ĐĂNG NHẬP:
  + Tài khoản đăng nhập hiện tại là: **${activeRoleName}** (${activeUser === 'trang' ? 'cô chủ Trang' : 'cậu chủ Nhựt'}).
  + Bạn PHẢI tự động xưng hô trực tiếp với ${activeRoleName} trong mọi câu trả lời (Ví dụ: "Dạ thưa ${activeRoleName}...", "Dạ ${activeRoleName} yên tâm ạ... 💕").
  + TUYỆT ĐỐI KHÔNG ĐƯỢC HỎI LẠI "em đang được phục vụ cậu chủ hay cô chủ", không được hỏi danh tính vì hệ thống đã tự động nhận biết chính xác qua tài khoản đăng nhập rồi!
- NGUYÊN TẮC SUY LUẬN KHI THÊM KHOẢN CHI/THU:
  + Mọi khoản thu chi nếu chủ nhân không nói rõ tên ai thì MẶC ĐỊNH là do ${activeRoleName} thực hiện:
    * Nếu tài khoản là Trang: author là "Trang", vault là "personal_trang" (hoặc "shared" nếu là đồ ăn, đồ dùng chung gia đình).
    * Nếu tài khoản là Nhựt: author là "Nhựt", vault là "personal_nhut" (hoặc "shared" nếu là đồ ăn, đồ dùng chung gia đình).

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
${goalLines.length === 0 ? '  (Hiện tại gia đình chưa thiết lập mục tiêu nào trong database)' : goalLines.join('\n')}

HẠN MỨC & CẤU HÌNH CÁC THÁNG:
${monthlyConfigLines.length === 0 ? '  (Chưa có cấu hình)' : monthlyConfigLines.join('\n')}

TOÀN BỘ CÁC KHOẢN GIAO DỊCH TRONG SỔ (ĐÃ SẮP XẾP TỪ MỚI ĐẾN CŨ):
${formattedTxLines.length === 0 ? '  (Sổ thu chi hiện đang trống)' : formattedTxLines.join('\n')}

CÁC KHOẢN GIAO DỊCH DO QUẢN GIA NHẬP (CÓ THỂ SỬA/XÓA):
${aiTxList.length === 0 ? '  (Hiện chưa có giao dịch nào do Quản gia nhập)' : aiTxList.map(t => `  - ID: "${t.id}" | ${formatDateDisplay(t.ngay)} | "${t.noi_dung}" | ${(Number(t.chi) || 0) > 0 ? '-' + new Intl.NumberFormat('vi-VN').format(t.chi) : '+' + new Intl.NumberFormat('vi-VN').format(t.thu)} đ | Tag: "Quản gia nhập"`).join('\n')}

QUY TẮC TRA CỨU & VẬN DỤNG KIẾN THỨC TOÀN BỘ APP:
1. TRA CỨU THEO NGÀY (CỰC KỲ CHÍNH XÁC, TUYỆT ĐỐI KHÔNG BỊA ĐẶT):
- Khi người dùng hỏi "hôm qua": Bạn PHẢI đối chiếu ngay các dòng có tag [HÔM QUA - ...] (chính là ngày ${yesterdayDisplay} / ${yesterdayISO}). Liệt kê chi tiết toàn bộ các khoản thu/chi diễn ra vào ngày đó, nêu rõ tên khoản, số tiền, và tổng kết. Nếu ngày hôm qua thực sự không có giao dịch nào trong sổ, hãy báo rõ ràng là ngày hôm qua chưa ghi nhận khoản nào.
- Khi người dùng hỏi "hôm nay": Đối chiếu các dòng có tag [HÔM NAY - ...] (ngày ${todayDisplay} / ${todayISO}).
- Khi người dùng hỏi "hôm kia": Đối chiếu các dòng có tag [HÔM KIA - ...] (ngày ${beforeYesterdayDisplay} / ${beforeYesterdayISO}).
- Khi người dùng hỏi bất kỳ ngày nào khác (ví dụ: ngày 07/10, ngày 6/10...): Tra cứu ngày tương ứng trong danh sách để liệt kê. Nếu ngày đó không có, báo chưa có khoản nào ghi nhận cho ngày đó.

2. TRA CỨU THEO DANH MỤC, VÍ, THÀNH VIÊN & MỤC TIÊU (CHỈ DỰA VÀO DỮ LIỆU THẬT):
- Khi hỏi về ăn uống, đi lại, công việc, nhà cửa...: Sử dụng mục "THỐNG KÊ CHI TIÊU THEO DANH MỤC" để trả lời con số chính xác kèm các khoản tiêu biểu có thật trong sổ.
- Khi hỏi ai chi nhiều hơn, Nhựt chi bao nhiêu, Trang chi bao nhiêu: Sử dụng mục "THỐNG KÊ CHI TIÊU THEO THÀNH VIÊN & VÍ".
- Khi hỏi về các tháng trước hoặc kế hoạch tiết kiệm: Sử dụng mục "HẠN MỨC & CẤU HÌNH CÁC THÁNG" và "MỤC TIÊU TIẾT KIỆM GIA ĐÌNH". Chỉ trả lời đúng các mục tiêu đang có trong database, không bịa mục tiêu khác.

3. THÊM THU CHI KHI CẬU CHỦ HOẶC CÔ CHỦ YÊU CẦU (GẮN TAG "Quản gia nhập"):
- Quản gia CHỈ THÊM thu chi khi cậu chủ hoặc cô chủ yêu cầu Quản gia thêm vào sổ.
- TẤT CẢ các khoản do Quản gia thêm BẮT BUỘC PHẢI GẮN TAG "Quản gia nhập":
  + "ghi_chu": "Quản gia nhập"
  + "tag": "Quản gia nhập"
  + "is_ai": true
  + "created_by": "ai"
Trả về khối JSON:
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
      "tag": "Quản gia nhập",
      "ghi_chu": "Quản gia nhập"
    }
  ],
  "reply": "Dạ em đã ghi nhận khoản ăn trưa 45k (🤖 Quản gia nhập) vào sổ cho cậu chủ Nhựt rồi ạ! 💕"
}
\`\`\`
Quy tắc tự suy luận ví và người:
- Cô chủ Trang nói / nhắc Trang: author "Trang", vault "personal_trang" (hoặc "shared" nếu đồ chung gia đình).
- Cậu chủ Nhựt nói / nhắc Nhựt: author "Nhựt", vault "personal_nhut".
- Tiền ghi bằng k/K (45k = 45000, 1tr = 1000000).

4. NGUYÊN TẮC BẢO MẬT & PHÂN QUYỀN THÊM, XÓA, SỬA (TUYỆT ĐỐI TUÂN THỦ):
- QUẢN GIA CHỈ CÓ QUYỀN THÊM, XÓA, SỬA NHỮNG KHOẢN MÀ CẬU CHỦ HOẶC CÔ CHỦ ĐÃ YÊU CẦU QUẢN GIA THÊM (tất cả các khoản này đều mang nhãn 'Quản gia nhập' và nằm trong danh sách "CÁC KHOẢN GIAO DỊCH DO QUẢN GIA NHẬP" ở trên).
- NHỮNG KHOẢN DO GIA ĐÌNH TỰ THÊM THỦ CÔNG: QUẢN GIA TUYỆT ĐỐI KHÔNG ĐƯỢC THÊM, XÓA HAY SỬA DƯỚI BẤT KỲ HÌNH THỨC NÀO!
  + Nếu cậu chủ hoặc cô chủ yêu cầu Quản gia sửa hoặc xóa bất kỳ khoản nào do tự nhập thủ công (không có nhãn 'Quản gia nhập'): Bạn TUYỆT ĐỐI KHÔNG xuất action JSON sửa hay xóa.
  + Thay vào đó, bạn PHẢI từ chối lịch sự và giải thích rõ ràng: "Dạ thưa cậu chủ/cô chủ, khoản này không có nhãn 🤖 Quản gia nhập (do gia đình mình tự nhập thủ công vào sổ). Quản gia chỉ được phép can thiệp thêm, xóa, sửa các khoản do Quản gia nhập để bảo toàn tuyệt đối 100% dữ liệu gốc của chủ nhà ạ. Cậu chủ/cô chủ vui lòng thao tác trực tiếp trên Bảng danh sách giúp em nhé! 💕"
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
  "reply": "Dạ Quản gia đã mở popup xác nhận xóa cho khoản có tag 🤖 Quản gia nhập này rồi ạ. Cậu chủ / cô chủ vui lòng bấm xác nhận trên popup để em xóa khỏi database nhé! 💕"
}
\`\`\`
- KHI CẬU CHỦ/CÔ CHỦ YÊU CẦU SỬA MỘT KHOẢN CÓ TAG "Quản gia nhập":
  Hãy tìm đúng ID của giao dịch đó trong danh sách "CÁC KHOẢN GIAO DỊCH DO QUẢN GIA NHẬP" và trả về khối JSON:
\`\`\`json
{
  "type": "ACTION_UPDATE_TRANSACTION",
  "target_tx_id": "ID_chính_xác_của_giao_dịch_có_tag_Quản_gia_nhập",
  "updates": {
    "noi_dung": "Tên mới nếu có đổi",
    "so_tien": 50000,
    "phan_loai": "ăn uống"
  },
  "reply": "Dạ em đã cập nhật lại khoản có nhãn 🤖 Quản gia nhập này theo đúng ý của cậu chủ / cô chủ rồi ạ! 💕"
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
 * Gửi tin nhắn đến Google AI Studio (Gemini) và xử lý phản hồi
 */
export async function sendChatMessageToAi({
  messages,
  contextData,
  configOverride,
}) {
  const config = configOverride || getAiConfig();
  const baseUrl = (config.baseUrl || 'https://generativelanguage.googleapis.com/v1beta').replace(/\/+$/, '');
  const apiKey = (config.apiKey || '').trim();
  const model = config.model || 'gemini-3.5-flash-lite';

  if (!apiKey) {
    return {
      success: false,
      needsApiKey: true,
      reply: '⚠️ Bạn chưa cài đặt Google AI Studio API Key! Vui lòng mở Cài đặt API để điền API Key nhé 💕',
    };
  }

  const systemPrompt = buildSystemPrompt(contextData);

  // Chuẩn bị danh sách contents cho Gemini API (role: user hoặc model)
  const geminiContents = [];

  for (const m of messages) {
    const role = (m.role === 'assistant' || m.role === 'model') ? 'model' : 'user';
    const text = (m.content || '').trim();
    if (text) {
      if (geminiContents.length > 0 && geminiContents[geminiContents.length - 1].role === role) {
        // Gộp tin nhắn liên tiếp cùng role để đảm bảo luân phiên user/model đúng chuẩn Gemini
        geminiContents[geminiContents.length - 1].parts[0].text += `\n\n${text}`;
      } else {
        geminiContents.push({
          role,
          parts: [{ text }]
        });
      }
    }
  }

  // Đảm bảo tin nhắn đầu tiên gửi lên Gemini luôn là user
  if (geminiContents.length > 0 && geminiContents[0].role === 'model') {
    geminiContents.unshift({
      role: 'user',
      parts: [{ text: 'Bắt đầu cuộc trò chuyện.' }]
    });
  } else if (geminiContents.length === 0) {
    geminiContents.push({
      role: 'user',
      parts: [{ text: 'Xin chào Quản gia!' }]
    });
  }

  try {
    const endpoint = `${baseUrl}/models/${model}:generateContent?key=${apiKey}`;
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: systemPrompt }]
        },
        contents: geminiContents,
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 4096,
        },
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      let msg = `Lỗi máy chủ Google (${res.status})`;
      try {
        const j = JSON.parse(errText);
        msg = j?.error?.message || j?.message || msg;
      } catch (e) {
        msg = errText || msg;
      }
      return { success: false, error: msg };
    }

    const data = await res.json();
    const candidate = data?.candidates?.[0];
    const parts = candidate?.content?.parts || [];
    const rawContent = parts.map(p => p.text || '').join('\n');
    const finishReason = candidate?.finishReason || '';

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
    const isTruncated = finishReason === 'MAX_TOKENS' || finishReason === 'length';
    const seemsIncomplete = isTruncated || (
      trimmed.length > 250 &&
      !/[.!?…💕✨🌸]["']?\s*$/u.test(trimmed) &&
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
      error: err.message || 'Không thể kết nối đến Google AI Studio. Vui lòng kiểm tra API Key và kết nối mạng!',
    };
  }
}
