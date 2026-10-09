import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkle, 
  X, 
  PaperPlaneTilt, 
  Gear, 
  Trash, 
  Robot, 
  Check, 
  ArrowClockwise,
  ChartLineUp,
  Coins,
  ShieldCheck,
  MagicWand,
  Heart
} from '@phosphor-icons/react';
import { sendChatMessageToAi, getAiConfig, saveAiConfig, AVAILABLE_MODELS } from '../services/kiraAiService';

/**
 * Component hiển thị nội dung tin nhắn tinh tế, gọn gàng
 * Xử lý các ký tự markdown thô (###, **, `, bullet) thành giao diện đẹp mắt
 */
function FormattedMessage({ content, isUser }) {
  if (!content) return null;
  if (isUser) {
    return <div className="whitespace-pre-line leading-relaxed">{content}</div>;
  }

  // Loại bỏ triệt để mã JSON và code block thô trước khi hiển thị cho người dùng
  const cleanContent = content
    .replace(/```(?:json)?[\s\S]*?```/gi, '')
    .replace(/\{[\s\S]*?"(?:type|action)"[\s\S]*?\}/gi, '')
    .trim() || 'Dạ Quản gia đã ghi nhận và phục vụ cậu chủ / cô chủ rồi ạ! 💕';

  // Parse inline markdown: **in đậm**, `mã / số tiền`
  const renderInline = (str) => {
    if (!str) return null;
    const parts = str.split(/(\*\*.*?\*\*|`.*?`)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
        return (
          <strong key={i} className="font-semibold text-slate-900">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
        return (
          <span
            key={i}
            className="px-1.5 py-0.5 mx-0.5 rounded-md bg-pink-100/70 text-pink-700 font-mono text-[11px] font-semibold border border-pink-200/50"
          >
            {part.slice(1, -1)}
          </span>
        );
      }
      return part;
    });
  };

  const lines = cleanContent.split('\n');

  return (
    <div className="space-y-1.5 leading-relaxed text-[11.5px] text-slate-700">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <div key={idx} className="h-0.5" />;
        }

        // Bỏ qua nếu là dòng JSON còn sót
        if (trimmed.startsWith('{') || trimmed.endsWith('}') || trimmed.includes('"type"') || trimmed.includes('ACTION_')) {
          return null;
        }

        // Header: ### hoặc ## hoặc #
        const headerMatch = trimmed.match(/^#{1,4}\s+(.+)$/);
        if (headerMatch) {
          return (
            <div
              key={idx}
              className="font-bold text-slate-800 text-[12px] pt-1.5 pb-0.5 flex items-center gap-1.5 text-pink-700"
            >
              <span className="w-1.5 h-3 rounded-full bg-gradient-to-b from-pink-500 to-rose-500 shrink-0 inline-block" />
              <span>{renderInline(headerMatch[1])}</span>
            </div>
          );
        }

        // Dòng điểm nhấn / Callout (👉, 💡, 📌)
        if (trimmed.startsWith('👉') || trimmed.startsWith('💡') || trimmed.startsWith('📌')) {
          return (
            <div
              key={idx}
              className="p-2 rounded-xl bg-pink-50/80 border border-pink-200/70 my-1 text-[11px] text-pink-900 font-medium leading-snug"
            >
              {renderInline(trimmed)}
            </div>
          );
        }

        // Dòng gạch đầu dòng: - hoặc * hoặc +
        const bulletMatch = trimmed.match(/^[-*+]\s+(.+)$/);
        if (bulletMatch) {
          return (
            <div key={idx} className="flex items-start gap-1.5 pl-0.5 my-0.5">
              <span className="text-pink-500 font-bold shrink-0 mt-0.5 leading-none">•</span>
              <span className="flex-1 leading-snug">{renderInline(bulletMatch[1])}</span>
            </div>
          );
        }

        // Dòng danh sách số: 1. 2. 3.
        const numMatch = trimmed.match(/^(\d+)\.\s+(.+)$/);
        if (numMatch) {
          return (
            <div key={idx} className="flex items-start gap-1.5 pl-0.5 my-0.5">
              <span className="text-pink-600 font-semibold text-[10.5px] shrink-0 mt-0.5">
                {numMatch[1]}.
              </span>
              <span className="flex-1 leading-snug">{renderInline(numMatch[2])}</span>
            </div>
          );
        }

        // Đoạn văn bản thông thường
        return (
          <p key={idx} className="leading-snug">
            {renderInline(line)}
          </p>
        );
      })}
    </div>
  );
}

