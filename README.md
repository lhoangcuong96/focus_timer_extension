# 🎯 Focus Timer Chrome Extension

A Pomodoro Timer extension to help you focus and work efficiently.

## 👤 Creator

**Created by:** Hoàng Mạnh Cường  
**Email:** lhoangcuong1996@gmail.com
**Phone:** +84 582134596
**Version:** 1.0.0

---

## 📁 Folder Structure

Create a folder named `focus-timer-extension` with the following structure:

```
focus-timer-extension/
├── manifest.json
├── background.js
├── popup.html
├── popup.js
├── index.html (full HTML file from previous artifact)
├── icons/
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
```

## 🎨 Creating Icons

You need to create 3 icons with sizes:
- **16x16** pixels (icon16.png)
- **48x48** pixels (icon48.png)  
- **128x128** pixels (icon128.png)

Create free icons at:
- https://www.canva.com
- https://www.flaticon.com
- Or use emoji ⏱️ and take a screenshot

## 📦 Installing the Extension

1. **Open Chrome** and go to: `chrome://extensions/`

2. **Enable "Developer mode"** (top right corner)

3. **Click "Load unpacked"**

4. **Select the folder** `focus-timer-extension`

5. **Done!** The extension is now installed

## 🚀 How to Use

### Mini Popup:
- Click the extension icon in the toolbar
- Start/Pause timer
- View stats instantly

### Fullscreen Mode:
- **Open a new tab** → Automatically displays Focus Timer
- **Click "Open Fullscreen Mode"** in the popup
- Enjoy beautiful interface with dynamic backgrounds

## ✨ Features

✅ 25-minute countdown timer (Pomodoro)  
✅ Works even when popup is closed  
✅ Notifications when time is up  
✅ Replaces New Tab page  
✅ Beautiful background images on each tab  
✅ Session statistics  
✅ Auto-save state  

## 🔧 Customization

### Change default time:
Open `background.js`, modify:
```javascript
let timeLeft = 25 * 60; // Change 25 to your desired minutes
```

### Change Unsplash API Key:
1. Copy `config.example.js` to `config.js`:
   ```bash
   cp config.example.js config.js
   ```
2. Open `config.js` and replace `YOUR_UNSPLASH_API_KEY_HERE` with your actual Unsplash API key
3. **Important:** `config.js` is in `.gitignore` and will NOT be committed to version control

## 🐛 Troubleshooting

**Error: Extension won't load?**
- Check all files are in the folder
- Ensure all 3 icons are present
- Reload extension in `chrome://extensions/`

**Timer not running when popup is closed?**
- This is a feature, background worker continues running
- Reopen popup to see remaining time

## 📝 Notes

- Extension uses `chrome.storage` to save data
- Background service worker runs in the background
- Supports desktop notifications
- Completely free and offline (except loading background images)

---

## 🚀 Publish to Chrome Web Store

### Bước 1: Chuẩn bị Extension

1. **Kiểm tra lại manifest.json:**
   - Đảm bảo có đầy đủ: `name`, `version`, `description`, `author`
   - Kiểm tra `permissions` chỉ có những quyền cần thiết
   - Đảm bảo có đầy đủ icons (16x16, 48x48, 128x128)

2. **Tạo file ZIP:**
   - Chọn tất cả các file trong thư mục extension (KHÔNG bao gồm thư mục cha)
   - Nén thành file `.zip` (không phải `.rar` hay format khác)
   - Tên file: `focus-timer-extension-v1.0.0.zip` (hoặc tên khác)

3. **Kiểm tra kích thước:**
   - File ZIP không được vượt quá 200MB

### Bước 2: Đăng ký Chrome Web Store Developer Account

1. **Truy cập:** https://chrome.google.com/webstore/devconsole

2. **Đăng nhập** bằng tài khoản Google

3. **Thanh toán phí đăng ký một lần:**
   - Phí: **$5 USD** (một lần duy nhất, không phải hàng năm)
   - Thanh toán qua thẻ tín dụng/ghi nợ
   - Sau khi thanh toán, bạn có thể publish không giới hạn extensions

### Bước 3: Upload Extension

1. **Tạo item mới:**
   - Click nút **"New Item"** trong Chrome Web Store Developer Dashboard
   - Upload file ZIP đã chuẩn bị
   - Chờ Google xử lý và giải nén

