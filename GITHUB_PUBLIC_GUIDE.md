# Hướng dẫn làm Repository thành Public trên GitHub

## Cách 1: Khi tạo repository mới

1. Vào GitHub.com và đăng nhập
2. Click nút **"+"** ở góc trên bên phải → chọn **"New repository"**
3. Điền tên repository (ví dụ: `focus-timer-extension`)
4. Chọn **Public** (thay vì Private)
5. Click **"Create repository"**

## Cách 2: Đổi repository từ Private sang Public (đã có repository)

### Bước 1: Vào Settings của Repository

1. Mở repository của bạn trên GitHub
2. Click tab **"Settings"** (ở phía trên, cùng hàng với Code, Issues, Pull requests...)
3. Scroll xuống dưới cùng, tìm phần **"Danger Zone"**

### Bước 2: Change repository visibility

1. Trong phần **"Danger Zone"**, tìm mục **"Change repository visibility"**
2. Click nút **"Change visibility"**
3. Chọn **"Make public"**
4. GitHub sẽ hiển thị cảnh báo - đọc kỹ và xác nhận
5. Nhập tên repository để xác nhận (ví dụ: `yourusername/focus-timer-extension`)
6. Click **"I understand, change repository visibility"**

### Lưu ý quan trọng:

⚠️ **Khi đổi sang Public:**
- Tất cả mọi người trên internet có thể xem code của bạn
- Có thể clone, fork repository
- Commit history sẽ công khai
- **NHƯNG**: File `config.js` đã có trong `.gitignore` nên sẽ KHÔNG bị commit (an toàn)

## Kiểm tra repository đã Public chưa

Sau khi đổi sang Public, bạn sẽ thấy:
- Badge **"Public"** ở góc trên bên phải của repository
- Repository có thể truy cập được mà không cần đăng nhập
- URL có dạng: `https://github.com/yourusername/focus-timer-extension`

## Các bước tiếp theo sau khi Public

### 1. Enable GitHub Pages (để host Privacy Policy)

1. Vào **Settings** của repository
2. Scroll xuống phần **"Pages"** (ở sidebar bên trái)
3. Trong **"Source"**, chọn **"Deploy from a branch"**
4. Chọn branch: **"main"** (hoặc "master")
5. Chọn folder: **"/ (root)"**
6. Click **"Save"**
7. GitHub sẽ tạo URL: `https://yourusername.github.io/focus-timer-extension/`

### 2. Upload PRIVACY_POLICY.md

Sau khi enable GitHub Pages, bạn có thể:

**Cách A: Upload qua GitHub Web Interface**
1. Vào repository trên GitHub
2. Click nút **"Add file"** → **"Upload files"**
3. Kéo thả file `PRIVACY_POLICY.md` vào
4. Điền commit message: "Add privacy policy"
5. Click **"Commit changes"**

**Cách B: Dùng Git Command Line**
```bash
# Nếu chưa có git remote
git remote add origin https://github.com/yourusername/focus-timer-extension.git

# Add và commit file
git add PRIVACY_POLICY.md
git commit -m "Add privacy policy"

# Push lên GitHub
git push -u origin main
```

### 3. Lấy URL Privacy Policy

Sau khi upload `PRIVACY_POLICY.md` và GitHub Pages đã deploy (thường mất 1-2 phút), URL của bạn sẽ là:

```
https://yourusername.github.io/focus-timer-extension/PRIVACY_POLICY.md
```

Hoặc nếu GitHub Pages render markdown:
```
https://yourusername.github.io/focus-timer-extension/PRIVACY_POLICY.html
```

**Lưu ý:** Thay `yourusername` và `focus-timer-extension` bằng tên GitHub và tên repository thực tế của bạn.

## Kiểm tra GitHub Pages đã hoạt động

1. Vào Settings → Pages
2. Xem phần **"Your site is live at"** - sẽ hiển thị URL
3. Click vào URL để kiểm tra file có accessible không
4. Thử truy cập: `https://yourusername.github.io/focus-timer-extension/PRIVACY_POLICY.md`

## Troubleshooting

**GitHub Pages không hiển thị file?**
- Đợi vài phút để GitHub deploy
- Kiểm tra file đã được commit chưa
- Thử URL với extension `.html` thay vì `.md`
- Vào Settings → Pages để xem có lỗi không

**Không thấy option "Change visibility"?**
- Đảm bảo bạn là owner của repository
- Một số organization settings có thể hạn chế việc này

**File config.js có bị public không?**
- KHÔNG, vì file này đã có trong `.gitignore`
- Chỉ có file `config.example.js` sẽ được public (đây là điều mong muốn)

