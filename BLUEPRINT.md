# BẢN ĐỊNH HÌNH GIAO DIỆN & TRẢI NGHIỆM: NHỰT TRANG FAMILY
*Anti-Slop Family Finance Framework — Built with Taste-Skill Guidelines*

---

## 1. DESIGN READ & BỘ DIAL TASTE-SKILL

> **Design Read:**  
> *"Reading this as: A modern, frictionless Family Finance Hub for couples ('Nhựt Trang Family'), with a Linear-clean + Warm Trust language, combining effortless one-tap entry with strict personal privacy boundaries."*

### Thiết lập 3 Dial cốt lõi:
- **`DESIGN_VARIANCE: 6`** — Cấu trúc bố cục trực quan theo phong cách Bento Grid hiện đại, nhịp điệu bất đối xứng thanh thoát, rũ bỏ hoàn toàn sự khô cứng nhàm chán của bảng tính kế toán truyền thống.
- **`MOTION_INTENSITY: 5`** — Hiệu ứng chuyển trạng thái mượt mà, phản hồi xúc giác (tactile micro-interactions) khi bấm 1-tap quick add, chuyển đổi êm ái giữa Không gian Chung và Riêng tư.
- **`VISUAL_DENSITY: 4`** — Không gian thở thông thoáng, các con số tài chính hiển thị rành mạch và dễ chịu, giải tỏa áp lực tâm lý căng thẳng về tiền nong.

---

## 2. HỆ THỐNG THẨM MỸ (ANTI-DEFAULT PALETTE & TYPOGRAPHY)

Tuân thủ nghiêm ngặt nguyên tắc **Anti-Default Discipline** từ `taste-skill`: không dùng gradient tím AI sến sẩm, không dùng beige/đồng rập khuôn, không lạm dụng card trắng vô hồn.

### 2.1 Bảng màu (Forest Trust & Calm Slate)
- **Nền chính (Base Background):** `#090D16` (Dark Slate sâu thẳm, sang trọng) hoặc `#F8FAFC` (Light Airy cho chế độ ban ngày).
- **Surface / Cards:** `#111827` với viền `border-slate-800/80` siêu mỏng và hiệu ứng backdrop subtle blur.
- **Màu điểm nhấn duy nhất (Singular Accent):** `#10B981` (Emerald / Sage Green) — Tượng trưng cho sự tăng trưởng tài chính, an toàn và dòng tiền lành mạnh.
- **Màu cảnh báo (Alert / Critical):** `#F43F5E` (Rose) — Dành riêng cho cảnh báo vượt ngân sách, dùng có kiểm soát.
- **Màu quỹ riêng tư (Privacy Neutral):** `#818CF8` (Soft Indigo) — Phân biệt nhẹ nhàng không gian cá nhân.

### 2.2 Typography
- **Display / Tiêu đề:** `Geist Sans` hoặc `Plus Jakarta Sans` — thanh lịch, dứt khoát, hiện đại.
- **Số liệu tài chính (Financial Digits):** `Geist Mono` hoặc `JetBrains Mono` với thuộc tính `tabular-nums` để mọi con số luôn thẳng hàng thẳng cột khi biến động.
- **Quy tắc Eyebrow:** Hạn chế tối đa nhãn in hoa nhỏ (tối đa 1 nhãn mỗi 3 phân khu), ưu tiên để dữ liệu và layout tự giải thích chính nó.

---

## 3. GIẢI QUYẾT BÀI TOÁN CỐT LÕI: ĐA NGƯỜI DÙNG & TÍNH RIÊNG TƯ

### 3.1 Mô hình Phân tách Không gian (Dual-Vault Architecture)
```
┌────────────────────────────────────────────────────────┐
│               NHỰT TRANG FAMILY HUB                    │
├───────────────────────────┬────────────────────────────┤
│   QUỸ CHUNG GIA ĐÌNH      │    VÍ RIÊNG CÁ NHÂN        │
│   (Shared Family Pool)    │    (Personal Vaults)       │
├───────────────────────────┼────────────────────────────┤
│ • Tiền thuê nhà / điện /  │ • Nhựt's Vault (Chỉ Nhựt)  │
│   nước / internet         │ • Trang's Vault (Chỉ Trang)│
│ • Tiền chợ, con cái       │ • Chi tiêu cá nhân riêng tư│
│ • Mục tiêu tiết kiệm chung│ • Báo cáo chung CHỈ hiển   │
│ • Cả hai cùng quản lý,    │   thị số tiền nộp vào Quỹ  │
│   cùng thấy minh bạch     │   chung, KHÔNG soi xét món │
└───────────────────────────┴────────────────────────────┘
```