2. **Điền thông tin Store Listing:**

   **Store Listing (bắt buộc):**
   - **Name:** Focus Timer - Pomodoro
   
   - **Summary:** (132 ký tự tối đa)
     ```
     Pomodoro timer to boost focus and productivity with beautiful backgrounds, stats tracking, and notifications
     ```
   
   - **Description:** (Có thể dùng markdown)
     ```markdown
     # Focus Timer - Pomodoro
     
     A beautiful and intuitive Pomodoro timer extension to help you stay focused and productive. Perfect for students, professionals, and anyone who wants to manage their time effectively.
     
     ## ✨ Features
     
     - **Pomodoro Technique**: 25-minute focus sessions with customizable break times
     - **Three Timer Modes**: 
       - Focus mode for deep work
       - Short break (5 minutes)
       - Long break (15 minutes)
     - **Beautiful Backgrounds**: Dynamic landscape images from Unsplash that change on each new tab
     - **Session Statistics**: Track your completed sessions and total focus minutes
     - **Desktop Notifications**: Get notified when your timer session ends
     - **Background Timer**: Timer continues running even when the popup is closed
     - **Customizable Settings**: Adjust focus time, short break, and long break durations
     - **Fullscreen Mode**: Beautiful fullscreen interface that replaces your new tab page
     - **Keyboard Shortcuts**: 
       - Spacebar to start/pause
       - R to reset
     - **Auto-save State**: Your timer state and statistics are automatically saved
     
     ## 🚀 How to Use
     
     1. Click the extension icon to open the popup timer
     2. Select your mode (Focus, Short Break, or Long Break)
     3. Click the play button to start your timer
     4. The timer will continue running in the background
     5. Get notified when time is up
     6. Open a new tab to see the beautiful fullscreen mode
     
     ## 💡 Tips
     
     - Use Focus mode for work sessions
     - Take Short Breaks between focus sessions
     - Take Long Breaks after completing multiple focus sessions
     - Check your statistics to track your productivity
     
     ## 🔒 Privacy
     
     This extension does NOT collect, store, or transmit any personal data. All data is stored locally on your device.
     
     Start your journey to better focus and productivity today!
     ```
   
   - **Category:** Productivity
   
   - **Language:** English (hoặc Vietnamese nếu bạn muốn)
   
   - **Privacy Policy URL:** 
     - Bạn cần host file `PRIVACY_POLICY.md` lên một URL công khai
     - Có thể dùng GitHub Pages, Netlify, hoặc website cá nhân
     - Ví dụ: `https://yourusername.github.io/focus-timer-extension/privacy-policy.html`
     - Hoặc: `https://yourwebsite.com/privacy-policy`

   **Graphics:**
   - **Small promotional tile:** 440x280px (khuyến nghị)
     - Tạo ảnh với logo/tên extension, màu gradient đẹp
   
   - **Screenshots:** Tối thiểu 1, tối đa 5 (1280x800 hoặc 640x400)
     - Screenshot 1: Popup timer interface với timer đang chạy
     - Screenshot 2: Fullscreen mode với background đẹp
     - Screenshot 3: Settings panel
     - Screenshot 4: Statistics display
     - Screenshot 5: Notification khi timer kết thúc
   
   - **Marquee promotional tile:** 1400x560px (tùy chọn)
     - Banner lớn để quảng bá extension

   **Privacy:**
   - **Single purpose:** 
     ```
     This extension's single purpose is to provide a Pomodoro timer functionality to help users manage their time and improve productivity through focused work sessions and breaks.
     ```
   
   - **Permission justification:**
     ```
     • notifications: Required to display desktop notifications when a timer session completes, alerting users that their focus time or break time has ended.
     
     • storage: Required to save timer settings (focus time, break durations), current timer state, and session statistics (completed sessions, total focus minutes) locally on the user's device. No data is transmitted to external servers.
     
     • alarms: Required to run the timer in the background even when the extension popup is closed, ensuring accurate time tracking and notifications.
     ```

### Bước 4: Submit để Review

1. **Kiểm tra lại:**
   - Tất cả thông tin đã điền đầy đủ
   - Screenshots đã upload
   - Privacy policy (nếu cần)

2. **Click "Submit for Review"**

3. **Chờ review:**
   - Thời gian: Thường 1-3 ngày làm việc
   - Google sẽ gửi email khi có kết quả
   - Có thể bị từ chối nếu:
     - Vi phạm chính sách
     - Thiếu thông tin
     - Extension không hoạt động đúng

### Bước 5: Sau khi được duyệt

1. **Extension sẽ tự động publish** (hoặc bạn có thể chọn publish thủ công)

2. **Link extension:** 
   - `https://chrome.google.com/webstore/detail/[extension-id]`

3. **Cập nhật version:**
   - Mỗi lần cập nhật, tăng version trong `manifest.json`
   - Upload file ZIP mới
   - Submit lại để review (thường nhanh hơn lần đầu)

### 📋 Checklist trước khi Submit

- [ ] Manifest.json đầy đủ thông tin
- [ ] Icons đầy đủ (16, 48, 128px)
- [ ] Extension hoạt động tốt khi test
- [ ] Đã tạo Privacy Policy (nếu cần)
- [ ] Screenshots đã chuẩn bị
- [ ] Mô tả đã viết đầy đủ
- [ ] Đã thanh toán phí $5
- [ ] File ZIP đã tạo đúng cách

### 🔗 Tài liệu tham khảo

- **Chrome Web Store Developer Dashboard:** https://chrome.google.com/webstore/devconsole
- **Chính sách Chrome Web Store:** https://developer.chrome.com/docs/webstore/program-policies/
- **Hướng dẫn chi tiết:** https://developer.chrome.com/docs/webstore/publish/

### 💡 Lưu ý

- **Privacy Policy:** Nếu extension không thu thập dữ liệu, bạn vẫn cần một trang Privacy Policy đơn giản. Có thể tạo trên GitHub Pages hoặc website cá nhân.

- **Screenshots:** Chất lượng ảnh tốt sẽ giúp tăng tỷ lệ chấp nhận và thu hút người dùng.

- **Description:** Viết mô tả rõ ràng, bằng tiếng Việt hoặc tiếng Anh, giải thích rõ các tính năng.

- **Version:** Mỗi lần cập nhật phải tăng số version (ví dụ: 1.0.0 → 1.0.1)

---

**Work efficiently! 🚀**