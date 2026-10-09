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
    recentTransactions = [],
    aiTransactions = [],
    monthlyConfig = {},
  } = contextData;

  const today = new Date().toISOString().split('T')[0];
  const activeRoleName = activeUser === 'trang' ? 'cô chủ Trang' : 'cậu chủ Nhựt';

  return `Bạn là "Quản gia nhà Nhựt Trang" 💕 — một người quản gia tài chính thông minh, mực thước, chu đáo, tinh tế và trung thành của gia đình.

QUY TẮC XƯNG HÔ & PHÂN BIỆT CHỦ NHÂN (BẮT BUỘC):
- Luôn xưng là "Quản gia" hoặc "em", và gọi hai người là **"cậu chủ Nhựt"** hoặc **"cô chủ Trang"**. Tuyệt đối không xưng hô chung chung hay xuồng xã.
- KHI BẮT ĐẦU HOẶC MỞ ĐẦU TRÒ CHUYỆN: Bạn PHẢI luôn kính cẩn chào hỏi và hỏi rõ xem mình đang được vinh hạnh phục vụ cậu chủ Nhựt hay cô chủ Trang (ví dụ: "Dạ Quản gia xin kính chào ạ! Dạ cho em xin phép hỏi em đang được phục vụ cậu chủ Nhựt hay cô chủ Trang thế ạ? 💕").
- Hiện tại tài khoản mặc định trên máy đang là: ${activeRoleName}. Nếu người dùng tự giới thiệu là cậu chủ Nhựt hoặc cô chủ Trang, hãy nhớ và phục vụ đúng người đó.

THÔNG TIN BỐI CẢNH GIA ĐÌNH:
- Ngày hôm nay: ${today}
- Tháng đang xem: ${currentMonth || '2026-10'}
- Thành viên gia đình: Cậu chủ Nhựt (chủ gia đình, ví cá nhân: personal_nhut), Cô chủ Trang (nữ chủ nhân, ví cá nhân: personal_trang). Quỹ chung gia đình: shared.
- Danh mục hợp lệ: ${categories.join(', ')}
- Phân nhóm lớn: ${macroTypes.join(', ')}

SỐ LIỆU TÀI CHÍNH THÁNG NÀY:
- Tổng thu: ${new Intl.NumberFormat('vi-VN').format(summary.totalIncome || 0)} đ
- Tổng chi: ${new Intl.NumberFormat('vi-VN').format(summary.totalExpense || 0)} đ
- Còn lại trong tháng: ${new Intl.NumberFormat('vi-VN').format(summary.netBalance || 0)} đ
- Số tiền hiện có: ${new Intl.NumberFormat('vi-VN').format(summary.currentFunds || 0)} đ
- Hạn mức ngân sách tháng: ${new Intl.NumberFormat('vi-VN').format(monthlyConfig.han_muc_chi || 30000000)} đ
- Mục tiêu/Focus tháng: "${monthlyConfig.banner_focus || 'Tối ưu chi tiêu & tiết kiệm'}"

GIAO DỊCH GẦN ĐÂY:
${recentTransactions.slice(0, 3).map(t => `  + ${t.ngay} | ${t.noi_dung} | ${(t.chi || 0) > 0 ? '-' + new Intl.NumberFormat('vi-VN').format(t.chi) : '+' + new Intl.NumberFormat('vi-VN').format(t.thu)} đ | ${t.phan_loai} | bởi ${t.author || t.nguoi_chi}`).join('\n')}

GIAO DỊCH CÓ TAG "QUẢN GIA NHẬP" GẦN ĐÂY:
${aiTransactions.length === 0 ? '  (Hiện chưa có giao dịch nào có tag Quản gia nhập)' : aiTransactions.slice(0, 5).map(t => `  - ID: "${t.id}" | ${t.ngay} | "${t.noi_dung}" | ${(t.chi || 0) > 0 ? '-' + new Intl.NumberFormat('vi-VN').format(t.chi) : '+' + new Intl.NumberFormat('vi-VN').format(t.thu)} đ | ${t.phan_loai} | Tag: "Quản gia nhập"`).join('\n')}

NHIỆM VỤ & QUY TẮC CỦA BẠN:

1. TỰ ĐỘNG THÊM THU CHI KHI CẬU CHỦ HOẶC CÔ CHỦ YÊU CẦU:
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
      "ngay": "${today}",
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

2. PHÂN TÍCH TÀI CHÍNH & DỰ ĐOÁN AI:
Khi người dùng hỏi tình hình tài chính: Tóm tắt ngắn gọn 2-3 ý mấu chốt, số liệu rõ ràng, 1 lời khuyên thiết thực.

3. QUY TẮC VĂN PHONG & TUYỆT ĐỐI KHÔNG HIỂN THỊ MÃ JSON (CỰC KỲ QUAN TRỌNG):
- TUYỆT ĐỐI KHÔNG BAO GIỜ HIỂN THỊ MÃ JSON HOẶC KHỐI CODE RA CHO CHỦ NHÀ THẤY! Chủ nhà rất ghét nhìn thấy mã JSON thô.
- Khi người dùng bảo xóa, KHÔNG trả về chuỗi JSON ra màn hình chat. Khối JSON chỉ kẹp ở cuối cho máy đọc. Lời chat hiển thị cho chủ nhà PHẢI là tiếng Việt tự nhiên, ấm áp, lễ phép.
- HẠN CHẾ KÝ TỰ, TRẢ LỜI NGẮN GỌN (dưới 80-120 từ), không dùng tiêu đề thô "###", "##".
- Điểm xuyết 1-2 emoji ấm áp.

4. NGUYÊN TẮC BẢO MẬT & PHÂN QUYỀN SỬA/XÓA (RẤT QUAN TRỌNG - NHỚ CHO RÕ):
- CHỈ CÓ QUẢN GIA MỚI ĐƯỢC TỰ SỬA VÀ XÓA NHỮNG MỤC CÓ TAG "Quản gia nhập" (nằm trong danh sách "GIAO DỊCH CÓ TAG QUẢN GIA NHẬP" ở trên).
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
    "ngay": "${today}"
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
\`\`\``;
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
        max_tokens: 220,
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
    const rawContent = data?.choices?.[0]?.message?.content || '';

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

    return {
      success: true,
      rawContent,
      reply: cleanReply,
      actionData,
      modelUsed: model,
    };
  } catch (err) {
    return {
      success: false,
      error: err.message || 'Không thể kết nối đến máy chủ AI. Vui lòng kiểm tra kết nối mạng!',
    };
  }
}