export default function AiAssistantChat({
  isOpen,
  onToggle,
  onOpenSettings,
  onAddTransaction,
  onDeleteTransaction,
  onUpdateTransaction,
  transactions = [],
  monthlyConfig = {},
  members = [],
  activeUser = 'nhut',
  currentFunds = {},
  currentMonth = '',
  categories = [],
  macroTypes = [],
}) {
  const [messages, setMessages] = useState(() => {
    return [
      {
        id: 'msg-welcome',
        role: 'assistant',
        content: 'Dạ Quản gia xin kính chào ạ! 💕\n\nDạ cho em xin phép hỏi em đang được vinh hạnh phục vụ **cậu chủ Nhựt** hay **cô chủ Trang** thế ạ? ✨ Cậu chủ / cô chủ cứ dặn dò em ghi chép thu chi hoặc phân tích sổ sách nhé!',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        askWho: true,
      }
    ];
  });

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState(() => getAiConfig().model || 'kira-mini-1.0');
  // Trạng thái Popup modal xác nhận xóa giao dịch Quản gia nhập
  const [deleteConfirmModal, setDeleteConfirmModal] = useState({
    isOpen: false,
    tx: null,
    msgId: null,
  });
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Đồng bộ model khi mở chat
  useEffect(() => {
    if (isOpen) {
      setSelectedModel(getAiConfig().model || 'kira-mini-1.0');
    }
  }, [isOpen]);

  const handleModelChange = (newModelId) => {
    setSelectedModel(newModelId);
    const cfg = getAiConfig();
    saveAiConfig({ ...cfg, model: newModelId });
  };

  // Tự động cuộn xuống tin nhắn cuối
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [isOpen, messages]);

  // Tính toán nhanh số liệu tài chính tháng này để đưa vào context
  const getContextSummary = () => {
    const monthTx = transactions.filter(t => !currentMonth || (t.ngay && t.ngay.startsWith(currentMonth)));
    const totalIncome = monthTx.reduce((sum, t) => sum + (Number(t.thu) || 0), 0);
    const totalExpense = monthTx.reduce((sum, t) => sum + (Number(t.chi) || 0), 0);
    const netBalance = totalIncome - totalExpense;

    return {
      totalIncome,
      totalExpense,
      netBalance,
      currentFunds: currentFunds?.so_tien_hien_co || 0,
      txCount: monthTx.length,
    };
  };

  const handleSend = async (textToSend) => {
    const query = (textToSend || input).trim();
    if (!query || isLoading) return;

    const userMsgId = 'msg-' + Date.now();
    const newUserMsg = {
      id: userMsgId,
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, newUserMsg]);
    setInput('');

    const isAiTx = (t) => Boolean(
      t.is_ai || 
      t.created_by === 'ai' || 
      t.tag === 'Quản gia nhập' ||
      (t.ghi_chu && (
        t.ghi_chu.includes('Quản gia nhập') || 
        t.ghi_chu.includes('Quản gia') || 
        t.ghi_chu.includes('AI nhập')
      ))
    );
    const aiTransactions = transactions.filter(isAiTx);

    // ⚡ TỐI ƯU SIÊU TỐC: Xử lý tức thì lệnh XÓA (0.01 giây - không cần chờ mạng AI)
    const lowerQuery = query.toLowerCase();
    const isDeleteCommand = /(?:xóa|xoá|hủy|huỷ|bỏ|delete|remove)\s+(?:khoản|mục|giao dịch|món|chi tiêu)?/i.test(lowerQuery);

    if (isDeleteCommand) {
      let matchedTx = null;
      if (/(?:vừa nhập|mới nhập|vừa thêm|mới thêm|gần nhất)/i.test(lowerQuery) && aiTransactions.length > 0) {
        matchedTx = aiTransactions[0];
      } else {
        matchedTx = aiTransactions.find((tx) => {
          const name = (tx.noi_dung || '').toLowerCase();
          const numChi = tx.chi ? String(tx.chi) : '';
          const numThu = tx.thu ? String(tx.thu) : '';
          return (name && lowerQuery.includes(name)) || (numChi && lowerQuery.includes(numChi)) || (numThu && lowerQuery.includes(numThu));
        });
      }

      if (matchedTx) {
        // Mở popup xác nhận xóa ngay lập tức (0ms)
        const assistantMsgId = 'msg-' + Date.now();
        setDeleteConfirmModal({
          isOpen: true,
          tx: matchedTx,
          msgId: assistantMsgId,
        });
        setMessages((prev) => [
          ...prev,
          {
            id: assistantMsgId,
            role: 'assistant',
            content: `Dạ Quản gia đã mở popup xác nhận xóa cho khoản **${matchedTx.noi_dung}** (🤖 Quản gia nhập) trên màn hình rồi ạ! Cậu chủ / cô chủ vui lòng bấm xác nhận trên màn hình giúp em nhé! 💕`,
            pendingDelete: matchedTx,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          }
        ]);
        return;
      } else {
        // Kiểm tra xem có nhắc đến khoản tự nhập tay không
        const manualMatch = transactions.find((tx) => {
          if (isAiTx(tx)) return false;
          const name = (tx.noi_dung || '').toLowerCase();
          return name && lowerQuery.includes(name);
        });
        if (manualMatch) {
          setMessages((prev) => [
            ...prev,
            {
              id: 'msg-' + Date.now(),
              role: 'assistant',
              content: `Dạ thưa cậu chủ/cô chủ, khoản **${manualMatch.noi_dung}** không có nhãn 🤖 Quản gia nhập (do chủ nhà tự nhập tay vào sổ). Quản gia chỉ được phép can thiệp xóa các khoản do Quản gia nhập để bảo toàn dữ liệu gốc ạ! Cậu chủ / cô chủ vui lòng thao tác trực tiếp trên Bảng danh sách giúp em nhé! 💕`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            }
          ]);
          return;
        }
      }
    }

    setIsLoading(true);

    const contextData = {
      currentMonth,
      activeUser,
      members,
      categories,
      macroTypes,
      summary: getContextSummary(),
      recentTransactions: transactions.slice(0, 3), // Rút gọn token context
      aiTransactions: aiTransactions.slice(0, 5),   // Rút gọn token context
      monthlyConfig,
    };

    // Rút gọn lịch sử: chỉ gửi 4 tin nhắn gần nhất thay vì toàn bộ cuộc hội thoại dài
    const recentHistory = messages.filter(m => m.id !== 'msg-welcome').slice(-4);
    const chatHistory = [...recentHistory, newUserMsg].map(m => ({
      role: m.role,
      content: m.content
    }));

    try {
      const res = await sendChatMessageToAi({
        messages: chatHistory,
        contextData,
        configOverride: { ...getAiConfig(), model: selectedModel },
      });

      if (!res.success) {
        setMessages((prev) => [
          ...prev,
          {
            id: 'msg-' + Date.now(),
            role: 'assistant',
            content: res.needsApiKey 
              ? '⚠️ Bạn chưa cài đặt API Key! Hãy bấm nút bánh răng bên trên để nhập API Key nhé 💕'
              : `⚠️ Lỗi kết nối: ${res.error}`,
            isError: true,
            needsApiKey: res.needsApiKey,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          }
        ]);
        return;
      }

      // Xử lý các lệnh hành động do AI trả về
      let addedTxs = [];
      let pendingDelete = null;
      let updatedTx = null;

      if (res.actionData) {
        // 1. Thêm giao dịch tự động
        if ((res.actionData.type === 'ACTION_ADD_TRANSACTIONS' || res.actionData.action === 'ADD_TRANSACTION') && onAddTransaction) {
          const txList = res.actionData.transactions || (res.actionData.data ? [res.actionData.data] : []);
          for (const item of txList) {
            const num = Number(item.so_tien || item.amount) || 0;
            if (num > 0) {
              const today = new Date().toISOString().split('T')[0];
              const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              
              let cleanGhiChu = (item.ghi_chu || '').trim();
              if (!cleanGhiChu || cleanGhiChu.toLowerCase().includes('ai nhập')) {
                cleanGhiChu = 'Quản gia nhập';
              } else if (!cleanGhiChu.includes('Quản gia nhập')) {
                cleanGhiChu = `Quản gia nhập - ${cleanGhiChu}`;
              }

              const newTx = {
                id: 'tx-ai-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
                ngay: item.ngay || today,
                gio: item.gio || nowTime,
                noi_dung: item.noi_dung || item.label || 'Chi tiêu qua Quản gia',
                thu: item.is_thu ? num : 0,
                chi: !item.is_thu ? num : 0,
                phan_loai: item.phan_loai || 'ăn uống',
                loai: item.loai || 'thiết yếu',
                author: item.author || (activeUser === 'trang' ? 'Trang' : 'Nhựt'),
                vault: item.vault || (activeUser === 'trang' ? 'personal_trang' : 'personal_nhut'),
                is_ai: true,
                created_by: 'ai',
                tag: 'Quản gia nhập',
                ghi_chu: cleanGhiChu
              };

              await onAddTransaction(newTx);
              addedTxs.push(newTx);
            }
          }
        }

        // 2. Yêu cầu chủ nhà xác nhận xóa giao dịch do AI tạo
        if (res.actionData.type === 'ACTION_CONFIRM_DELETE' && res.actionData.target_tx) {
          const targetId = res.actionData.target_tx.id;
          const found = transactions.find((t) => t.id === targetId) || res.actionData.target_tx;
          if (found && isAiTx(found)) {
            pendingDelete = found;
            // Tự động bật Popup Modal xác nhận xóa
            setDeleteConfirmModal({
              isOpen: true,
              tx: found,
              msgId: 'msg-' + Date.now(),
            });
          }
        }

        // 3. Sửa giao dịch do AI tạo
        if (res.actionData.type === 'ACTION_UPDATE_TRANSACTION' && onUpdateTransaction) {
          const targetId = res.actionData.target_tx_id || res.actionData.id;
          const target = transactions.find((t) => t.id === targetId);
          if (target && isAiTx(target)) {
            const updates = res.actionData.updates || {};
            const formattedUpdates = { ...updates };
            if (updates.so_tien !== undefined) {
              const num = Number(updates.so_tien) || 0;
              const isThu = updates.is_thu !== undefined ? updates.is_thu : ((target.thu || 0) > 0);
              if (isThu) {
                formattedUpdates.thu = num;
                formattedUpdates.chi = 0;
              } else {
                formattedUpdates.chi = num;
                formattedUpdates.thu = 0;
              }
              delete formattedUpdates.so_tien;
            }
            await onUpdateTransaction(targetId, formattedUpdates);
            updatedTx = { targetId, noi_dung: updates.noi_dung || target.noi_dung, updates };
          }
        }
      }

      // Fallback thông minh: nếu người dùng yêu cầu xóa mà AI chưa bật action (hoặc không xuất JSON)
      if (!pendingDelete) {
        const lowerInput = query.toLowerCase();
        const isDeleteCommand = /(?:xóa|xoá|hủy|huỷ|bỏ|delete|remove)\s+(?:khoản|mục|giao dịch|món|chi tiêu)?/i.test(lowerInput);
        if (isDeleteCommand) {
          let matchedTx = null;
          if (/(?:vừa nhập|mới nhập|vừa thêm|mới thêm|gần nhất)/i.test(lowerInput) && aiTransactions.length > 0) {
            matchedTx = aiTransactions[0];
          } else {
            // Tìm trong aiTransactions theo từ khóa hoặc số tiền
            matchedTx = aiTransactions.find((tx) => {
              const name = (tx.noi_dung || '').toLowerCase();
              const numChi = tx.chi ? String(tx.chi) : '';
              const numThu = tx.thu ? String(tx.thu) : '';
              return (name && lowerInput.includes(name)) || (numChi && lowerInput.includes(numChi)) || (numThu && lowerInput.includes(numThu));
            });
          }

          if (matchedTx) {
            pendingDelete = matchedTx;
            setDeleteConfirmModal({
              isOpen: true,
              tx: matchedTx,
              msgId: 'msg-' + Date.now(),
            });
            res.reply = `Dạ Quản gia đã mở popup xác nhận xóa cho khoản **${matchedTx.noi_dung}** (🤖 Quản gia nhập) rồi ạ! Cậu chủ / cô chủ vui lòng bấm xác nhận trên popup nhé! 💕`;
          } else {
            // Kiểm tra xem có nhắc đến khoản thủ công nào không
            const manualMatch = transactions.find((tx) => {
              if (isAiTx(tx)) return false;
              const name = (tx.noi_dung || '').toLowerCase();
              return name && lowerInput.includes(name);
            });
            if (manualMatch) {
              res.reply = `Dạ thưa cậu chủ/cô chủ, khoản **${manualMatch.noi_dung}** không có nhãn 🤖 Quản gia nhập (do chủ nhà tự nhập tay vào sổ). Quản gia chỉ được phép can thiệp xóa các khoản do Quản gia nhập để bảo toàn dữ liệu gốc ạ! Cậu chủ / cô chủ vui lòng thao tác trực tiếp trên Bảng danh sách giúp em nhé! 💕`;
            }
          }
        }
      }

      // Lọc sạch triệt để mọi dấu vết JSON trong nội dung phản hồi
      let finalContent = (res.reply || '')
        .replace(/```(?:json)?[\s\S]*?```/gi, '')
        .replace(/\{[\s\S]*?"(?:type|action)"[\s\S]*?\}/gi, '')
        .trim();
      if (!finalContent) {
        finalContent = pendingDelete
          ? 'Dạ Quản gia đã mở popup xác nhận xóa trên màn hình rồi ạ! Cậu chủ / cô chủ bấm xác nhận giúp em nhé! 💕'
          : 'Dạ Quản gia đã ghi nhận yêu cầu của cậu chủ / cô chủ rồi ạ! 💕';
      }

      setMessages((prev) => [
        ...prev,
        {
          id: 'msg-' + Date.now(),
          role: 'assistant',
          content: finalContent,
          addedTxs: addedTxs.length > 0 ? addedTxs : null,
          pendingDelete: pendingDelete,
          updatedTx: updatedTx,
          modelUsed: res.modelUsed,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: 'msg-' + Date.now(),
          role: 'assistant',
          content: `⚠️ Đã xảy ra lỗi không mong muốn: ${err.message}`,
          isError: true,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Xác nhận xóa khoản chi do AI tạo từ Popup Modal
  const handleConfirmDeleteFromModal = async () => {
    const tx = deleteConfirmModal.tx;
    if (!tx || !tx.id || !onDeleteTransaction) return;
    try {
      await onDeleteTransaction(tx.id);
      const amountVal = tx.thu || tx.chi || tx.so_tien || 0;
      const amountStr = new Intl.NumberFormat('vi-VN').format(amountVal) + ' đ';
      const deletedName = tx.noi_dung || 'khoản chi';

      if (deleteConfirmModal.msgId) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === deleteConfirmModal.msgId
              ? { ...m, deleteStatus: 'deleted' }
              : m
          )
        );
      }
      setDeleteConfirmModal({ isOpen: false, tx: null, msgId: null });

      setMessages((prev) => [
        ...prev,
        {
          id: 'msg-' + Date.now(),
          role: 'assistant',
          content: `Dạ Quản gia đã tự động xóa vĩnh viễn khoản **${deletedName}** (${amountStr}) mang nhãn 🤖 Quản gia nhập ra khỏi cơ sở dữ liệu cho cậu chủ / cô chủ rồi ạ! ✨`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
      ]);
    } catch (e) {
      alert('Lỗi xóa giao dịch: ' + e.message);
    }
  };

  // Hủy bỏ xóa khoản chi từ Popup Modal
  const handleCancelDeleteFromModal = () => {
    if (deleteConfirmModal.msgId) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === deleteConfirmModal.msgId
            ? { ...m, deleteStatus: 'cancelled' }
            : m
        )
      );
    }
    setDeleteConfirmModal({ isOpen: false, tx: null, msgId: null });
    setMessages((prev) => [
      ...prev,
      {
        id: 'msg-' + Date.now(),
        role: 'assistant',
        content: 'Dạ Quản gia đã hủy thao tác xóa. Khoản chi tiêu vẫn được lưu giữ an toàn trong sổ sách ạ! 💕',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
    ]);
  };

  // Mở Popup khi bấm nút trong thẻ chat
  const handleConfirmDelete = (msgId, txItem) => {
    if (!txItem) return;
    setDeleteConfirmModal({
      isOpen: true,
      tx: txItem,
      msgId: msgId,
    });
  };

  // Hủy bỏ xóa khoản chi khi chủ nhà chọn giữ lại
  const handleCancelDelete = (msgId) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === msgId
          ? { ...m, deleteStatus: 'cancelled' }
          : m
      )
    );
  };

  const handleClearHistory = () => {
    if (window.confirm('Bạn có muốn xóa toàn bộ lịch sử trò chuyện này không?')) {
      setMessages([
        {
          id: 'msg-welcome',
          role: 'assistant',
          content: 'Dạ Quản gia xin kính chào ạ! 💕\n\nDạ cho em xin phép hỏi em đang được vinh hạnh phục vụ **cậu chủ Nhựt** hay **cô chủ Trang** thế ạ? ✨ Cậu chủ / cô chủ cứ dặn dò em nhé!',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          askWho: true,
        }
      ]);
    }
  };

  return (
    <>
      {/* NÚT BẤM NỔI BOT TRÒ CHUYỆN (FAB Ở GÓC DƯỚI PHẢI) */}
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 select-none">
        {!isOpen && (
          <button
            onClick={onToggle}
            className="group relative flex items-center gap-2 pl-3.5 pr-4 py-2.5 rounded-full bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 text-white shadow-xl shadow-pink-500/30 hover:shadow-pink-500/50 hover:scale-105 tactile-btn transition-all border border-pink-300/40"
            title="Mở Quản gia nhà Nhựt Trang"
          >
            <div className="relative flex items-center justify-center">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 absolute -top-1 -right-1 ring-2 ring-white animate-pulse" />
              <Robot size={22} weight="fill" className="text-white" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xs font-bold leading-tight flex items-center gap-1">
                Quản gia <Sparkle size={12} weight="fill" className="text-amber-300" />
              </span>
              <span className="text-[10px] text-pink-100 font-medium leading-none">
                Nhập & Phân tích
              </span>
            </div>
          </button>
        )}
      </div>

      {/* CỬA SỔ CHAT TRỢ LÝ AI MINI (Được mở rộng to hơn trên máy tính) */}
      {isOpen && (
        <div className="fixed bottom-3 right-3 left-3 sm:left-auto sm:bottom-6 sm:right-6 z-50 w-auto sm:w-[480px] sm:max-w-[500px] h-[80vh] max-h-[80vh] sm:h-[650px] sm:max-h-[88vh] bg-white/95 backdrop-blur-md rounded-3xl border border-pink-200/90 shadow-2xl shadow-pink-500/20 flex flex-col overflow-hidden animate-scale-up select-none">
          
          {/* Header Cửa sổ Chat */}
          <div className="px-4 py-3 border-b border-pink-100 bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 text-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center border border-white/30 text-white">
                <Robot size={18} weight="fill" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="font-bold text-sm tracking-tight leading-tight">
                    Quản gia nhà Nhựt Trang
                  </h4>
                  <Heart size={13} weight="fill" className="text-pink-200" />
                </div>
                {/* Dropdown chọn Model trực tiếp trên thanh tiêu đề */}
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 shrink-0 animate-pulse"></span>
                    <select
                    value={selectedModel}
                    onChange={(e) => handleModelChange(e.target.value)}
                    className="text-[10px] bg-black/25 hover:bg-black/35 px-1.5 py-0.5 rounded-md text-white font-medium border border-white/20 focus:outline-none cursor-pointer max-w-[210px] sm:max-w-[230px] truncate"
                    title="Chọn nhanh model AI đang dùng"
                  >
                    {AVAILABLE_MODELS.map((m) => (
                      <option key={m.id} value={m.id} className="text-slate-800 bg-white">
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 text-white/90">
              <button
                onClick={handleClearHistory}
                className="p-1.5 rounded-lg hover:bg-white/15 transition-colors"
                title="Xóa lịch sử chat"
              >
                <Trash size={16} />
              </button>
              <button
                onClick={onOpenSettings}
                className="p-1.5 rounded-lg hover:bg-white/15 transition-colors"
                title="Cài đặt API"
              >
                <Gear size={16} />
              </button>
              <button
                onClick={onToggle}
                className="p-1.5 rounded-lg hover:bg-white/15 transition-colors ml-0.5"
                title="Đóng cửa sổ chat"
              >
                <X size={18} weight="bold" />
              </button>
            </div>
          </div>

          {/* Gợi ý câu lệnh nhanh (Quick prompt chips) */}
          <div className="px-3 py-2 bg-pink-50/50 border-b border-pink-100/70 overflow-x-auto flex items-center gap-1.5 text-[11px] shrink-0 no-scrollbar">
            <button
              onClick={() => handleSend('Tôi là cậu chủ Nhựt')}
              className="px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 font-semibold whitespace-nowrap tactile-btn shrink-0 flex items-center gap-1 shadow-xs"
            >
              👑 Cậu chủ Nhựt
            </button>
            <button
              onClick={() => handleSend('Tôi là cô chủ Trang')}
              className="px-2.5 py-1 rounded-full bg-pink-50 border border-pink-200 text-pink-700 hover:bg-pink-100 font-semibold whitespace-nowrap tactile-btn shrink-0 flex items-center gap-1 shadow-xs"
            >
              🌸 Cô chủ Trang
            </button>
            <button
              onClick={() => handleSend('Ăn trưa cơm tấm 45k')}
              className="px-2.5 py-1 rounded-full bg-white border border-pink-200 text-pink-700 hover:bg-pink-100 font-medium whitespace-nowrap tactile-btn shrink-0"
            >
              🍱 Nhập cơm 45k
            </button>
            <button
              onClick={() => handleSend('Đổ xăng 80k')}
              className="px-2.5 py-1 rounded-full bg-white border border-pink-200 text-pink-700 hover:bg-pink-100 font-medium whitespace-nowrap tactile-btn shrink-0"
            >
              ⛽ Đổ xăng 80k
            </button>
            <button
              onClick={() => handleSend('Phân tích ngắn gọn tình hình chi tiêu tháng này giúp nhé')}
              className="px-2.5 py-1 rounded-full bg-white border border-pink-200 text-pink-700 hover:bg-pink-100 font-medium whitespace-nowrap tactile-btn shrink-0"
            >
              📊 Phân tích chi tiêu
            </button>
            <button
              onClick={() => handleSend('Cho lời khuyên ngắn gọn để tối ưu ngân sách cuối tháng')}
              className="px-2.5 py-1 rounded-full bg-white border border-pink-200 text-pink-700 hover:bg-pink-100 font-medium whitespace-nowrap tactile-btn shrink-0"
            >
              💡 Lời khuyên cuối tháng
            </button>
          </div>

          {/* Vùng Tin nhắn */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5 text-xs">
            {messages.map((m) => {
              const isUser = m.role === 'user';
              return (
                <div
                  key={m.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} animate-fade-in`}
                >
                  <div
                    className={`max-w-[88%] p-3.5 rounded-2xl leading-relaxed ${
                      isUser
                        ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-br-xs shadow-xs'
                        : m.isError
                        ? 'bg-rose-50 text-rose-800 border border-rose-200 rounded-bl-xs'
                        : 'bg-white text-slate-800 border border-pink-200/80 rounded-bl-xs shadow-xs'
                    }`}
                  >
                    {/* Nội dung tin nhắn (hỗ trợ format tinh tế, tránh lộ raw markdown) */}
                    <FormattedMessage content={m.content} isUser={isUser} />

                    {/* Nút chọn nhanh danh tính Cậu chủ Nhựt / Cô chủ Trang */}
                    {m.askWho && (
                      <div className="mt-2.5 pt-2 border-t border-pink-100 flex items-center gap-2">
                        <button
                          onClick={() => handleSend('Tôi là cậu chủ Nhựt')}
                          className="flex-1 py-1.5 px-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-semibold text-[11px] flex items-center justify-center gap-1 tactile-btn transition-all shadow-xs"
                        >
                          👑 Cậu chủ Nhựt
                        </button>
                        <button
                          onClick={() => handleSend('Tôi là cô chủ Trang')}
                          className="flex-1 py-1.5 px-2.5 rounded-xl bg-pink-50 hover:bg-pink-100 text-pink-700 border border-pink-200 font-semibold text-[11px] flex items-center justify-center gap-1 tactile-btn transition-all shadow-xs"
                        >
                          🌸 Cô chủ Trang
                        </button>
                      </div>
                    )}

                    {/* Nút bấm nhanh nếu báo thiếu API Key */}
                    {m.needsApiKey && (
                      <div className="mt-2.5 pt-2 border-t border-rose-200">
                        <button
                          onClick={onOpenSettings}
                          className="w-full py-1.5 px-3 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-bold text-[11px] flex items-center justify-center gap-1.5 tactile-btn"
                        >
                          <Gear size={13} weight="bold" />
                          Mở Cài Đặt Điền API Key Ngay
                        </button>
                      </div>
                    )}

                    {/* Hộp xác nhận xóa giao dịch do Quản gia tạo (Chờ chủ nhà confirm) */}
                    {m.pendingDelete && (
                      <div className="mt-3 p-3 rounded-2xl bg-rose-50/90 border border-rose-200 space-y-2.5 animate-scale-up text-left">
                        <div className="flex items-center gap-1.5 text-rose-800 font-bold text-xs">
                          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping shrink-0" />
                          <span>Yêu cầu xác nhận xóa</span>
                          <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded-md bg-white border border-rose-200 text-rose-700 font-medium">
                            🤖 Quản gia nhập
                          </span>
                        </div>
                        <div className="bg-white p-2.5 rounded-xl border border-rose-100 flex items-center justify-between text-xs shadow-2xs">
                          <div>
                            <div className="font-bold text-slate-800">{m.pendingDelete.noi_dung}</div>
                            <div className="text-[10px] text-slate-500">{m.pendingDelete.ngay}</div>
                          </div>
                          <div className="text-right font-mono font-bold text-rose-600">
                            {m.pendingDelete.is_thu ? '+' : '-'}{new Intl.NumberFormat('vi-VN').format(m.pendingDelete.so_tien)} đ
                          </div>
                        </div>

                        {m.deleteStatus === 'deleted' ? (
                          <div className="py-2 px-2.5 rounded-xl bg-emerald-100/90 text-emerald-800 text-[11px] font-semibold flex items-center justify-center gap-1.5 shadow-2xs">
                            <Check size={14} weight="bold" />
                            <span>Cậu chủ / Cô chủ đã xác nhận xóa thành công!</span>
                          </div>
                        ) : m.deleteStatus === 'cancelled' ? (
                          <div className="py-2 px-2.5 rounded-xl bg-slate-100 text-slate-600 text-[11px] font-medium flex items-center justify-center gap-1.5">
                            <X size={14} weight="bold" />
                            <span>Đã hủy thao tác xóa. Khoản tiền vẫn được lưu giữ an toàn.</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 pt-0.5">
                            <button
                              onClick={() => handleConfirmDelete(m.id, m.pendingDelete)}
                              className="flex-1 py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 tactile-btn shadow-xs transition-colors"
                            >
                              <Trash size={14} weight="bold" />
                              <span>Xác nhận xóa</span>
                            </button>
                            <button
                              onClick={() => handleCancelDelete(m.id)}
                              className="py-2 px-3 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold text-xs flex items-center justify-center gap-1 tactile-btn transition-colors"
                            >
                              <span>Giữ lại</span>
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Thẻ báo sửa giao dịch do Quản gia tạo */}
                    {m.updatedTx && (
                      <div className="mt-2.5 pt-2 border-t border-pink-100">
                        <div className="p-2.5 rounded-xl bg-blue-50/80 border border-blue-200 text-blue-900 text-[11px] flex items-center justify-between shadow-2xs">
                          <div>
                            <span className="font-bold flex items-center gap-1">
                              <Check size={13} weight="bold" className="text-blue-600" />
                              Đã sửa: {m.updatedTx.noi_dung}
                            </span>
                            <span className="text-[10px] text-blue-600">🤖 Quản gia đã đồng bộ vào sổ</span>
                          </div>
                          {m.updatedTx.updates?.so_tien && (
                            <span className="font-mono font-bold text-blue-700">
                              {new Intl.NumberFormat('vi-VN').format(m.updatedTx.updates.so_tien)} đ
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Thẻ hiển thị các giao dịch đã tự động thêm vào sổ */}
                    {m.addedTxs && m.addedTxs.length > 0 && (
                      <div className="mt-2.5 pt-2 border-t border-pink-100 space-y-1.5">
                        <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                          <Check size={12} weight="bold" /> Đã tự động lưu vào sổ thu chi:
                        </span>
                        {m.addedTxs.map((tx, idx) => (
                          <div
                            key={idx}
                            className="p-2 rounded-xl bg-pink-50/70 border border-pink-200 flex items-center justify-between text-[11px]"
                          >
                            <div>
                              <div className="font-bold text-slate-800">{tx.noi_dung}</div>
                              <div className="text-[10px] text-slate-500">
                                {tx.phan_loai} • {tx.author}
                              </div>
                            </div>
                            <div className="text-right">
                              <span className={`font-bold font-mono ${tx.thu > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                {tx.thu > 0 ? '+' : '-'}{new Intl.NumberFormat('vi-VN').format(tx.thu || tx.chi)} đ
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <span className="text-[9px] text-slate-400 mt-1 px-1">
                    {m.timestamp}
                  </span>
                </div>
              );
            })}

            {/* Loading indicator */}
            {isLoading && (
              <div className="flex items-center gap-2 p-3 rounded-2xl bg-white border border-pink-200/80 rounded-bl-xs text-xs text-pink-600 w-fit animate-pulse">
                <Sparkle size={14} className="animate-spin" />
                <span>Quản gia đang suy nghĩ & phân tích...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Ô Nhập Tin Nhắn */}
          <div className="p-3 border-t border-pink-100 bg-white/90">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ví dụ: Ăn trưa 45k hoặc Phân tích tháng này..."
                disabled={isLoading}
                className="flex-1 px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100 transition-all bg-white"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="w-10 h-10 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white flex items-center justify-center hover:shadow-md hover:shadow-pink-300 tactile-btn transition-all disabled:opacity-40 shrink-0"
              >
                <PaperPlaneTilt size={16} weight="fill" />
              </button>
            </form>
            <div className="flex items-center justify-between mt-1.5 px-1 text-[10px] text-slate-400">
              <span>Hỗ trợ nhận diện tự động thu chi bằng tiếng Việt</span>
              <span className="font-mono text-pink-600 font-semibold">
                Model: {AVAILABLE_MODELS.find(m => m.id === selectedModel)?.name || selectedModel}
              </span>
            </div>
          </div>

        </div>
      )}

      {/* POPUP MODAL XÁC NHẬN XÓA GIAO DỊCH QUẢN GIA NHẬP */}
      {deleteConfirmModal.isOpen && deleteConfirmModal.tx && (
        <div 
          className="fixed inset-0 z-[80] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
          onClick={handleCancelDeleteFromModal}
        >
          <div 
            className="w-full max-w-sm sm:max-w-md bg-white rounded-3xl border border-rose-200/90 shadow-2xl overflow-hidden p-5 sm:p-6 space-y-4 animate-scale-up text-left"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header popup */}
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center shrink-0 shadow-inner">
                <Trash size={22} weight="bold" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base font-bold text-slate-900">
                    Xác nhận xóa giao dịch
                  </h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 font-bold border border-purple-200">
                    🤖 Quản gia nhập
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Quản gia yêu cầu chủ nhà xác nhận trước khi xóa
                </p>
              </div>
            </div>

            {/* Chi tiết giao dịch trong popup */}
            <div className="bg-slate-50/90 border border-slate-200/80 rounded-2xl p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Khoản mục:</span>
                <span className="text-xs font-bold text-slate-900 text-right">
                  {deleteConfirmModal.tx.noi_dung}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Số tiền:</span>
                <span className={`text-sm font-mono font-bold ${deleteConfirmModal.tx.is_thu || deleteConfirmModal.tx.thu > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {deleteConfirmModal.tx.is_thu || deleteConfirmModal.tx.thu > 0 ? '+' : '-'}
                  {new Intl.NumberFormat('vi-VN').format(deleteConfirmModal.tx.thu || deleteConfirmModal.tx.chi || deleteConfirmModal.tx.so_tien || 0)} đ
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Ngày / Phân loại:</span>
                <span className="text-xs font-medium text-slate-700">
                  {deleteConfirmModal.tx.ngay} • {deleteConfirmModal.tx.phan_loai || 'Chi tiêu'}
                </span>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                <span className="text-xs text-slate-500">Người thực hiện:</span>
                <span className="text-xs font-semibold text-slate-800">
                  {deleteConfirmModal.tx.author || (activeUser === 'trang' ? 'Trang' : 'Nhựt')}
                </span>
              </div>
            </div>

            <p className="text-[11.5px] text-rose-700 bg-rose-50/70 p-2.5 rounded-xl border border-rose-100 leading-relaxed">
              ⚠️ Khoản này mang nhãn <strong>🤖 Quản gia nhập</strong>. Cậu chủ / Cô chủ có chắc chắn muốn xóa giao dịch này? Khi bấm <strong>Xác nhận xóa</strong>, Quản gia sẽ tự động xóa vĩnh viễn khỏi database.
            </p>

            {/* 2 nút bấm Xác nhận / Hủy */}
            <div className="flex items-center gap-2.5 pt-1">
              <button
                type="button"
                onClick={handleCancelDeleteFromModal}
                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-100 tactile-btn transition-colors"
              >
                Giữ lại
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteFromModal}
                className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-rose-500/25 tactile-btn transition-all"
              >
                <Trash size={15} weight="bold" />
                <span>Xác nhận xóa</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
