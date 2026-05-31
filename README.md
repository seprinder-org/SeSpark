# SeSpark - Web-based 3D Slicer & Printer Controller

**SeSpark** là một ứng dụng web hiện đại, hiệu năng cao, kết hợp giữa bộ cắt lớp mô hình 3D (3D Slicer) và bộ điều khiển máy in 3D (Printer Controller). Dự án được thiết kế với giao diện tối giản, cao cấp, mang lại trải nghiệm mượt mà trực tiếp trên trình duyệt bằng cách tận dụng sức mạnh tính toán của Rust qua WebAssembly và đồ họa 3D tương tác của Three.js.

---

## 🚀 Kiến trúc Dự án (Architecture)

Dự án được chia làm hai phần chính:

1. **Slicer Engine ([slicer-engine](file:///c:/Users/chien/Desktop/Projects/SeSpark/slicer-engine))**:
   - Được viết bằng ngôn ngữ **Rust** ([lib.rs](file:///c:/Users/chien/Desktop/Projects/SeSpark/slicer-engine/src/lib.rs)) cho tốc độ xử lý tối ưu.
   - Biên dịch sang **WebAssembly (WASM)** để chạy trực tiếp trên trình duyệt mà không cần máy chủ phụ trợ.
   - Chịu trách nhiệm phân tích tệp STL (cả định dạng ASCII và Binary), tính toán giao điểm mặt phẳng Z, liên kết các đoạn thẳng thành các vòng khép kín (loops), tạo đường chạy dao (toolpaths) cho tường (outer wall) và phần điền đầy (scanline infill) với thuật toán tối ưu hóa, và xuất ra mã G-code hoàn chỉnh cùng các số liệu thống kê.

2. **Frontend ([frontend](file:///c:/Users/chien/Desktop/Projects/SeSpark/frontend))**:
   - Xây dựng trên **Svelte 5** ([App.svelte](file:///c:/Users/chien/Desktop/Projects/SeSpark/frontend/src/App.svelte)) và **TypeScript** cho hiệu năng phản hồi UI cực nhanh.
   - Quản lý trạng thái ứng dụng tập trung bằng Svelte stores ([store.ts](file:///c:/Users/chien/Desktop/Projects/SeSpark/frontend/src/lib/store.ts)).
   - Sử dụng **Three.js** ([Viewport.svelte](file:///c:/Users/chien/Desktop/Projects/SeSpark/frontend/src/lib/components/Viewport.svelte)) để hiển thị không gian 3D của bàn in 256×256×256 mm, cho phép người dùng xem trước mô hình STL cũng như đường chạy dao (toolpaths) sau khi cắt lớp với các màu sắc phân biệt trực quan.

---

## ✨ Các Tính năng Chính (Key Features)

### 1. Không gian Chuẩn bị In (Prepare Workspace)
* **Kéo & Thả STL**: Cho phép kéo thả trực tiếp tệp `.stl` vào màn hình hoặc mở tệp qua thanh điều hướng để nhập mô hình 3D.
* **Cấu hình Cắt lớp**: Sidebar thiết lập thông số trực quan chia làm 4 tab ([Sidebar.svelte](file:///c:/Users/chien/Desktop/Projects/SeSpark/frontend/src/lib/components/Sidebar.svelte)):
  * **Quality**: Điều chỉnh chiều cao lớp in (Layer height), đường kính đầu phun (Nozzle diameter), đường kính sợi nhựa (Filament diameter).
  * **Strength**: Thiết lập số vòng thành (Wall loops), mật độ điền đầy (Infill density từ 0% đến 100%), và kiểu điền đầy (Infill pattern: Grid/Lines).
  * **Speed**: Tốc độ in và tốc độ di chuyển không đùn nhựa (Travel speed).
  * **Material**: Nhiệt độ đầu đùn (Extruder temp) và bàn in (Bed temp).
* **Tự động tối ưu hóa**: 3 lớp dưới cùng (bottom) và 3 lớp trên cùng (top) sẽ tự động được cắt lớp với mật độ infill cao (90%) để tăng cường độ cứng cáp cho cấu trúc mô hình và tạo độ mịn cho bề mặt ngoài.

### 2. Xem trước Lát cắt (Preview Workspace)
* **Trực quan hóa đường chạy dao**: Hiển thị mô phỏng 3D phân biệt màu sắc cho từng loại chuyển động:
  * <span style="color:#ef4444">■</span> **Outer Wall** (Thành ngoài)
  * <span style="color:#22c55e">■</span> **Inner Wall** (Thành trong - nếu có)
  * <span style="color:#f59e0b">■</span> **Sparse Infill** (Đường điền đầy)
  * <span style="color:#3b82f6">■</span> **Travel Moves** (Đường di chuyển không đùn nhựa)
* **Thanh trượt Z đứng**: Điều chỉnh xem đường chạy dao theo từng lớp hoặc tích lũy từ lớp 1 đến lớp hiện tại (mô phỏng thanh trượt dọc tương tự OrcaSlicer/Bambu Studio).
* **Thống kê chi tiết ([StatsPanel.svelte](file:///c:/Users/chien/Desktop/Projects/SeSpark/frontend/src/lib/components/StatsPanel.svelte))**: Hiển thị thời gian in ước tính, khối lượng và chiều dài nhựa sử dụng, tổng số lớp, kích thước Bounding Box và biểu đồ phân bổ thời gian in giữa các loại di chuyển.
* **Bộ xem G-code ([GcodeViewer.svelte](file:///c:/Users/chien/Desktop/Projects/SeSpark/frontend/src/lib/components/GcodeViewer.svelte))**: Xem trực tiếp file G-code dạng text được tạo ra và có thể tải xuống (`.gcode`) để nạp vào máy in thực tế.

### 3. Bảng Điều khiển Thiết bị (Device Dashboard)
* **Bảng điều khiển máy in giả lập ([DeviceDashboard.svelte](file:///c:/Users/chien/Desktop/Projects/SeSpark/frontend/src/lib/components/DeviceDashboard.svelte))**: Mô phỏng giao diện kết nối WebSocket của máy in chạy firmware Klipper.
* **Biểu đồ nhiệt độ**: Vẽ đồ thị dạng SVG cập nhật thời gian thực nhiệt độ của đầu đùn (Hotend) và bàn in (Bed).
* **Điều khiển thủ công (Jog Controls)**: Điều khiển di chuyển đầu phun theo các trục X, Y, Z và nút Home trục (G28).
* **Console Terminal**: Nhập và gửi mã lệnh G-code trực tiếp cho máy in với bộ phân tích cú pháp phản hồi phản hồi lệnh chuẩn xác (`ok`).
* **Hỗ trợ thao tác nhanh**: Nút Preheat PLA (bàn in 60°C, đầu đùn 220°C) và Cooldown (tắt tất cả nhiệt độ).

---

## 📁 Cấu trúc Thư mục (Directory Structure)

```text
SeSpark/
├── slicer-engine/              # Mã nguồn Rust (WASM Core)
│   ├── Cargo.toml              # Cấu hình dự án Rust và các dependency (wasm-bindgen, serde)
│   └── src/
│       └── lib.rs              # Thuật toán cắt lớp chính, tạo G-code và tính toán chỉ số
│
└── frontend/                   # Ứng dụng giao diện người dùng
    ├── package.json            # Cấu hình node packages (Svelte 5, Three.js, Lucide, Canvas-confetti)
    ├── vite.config.ts          # Cấu hình Vite bundler
    ├── src/
    │   ├── App.svelte          # Component gốc điều phối bố cục màn hình và kéo thả file STL
    │   ├── main.ts             # Điểm khởi chạy ứng dụng frontend
    │   ├── index.css           # Hệ thống design tokens, màu sắc giao diện tối và CSS toàn cục
    │   └── lib/
    │       ├── store.ts        # Quản lý trạng thái toàn cục (active tab, settings, slice results,...)
    │       ├── wasm-engine/    # Thư mục chứa file build WebAssembly từ slicer-engine
    │       └── components/
    │           ├── Navbar.svelte          # Thanh công cụ, nút Open file, nút Slice in và logo
    │           ├── Sidebar.svelte         # Bảng thiết lập thông số lát cắt 3D
    │           ├── Viewport.svelte        # Khung nhìn Three.js render 3D mô hình và toolpath
    │           ├── StatsPanel.svelte      # Bảng thống kê chi tiết thời gian và lượng nhựa sử dụng
    │           ├── GcodeViewer.svelte     # Modal xem chi tiết file G-code thô và tải về máy
    │           └── DeviceDashboard.svelte # Dashboard điều khiển máy in, console và nhiệt đồ
```

---

## 🛠️ Hướng dẫn Cài đặt & Khởi chạy (Setup & Installation)

### Yêu cầu hệ thống (Prerequisites)
- [Node.js](https://nodejs.org/) (phiên bản 18 trở lên)
- [Rust](https://www.rust-lang.org/) và [wasm-pack](https://wasm-bindgen.github.io/wasm-pack/installer/) (chỉ cần nếu bạn muốn sửa đổi mã nguồn bộ cắt lớp trong thư mục `slicer-engine`).

### 1. Build Slicer Engine (Tùy chọn)
Nếu bạn thay đổi thuật toán cắt lớp trong thư mục Rust `slicer-engine`, hãy biên dịch lại để tạo mã WASM mới cho frontend:
```bash
cd slicer-engine
wasm-pack build --target web --out-dir ../frontend/src/lib/wasm-engine
```
*Lưu ý: Thư mục `frontend/src/lib/wasm-engine` đã chứa mã WASM được build sẵn, bạn có thể bỏ qua bước này.*

### 2. Khởi chạy Frontend
Di chuyển vào thư mục frontend, cài đặt thư viện và khởi chạy môi trường phát triển:

```bash
cd ..
cd frontend
npm install
npm run dev
```

Sau khi chạy lệnh trên, truy cập đường dẫn local (thường là `http://localhost:5173`) hiển thị trong terminal để trải nghiệm ứng dụng.

---

## 🛠️ Chi tiết Thuật toán Cắt lớp (Slicing Pipeline Details)

Mã nguồn tại [lib.rs](file:///c:/Users/chien/Desktop/Projects/SeSpark/slicer-engine/src/lib.rs) thực hiện quá trình cắt lớp qua các bước tuần tự:
1. **Dịch chuyển tọa độ (Auto-Centering)**: Đưa mô hình 3D về vị trí trung tâm bàn in (X=128, Y=128) và hạ độ cao Z xuống sát mặt bàn in (Z=0).
2. **Cắt mặt phẳng (Plane Intersection)**: Duyệt qua danh sách tam giác STL để tìm các cạnh cắt qua mặt phẳng nằm ngang tại độ cao Z của mỗi lớp in.
3. **Liên kết vòng (Loop Linking)**: Từ các đoạn thẳng rời rạc thu được sau khi cắt, thuật toán kết hợp chúng lại thành các đường bao khép kín (loops) bằng cách nối điểm gần nhất trong phạm vi sai số cho phép.
4. **Tạo đường chạy đùn nhựa**:
   - **Outer Wall**: Vẽ trực tiếp theo chu vi vòng lặp để tạo thành ngoài.
   - **Sparse Infill (Scanline Fill)**: Sử dụng phương pháp quét dòng ngang (scanline). Các vòng lặp được xoay đi một góc (+45° hoặc +135° tùy theo lớp chẵn/lẻ), cắt với các đường thẳng nằm ngang cách đều nhau tùy thuộc mật độ infill, sau đó xoay ngược lại tọa độ gốc để tạo đường lưới đan xen chắc chắn.
5. **Đùn nhựa và Ước tính G-code**:
   - Sử dụng công thức toán học tính toán thể tích nhựa đùn dựa trên chiều rộng dòng in (nozzle diameter * 1.05) và chiều cao lớp in, đối chiếu diện tích mặt cắt sợi nhựa filament để tính độ dài đùn nhựa (`E`).
   - Tạo mã G-code tiêu chuẩn (hỗ trợ bật nhiệt bàn, nhiệt đầu phun, homing, in prime line làm sạch đầu phun, di chuyển có rút nhựa - retraction để chống tơ và tắt nhiệt khi hoàn tất).
