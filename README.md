# Nhựt & Trang Family — Quản Lý Thu Chi Gia Đình

> Ứng dụng quản lý tài chính & sổ thu chi gia đình tối giản, riêng tư, chống bỏ cuộc sau 1 tuần.  
> Được xây dựng theo bộ quy chuẩn thiết kế **Taste-Skill (Anti-Slop Frontend)**.

---

## 🌟 Tính Năng Nổi Bật

1. **Khớp 100% Cấu Trúc Bảng Tính Excel Của Bạn:**
   - Các cột: `Ngày | Nội dung | Thu | Chi | Phân loại | Loại | Không gian | Người ghi | Thao tác`.
   - Bảng màu: Thu (Xanh lá `+`), Chi (Trắng/Đỏ `-`), Huy hiệu Phân loại (`công việc`, `ăn uống`, `tiêu hao`, `biếu tặng`, `nhà cửa`...) & Loại (`thiết yếu`, `công việc`, `hưởng thụ`...).
   - Banner mục tiêu tháng: **"giảm mua đồ"** có thể chỉnh sửa trực tiếp.

2. **Giải Quyết Bài Toán Đa Người Dùng & Riêng Tư (Dual-Vault):**
   - **🌿 Quỹ Chung Tổ Ấm:** Tiền nhà, tiền chợ, tiền ăn uống chung, mục tiêu tiết kiệm chung. Cả 2 vợ chồng cùng quản lý minh bạch.
   - **🔒 Ví Riêng Cá Nhân:** Ví riêng của Nhựt và Ví riêng của Trang. Chi tiêu cá nhân không bị soi xét.
   - **Nút Ẩn Số Dư (Privacy Shield):** 1 chạm che mờ toàn bộ số tiền (`••••••`) khi ở nơi công cộng.

3. **Triệt Tiêu Rào Cản Nhập Liệu (Zero-Friction Logging):**
   - ⚡ **1-Chạm Thường Dùng:** Ghim các khoản lặp lại (*Cà phê 35k, Cơm trưa 43k, Bách hóa 190k, Đổ xăng 80k, Trà sữa 55k, Thu tiền web 1.5tr*). Bấm 1 chạm là tự phân loại & lưu trong 0.2s.
   - 📩 **Dán SMS Ngân Hàng:** Tự động nhận diện Techcombank, Vietcombank, Momo, MBBank... bóc tách số tiền, danh mục, thời gian.
   - 🗣️ **Nhập Câu Tự Nhiên:** Gõ hoặc nói *"Trang đi bách hóa xanh 190k nước giặt pin"* -> Tự phân loại và lưu.
   - 📥 **Xuất Excel/CSV:** 1 click xuất toàn bộ dữ liệu ra file CSV mở trên Google Sheets / Excel.

---

## 🚀 Hướng Dẫn Deploy Lên Vercel & Kết Nối Supabase

### Bước 1: Đưa Code Lên GitHub
```bash
git init
git add .
git commit -m "feat: init Nhựt & Trang Family Finance Hub"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo-name>.git
git push -u origin main
```

### Bước 2: Thiết Lập Database Trên Supabase (1 Phút)
1. Đăng nhập [Supabase](https://supabase.com) và tạo một Project mới.
2. Vào tab **SQL Editor** ở thanh menu bên trái.
3. Mở file [`supabase/schema.sql`](./supabase/schema.sql), sao chép toàn bộ nội dung và dán vào SQL Editor trên Supabase, sau đó nhấn **Run**.
   *(Lệnh này sẽ tự động tạo bảng `transactions`, `monthly_config`, `savings_goals`, cấu hình Realtime và nạp sẵn toàn bộ 12 dòng dữ liệu mẫu từ sheet của bạn!)*
4. Vào **Project Settings > API** để lấy 2 thông số:
   - **Project URL**
   - **anon public key**

### Bước 3: Deploy Lên Vercel
1. Truy cập [Vercel](https://vercel.com) và chọn **Add New > Project**, chọn repo GitHub vừa đẩy lên.
2. Tại mục **Environment Variables**, thêm 2 biến:
   - `VITE_SUPABASE_URL`: *(Dán URL từ Supabase)*
   - `VITE_SUPABASE_ANON_KEY`: *(Dán anon key từ Supabase)*
3. Nhấn **Deploy**! Sau khoảng 30 giây, ứng dụng của bạn sẽ chính thức online với tên miền miễn phí dạng `https://nhut-trang-family.vercel.app`.

---

## 💻 Chạy Thử Tại Local

```bash
# Cài đặt thư viện
npm install

# Khởi chạy dev server
npm run dev
```

Truy cập: `http://localhost:5173/`
*(Hệ thống đã hỗ trợ chế độ Offline-first: dù chưa điền Supabase, app vẫn hoạt động mượt mà và lưu vào LocalStorage mà không bao giờ bị lỗi).*
