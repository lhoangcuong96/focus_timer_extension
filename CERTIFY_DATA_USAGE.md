# Hướng dẫn Certify Data Usage Compliance trên Chrome Web Store

## Vấn đề
Lỗi: "To publish your item, you must certify that your data usage complies with our Developer Program Policies. You can certify this on the Privacy practices tab of the item edit page."

## Giải pháp - Các bước chi tiết

### Bước 1: Vào Privacy Practices Tab

1. Đăng nhập vào **Chrome Web Store Developer Dashboard**: https://chrome.google.com/webstore/devconsole
2. Chọn extension **"Focus Timer - Pomodoro"** của bạn
3. Click vào tab **"Privacy practices"** (ở menu trên cùng, bên cạnh Store listing, Pricing, etc.)

### Bước 2: Điền Data Usage Information

Trong tab **Privacy practices**, bạn cần điền các thông tin sau:

#### 2.1. Single Purpose Description

Tìm phần **"Single purpose"** hoặc **"What is the single purpose of your item?"**

Điền:
```
This extension's single purpose is to provide a Pomodoro timer functionality to help users manage their time and improve productivity through focused work sessions and breaks. The extension displays a countdown timer, tracks session statistics, and provides notifications when time periods complete.
```

#### 2.2. Permission Justifications

Điền justification cho từng permission:

**Alarms:**
```
The alarms permission is required to run the timer in the background even when the extension popup is closed. This ensures accurate time tracking and allows the timer to continue counting down while users work in other browser tabs or applications.
```

**Notifications:**
```
The notifications permission is required to display desktop notifications when a timer session completes, alerting users that their focus time or break time has ended. This is essential for the Pomodoro technique.
```

**Storage:**
```
The storage permission is required to save timer settings, current timer state, and session statistics locally on the user's device using Chrome's local storage API. All data is stored locally and never transmitted to external servers.
```

#### 2.3. Data Usage Section (QUAN TRỌNG NHẤT)

Tìm phần **"Data usage"** hoặc **"How does your item handle user data?"**

Bạn sẽ thấy các checkbox và options. Hãy chọn như sau:

**Question: Does your item collect, use, or share user data?**

Chọn: ✅ **"No, this item does not collect user data"**

**OR nếu có các options riêng lẻ:**

- ✅ **"This extension does not collect user data"**
- ✅ **"This extension does not share user data with third parties"**
- ✅ **"This extension does not use the data for advertising purposes"**
- ✅ **"This extension does not use the data for credit purposes"**

#### 2.4. CERTIFY CHECKBOX (BƯỚC QUAN TRỌNG)

Tìm phần có checkbox với text tương tự:

**"I certify that my data usage complies with the Developer Program Policies"**

⚠️ **QUAN TRỌNG:** Bạn PHẢI check box này!

- Tìm checkbox này (thường ở cuối phần Data Usage hoặc ở cuối trang Privacy practices)
- ✅ **CHECK** (đánh dấu) vào checkbox này
- Đọc và xác nhận rằng bạn hiểu các chính sách

### Bước 3: Save Draft

Sau khi điền tất cả thông tin và check box certify:

1. **Scroll xuống cuối trang**
2. Click nút **"Save Draft"** (hoặc "Save")
3. Đợi vài giây để hệ thống lưu

### Bước 4: Verify

1. Refresh trang hoặc reload Privacy practices tab
2. Kiểm tra lại:
   - Tất cả các trường đã điền đầy đủ
   - Checkbox certify đã được check
3. Scroll xuống xem có warning màu đỏ nào không

### Bước 5: Submit for Review

1. Quay lại tab **"Store listing"** hoặc tab chính
2. Click **"Submit for Review"**
3. Nếu vẫn còn lỗi, quay lại Privacy practices và kiểm tra lại checkbox certify

## Các vị trí có thể có Checkbox Certify

Checkbox certify có thể xuất hiện ở một trong các vị trí sau:

1. **Cuối phần "Data Usage"** - Sau khi chọn "No, this item does not collect user data"
2. **Cuối trang Privacy practices** - Ở cuối cùng của tab
3. **Trong phần "Data handling declaration"** - Nếu có phần này
4. **Trong modal/popup** - Khi bạn chọn "No data collection", có thể có popup xác nhận

## Lưu ý quan trọng

⚠️ **Nếu bạn không thấy checkbox certify:**

1. **Kiểm tra lại phần Data Usage:**
   - Đảm bảo đã chọn "No, this item does not collect user data"
   - Một số trường hợp phải scroll xuống sau khi chọn option này mới thấy checkbox

2. **Kiểm tra tất cả các tab con trong Privacy practices:**
   - Có thể có nhiều sub-tabs
   - Click vào từng tab để tìm checkbox

3. **Thử save draft và reload:**
   - Click "Save Draft"
   - Refresh trang
   - Vào lại Privacy practices tab
   - Checkbox có thể xuất hiện sau khi save

4. **Kiểm tra browser console:**
   - Nhấn F12 để mở Developer Tools
   - Xem có lỗi JavaScript nào không

## Nếu vẫn không tìm thấy

Nếu sau khi làm tất cả các bước trên mà vẫn không thấy checkbox certify:

1. **Kiểm tra lại Single Purpose:**
   - Đảm bảo đã điền đầy đủ
   - Độ dài phải hợp lý (không quá ngắn)

2. **Kiểm tra lại Permission Justifications:**
   - Tất cả permissions phải có justification
   - Justification phải rõ ràng, không quá ngắn

3. **Thử clear cache và reload:**
   - Ctrl + Shift + Delete để clear cache
   - Hoặc dùng Incognito mode

4. **Liên hệ Chrome Web Store Support:**
   - Nếu vẫn không được, có thể là bug của hệ thống
   - Gửi feedback qua Developer Dashboard

## Checklist cuối cùng

Trước khi Submit, đảm bảo:

- [ ] Single Purpose Description đã điền
- [ ] Tất cả Permission Justifications đã điền (alarms, notifications, storage)
- [ ] Đã chọn "No, this item does not collect user data"
- [ ] ✅ **Checkbox "I certify that my data usage complies..." ĐÃ ĐƯỢC CHECK**
- [ ] Đã click "Save Draft"
- [ ] Đã refresh và verify lại
- [ ] Không còn warning màu đỏ nào

## Screenshot Reference

Nếu có thể, hãy chụp screenshot phần Privacy practices tab để dễ dàng xác định vị trí các trường cần điền.

---

**Sau khi hoàn thành tất cả các bước trên, bạn sẽ có thể Submit for Review thành công!**