### 3.2 Bộ điều hướng nhanh trạng thái xem (Vault Switcher):
- **Tab 1: 🌿 Tổ Ấm (Shared)** — Nơi xem bức tranh tổng thể của gia đình: Tiền còn lại trong tháng, tiến độ quỹ tiết kiệm mua nhà/du lịch, các hóa đơn sắp đến hạn.
- **Tab 2: 🔒 Cá Nhân (Private)** — Yêu cầu xác thực nhanh (FaceID / PIN / 1-click toggle). Không gian riêng tư hoàn toàn của từng người.
- **Nút "Privacy Shield" (1-Click Blur):** Nút che mờ toàn bộ số dư (`••••••`) tức thì khi sử dụng điện thoại ở nơi công cộng hoặc bàn ăn gia đình có người ngoài.

---

## 4. GIẢI QUYẾT BÀI TOÁN CỐT LÕI: TRIỆT TIÊU RÀO CẢN NHẬP LIỆU THỦ CÔNG
*(Nguyên nhân #1 khiến 90% người dùng bỏ cuộc sau 1-2 tuần)*

### 4.1 Quick-Tap Presets (1 Chạm là Xong)
Thanh công cụ dưới cùng có sẵn các nút bấm 1 chạm thông minh học theo thói quen:
- ☕ *Cà phê sáng (35k)*
- 🍱 *Cơm trưa (50k)*
- 🛒 *Đi chợ / Bách Hóa Xanh (200k)*
- ⛽ *Đổ xăng (70k)*
> **Trải nghiệm:** Chạm 1 phát -> Tự động trừ tiền vào Ví tương ứng + phân loại danh mục trong 0.5s với hiệu ứng haptic nhẹ, không cần mở form điền chữ hay chọn dropdown.

### 4.2 Smart SMS / Bank Alert Auto-Parser (Dán biến động số dư)
- Khi có thông báo trừ tiền từ Techcombank, VCB, MBBank, Momo...: Chỉ cần **Paste** đoạn text vào ô nhập thông minh.
- **Engine tự động phân tích regex / AI:**
  - Nhận diện số tiền: `-120,000 VND`
  - Nhận diện đối tác: `Highlands Coffee` -> Tự gán category: *Ăn uống / Cà phê*
  - Nhận diện thời gian: `04/10/2026 14:30`
  - Gợi ý đích: `Ví Nhựt` hay `Quỹ Chung`? -> 1 click xác nhận.

### 4.3 Quét Hóa đơn / Bill Quick-Snap (OCR)
- Đi siêu thị cuối tuần về, chỉ cần chụp ảnh hóa đơn thả vào -> Hệ thống tự trích xuất tổng tiền hóa đơn và lưu ảnh đính kèm để đối soát khi cần.

### 4.4 Quick Voice / Natural Language Prompt
- Ví dụ gõ hoặc nói: *"Trang mua sữa cho con 350k quỹ chung"* -> Tự tạo giao dịch: Người chi: Trang | Số tiền: 350.000đ | Hạng mục: Con cái | Nguồn: Quỹ chung.

---

## 5. CẤU TRÚC GIAO DIỆN (WIREFRAME & BENTO LAYOUT)

```
┌────────────────────────────────────────────────────────────────────────┐
│  [Logo Nhựt Trang]    [ Quỹ Chung ▾ ]       [👁 Privacy]  [Avatar: Nhựt] │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  ┌─────────────────────────────┐ ┌───────────────────────────────────┐  │
│  │ 🌿 NGÂN SÁCH THÁNG NÀY      │ │ 🎯 MỤC TIÊU TIẾT KIỆM CHUNG       │  │
│  │ ₫18,450,000 / ₫30,000,000   │ │ Quỹ Du Lịch Hè: 72% (36M / 50M)   │  │
│  │ Còn 14 ngày • ₫825k/ngày an toàn│ Quỹ Khẩn Cấp: Hoàn thành 100%   │  │
│  └─────────────────────────────┘ └───────────────────────────────────┘  │
│                                                                        │
│  ⚡ NHẬP NHANH 1-CHẠM (QUICK LOG)                                      │
│  [☕ Cà phê 35k]  [🍱 Cơm trưa 50k]  [🛒 Chợ 250k]  [⛽ Xăng 80k]  [+Khác]│
│                                                                        │
│  ┌───────────────────────────────────────────────┐ ┌────────────────┐  │
│  │ 📋 NHẬT KÝ CHI TIÊU GẦN NHẤT                  │ │ 📊 PHÂN BỔ     │  │
│  │ • Hôm nay: Chợ đầu mối - Trang (₫240,000)     │ │ 🏠 Nhà cửa: 40%│  │
│  │ • Hôm qua: Tiền điện tháng 9 - Nhựt (₫850,000)│ │ 🍜 Ăn uống: 35%│  │
│  │ • 02/10: Sữa Enfa - Quỹ Chung (₫450,000)      │ │ 🚗 Đi lại: 15% │  │
│  └───────────────────────────────────────────────┘ └────────────────┘  │
│                                                                        │
│  [ Ô DÁN SMS NGÂN HÀNG / KÉO THẢ BILL TỰ BÓC TÁCH NHẬP LIỆU ]          │
└────────────────────────────────────────────────────────────────────────┘
```
