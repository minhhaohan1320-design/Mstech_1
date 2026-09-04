# Giao diện mặc định (Default UI Theme)

Người dùng đã yêu cầu thiết lập giao diện mặc định của ứng dụng này xoay quanh chủ đề **Warhammer 40k Space Marines**.

**Nguyên tắc thiết kế bắt buộc:**
1. **Avatar/Icon:** Mọi phân hệ (Tầng/Module) chính của ứng dụng đều phải được đại diện bởi một hình ảnh Chibi Space Marine nằm trong một ô tròn (Sử dụng component `<ChibiMarine chapter="..." />`).
2. **Không thay đổi:** Tuyệt đối không được thay thế, xoá bỏ, hoặc ghi đè các ảnh Chibi Space Marine hiện có bằng các icon thông thường hay placeholder khác, trừ khi người dùng yêu cầu đổi sang một Chapter khác cụ thể.
3. **Mở rộng:** Khi thêm một tính năng hoặc module mới, hãy chọn một Chapter phù hợp (Ví dụ: `imperialFist`, `salamander`, `ultramarine`, `ironHand`, `whiteScar`, `bloodAngel`) và cấp cho nó một ô tròn đại diện theo phong cách hiện tại.
4. **Màu sắc:** Phối hợp màu sắc nền (background, border) của khung viền nhân vật cho tương đồng với màu đặc trưng của Chapter đó (Vd: Đỏ cho Blood Angel, Xanh lá cho Salamander, Vàng cho Imperial Fist).

Đây là phong cách đặc trưng mà người dùng rất thích, hãy duy trì nó trong suốt quá trình phát triển dự án.
