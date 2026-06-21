# SeSpark - Web-based 3D Slicer & Printer Controller

**SeSpark** là một ứng dụng web hiện đại, hiệu năng cao, kết hợp giữa bộ cắt lớp mô hình 3D (3D Slicer) và bộ điều khiển máy in 3D (Printer Controller). Dự án được thiết kế với giao diện tối giản, cao cấp, mang lại trải nghiệm mượt mà trực tiếp trên trình duyệt bằng cách tận dụng sức mạnh tính toán của Rust qua WebAssembly và đồ họa 3D tương tác của Three.js.

---

## 1. Kiến trúc Dự án (Architecture)

Dự án được chia làm hai phần chính:

1. **Slicer Engine ([slicer-engine](file:///c:/Users/chien/Desktop/4.SePrinder/private_repo/SeSpark/slicer-engine))**:
   - Được viết bằng ngôn ngữ **Rust** ([lib.rs](file:///c:/Users/chien/Desktop/4.SePrinder/private_repo/SeSpark/slicer-engine/src/lib.rs)) cho tốc độ xử lý tối ưu.
   - Biên dịch sang **WebAssembly (WASM)** để chạy trực tiếp trên trình duyệt mà không cần máy chủ phụ trợ.
   - Chịu trách nhiệm phân tích tệp STL (cả định dạng ASCII và Binary), tính toán giao điểm mặt phẳng Z, liên kết các đoạn thẳng thành các vòng khép kín (loops), tạo đường chạy dao (toolpaths) cho tường (outer wall) và phần điền đầy (scanline infill) với thuật toán tối ưu hóa, và xuất ra mã G-code hoàn chỉnh cùng các số liệu thống kê.

2. **Frontend ([frontend](file:///c:/Users/chien/Desktop/4.SePrinder/private_repo/SeSpark/frontend))**:
   - Xây dựng trên **Svelte 5** ([App.svelte](file:///c:/Users/chien/Desktop/4.SePrinder/private_repo/SeSpark/frontend/src/App.svelte)) và **TypeScript** cho hiệu năng phản hồi UI cực nhanh.
   - Quản lý trạng thái ứng dụng tập trung bằng Svelte stores ([store.ts](file:///c:/Users/chien/Desktop/4.SePrinder/private_repo/SeSpark/frontend/src/lib/store.ts)).
   - Sử dụng **Three.js** ([Viewport.svelte](file:///c:/Users/chien/Desktop/4.SePrinder/private_repo/SeSpark/frontend/src/lib/components/Viewport.svelte)) để hiển thị không gian 3D của bàn in 256×256×256 mm, cho phép người dùng xem trước mô hình STL cũng như đường chạy dao (toolpaths) sau khi cắt lớp với các màu sắc phân biệt trực quan.

---

## 2. Các Tính năng Chính (Key Features)

### 2.1. Không gian Chuẩn bị In (Prepare Workspace)
* **Kéo & Thả STL**: Cho phép kéo thả trực tiếp tệp `.stl` vào màn hình hoặc mở tệp qua thanh điều hướng để nhập mô hình 3D.
* **Cấu hình Cắt lớp**: Sidebar thiết lập thông số trực quan chia làm 4 tab ([Sidebar.svelte](file:///c:/Users/chien/Desktop/4.SePrinder/private_repo/SeSpark/frontend/src/lib/components/Sidebar.svelte)):
  * **Quality**: Điều chỉnh chiều cao lớp in (Layer height), đường kính đầu phun (Nozzle diameter), đường kính sợi nhựa (Filament diameter).
  * **Strength**: Thiết lập số vòng thành (Wall loops), mật độ điền đầy (Infill density từ 0% đến 100%), và kiểu điền đầy (Infill pattern: Grid/Lines).
  * **Speed**: Tốc độ in và tốc độ di chuyển không đùn nhựa (Travel speed).
  * **Material**: Nhiệt độ đầu đùn (Extruder temp) và bàn in (Bed temp).
* **Tự động tối ưu hóa**: 3 lớp dưới cùng (bottom) và 3 lớp trên cùng (top) sẽ tự động được cắt lớp với mật độ infill cao (90%) để tăng cường độ cứng cáp cho cấu trúc mô hình và tạo độ mịn cho bề mặt ngoài.

### 2.2. Xem trước Lát cắt (Preview Workspace)
* **Trực quan hóa đường chạy dao**: Hiển thị mô phỏng 3D phân biệt màu sắc cho từng loại chuyển động:
  * <span style="color:#ef4444">■</span> **Outer Wall** (Thành ngoài)
  * <span style="color:#22c55e">■</span> **Inner Wall** (Thành trong - nếu có)
  * <span style="color:#f59e0b">■</span> **Sparse Infill** (Đường điền đầy)
  * <span style="color:#3b82f6">■</span> **Travel Moves** (Đường di chuyển không đùn nhựa)
* **Thanh trượt Z đứng**: Điều chỉnh xem đường chạy dao theo từng lớp hoặc tích lũy từ lớp 1 đến lớp hiện tại (mô phỏng thanh trượt dọc tương tự OrcaSlicer/Bambu Studio).
* **Thống kê chi tiết ([StatsPanel.svelte](file:///c:/Users/chien/Desktop/4.SePrinder/private_repo/SeSpark/frontend/src/lib/components/StatsPanel.svelte))**: Hiển thị thời gian in ước tính, khối lượng và chiều dài nhựa sử dụng, tổng số lớp, kích thước Bounding Box và biểu đồ phân bổ thời gian in giữa các loại di chuyển.
* **Bộ xem G-code ([GcodeViewer.svelte](file:///c:/Users/chien/Desktop/4.SePrinder/private_repo/SeSpark/frontend/src/lib/components/GcodeViewer.svelte))**: Xem trực tiếp file G-code dạng text được tạo ra và có thể tải xuống (`.gcode`) để nạp vào máy in thực tế.

### 2.3. Bảng Điều khiển Thiết bị (Device Dashboard)
* **Bảng điều khiển máy in giả lập ([DeviceDashboard.svelte](file:///c:/Users/chien/Desktop/4.SePrinder/private_repo/SeSpark/frontend/src/lib/components/DeviceDashboard.svelte))**: Mô phỏng giao diện kết nối WebSocket của máy in chạy firmware Klipper.
* **Biểu đồ nhiệt độ**: Vẽ đồ thị dạng SVG cập nhật thời gian thực nhiệt độ của đầu đùn (Hotend) và bàn in (Bed).
* **Điều khiển thủ công (Jog Controls)**: Điều khiển di chuyển đầu phun theo các trục X, Y, Z và nút Home trục (G28).
* **Console Terminal**: Nhập và gửi mã lệnh G-code trực tiếp cho máy in với bộ phân tích cú pháp phản hồi phản hồi lệnh chuẩn xác (`ok`).
* **Hỗ trợ thao tác nhanh**: Nút Preheat PLA (bàn in 60°C, đầu đùn 220°C) và Cooldown (tắt tất cả nhiệt độ).

---

## 3. Cấu trúc Thư mục (Directory Structure)

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

## 4. Hướng dẫn Phát triển (Local)

### Yêu cầu
- Node.js 22+
- Rust & wasm-pack (nếu cần sửa đổi mã nguồn bộ cắt lớp `slicer-engine`)

### Các bước thiết lập

1. **Build Slicer Engine (Chỉ khi thay đổi code Rust)**:
   Nếu thay đổi thuật toán cắt lớp trong Rust `slicer-engine`, hãy biên dịch lại để tạo mã WASM mới cho frontend:
   ```bash
   cd slicer-engine
   wasm-pack build --target web --out-dir ../frontend/src/lib/wasm-engine
   ```
   *Lưu ý: Thư mục `frontend/src/lib/wasm-engine` đã chứa mã WASM được build sẵn, bạn có thể bỏ qua bước này.*

2. **Cài đặt thư viện & Chạy Frontend**:
   Di chuyển vào thư mục `frontend`, cài đặt thư viện và chạy:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   Truy cập tại: `http://localhost:5173` để trải nghiệm ứng dụng.

3. **Kiểm tra Linting & Định dạng**:
   ```bash
   cd frontend
   npm run check
   ```

---

## 5. Triển khai với Docker (Production)

Hệ thống sử dụng Docker Multi-stage build để build Rust WASM, đóng gói frontend và deploy với Nginx Server.

**Build Image:**
```bash
docker compose build
```

**Khởi chạy:**
```bash
docker compose up -d
```

---

## 6. Triển khai nhanh (Production - Nhánh `deploy`)

Nếu bạn muốn triển khai nhanh lên server mà không cần clone toàn bộ mã nguồn, hãy sử dụng nhánh `deploy`. Nhánh này chỉ chứa duy nhất file `compose.yml` đã được tối ưu để kéo image trực tiếp từ GHCR.

**Các bước cập nhật/triển khai trên Server:**

0. **Clone dự án (nếu chưa có)**:
   ```bash
   git clone -b deploy https://github.com/seprinder-org/SeSpark.git
   cd SeSpark
   ```

1. **Vào thư mục dự án**:
   ```bash
   cd /path/to/SeSpark
   ```
2. **Cập nhật cấu hình mới nhất**:
   ```bash
   git fetch origin deploy
   git reset --hard origin/deploy
   ```
3. **Cập nhật Image và Khởi chạy**:
   ```bash
   sudo docker compose pull
   sudo docker compose up -d
   ```

**Lệnh Docker Pull & Login thủ công (nếu cần):**

1. **Đăng nhập vào GHCR** (chỉ làm một lần):
   ```bash
   echo "YOUR_GITHUB_PAT" | sudo docker login ghcr.io -u YOUR_USERNAME --password-stdin
   ```
2. **Kéo Image trực tiếp**:
   ```bash
   sudo docker pull ghcr.io/seprinder-org/sespark:latest
   ```

---

## 7. Kiểm thử (Testing)

- **Chạy toàn bộ test của Rust Slicer Engine**:
  ```bash
  cd slicer-engine
  cargo test
  ```
- **Chạy kiểm tra kiểu và cú pháp Frontend**:
  ```bash
  cd frontend
  npm run check
  ```

---

## 8. Quy trình CI/CD (GitHub Actions)

Dự án sử dụng GitHub Actions để tự động hóa việc kiểm thử và build Docker image triển khai lên môi trường Production.

### 8.1. Kiểm thử & Tự động Merge (Pull Request vào `master`)
* **Mục đích**: Tự động chạy toàn bộ các bài kiểm tra Rust cargo test và Frontend check khi có thay đổi chuẩn bị đưa vào `master`.
* **Cách kích hoạt**: Khi có **Pull Request** nhắm tới nhánh `master`.
* **Cơ chế hoạt động**:
  - Nếu toàn bộ test **thành công**, GitHub Actions sẽ tự động kích hoạt tính năng **Auto merge** để gộp PR vào nhánh `master`.
  - Nếu test **thất bại**, PR sẽ bị chặn merge để giữ nhánh `master` luôn ổn định.

### 8.2. Build và Publish Docker Image (Kích hoạt bằng Tag)
* **Mục đích**: Tự động build và push Docker image lên GitHub Container Registry (GHCR) với tên package là `sespark`.
* **Cách kích hoạt**:
  - Khi bạn **push tag** phiên bản có định dạng `v*.*.*` (ví dụ: `v1.0.0`).
  - Hoặc kích hoạt thủ công qua giao diện Web của GitHub Actions (Actions -> Chọn workflow "Build and Push Docker Image to GHCR" -> Chọn Run workflow).
* **Cơ chế dọn dẹp**: Tự động giữ lại 3 phiên bản image mới nhất và xóa bỏ các phiên bản cũ để tiết kiệm không gian lưu trữ trên GHCR.

### 8.3. Triển khai Server qua SSH (Tự động kích hoạt)
* **Mục đích**: Kích hoạt việc triển khai trực tiếp lên server của SePrinder.
* **Cơ chế hoạt động**:
  - Sau khi build và push Docker image thành công, workflow `build_and_publish_to_master.yml` sẽ tự động kích hoạt workflow `ssh_and_deploy_with_key.yml`.
  - Workflow này sẽ SSH đến Server, truy cập vào thư mục `~/spdproject/SeSpark` để pull image mới và khởi chạy lại container thông qua docker compose.

### 8.4. Hướng dẫn quy trình phát triển chi tiết

Khi phát triển tính năng mới hoặc sửa lỗi, hãy tuân theo các bước sau:

1. **Tạo nhánh tính năng từ `master`**:
   ```bash
   git checkout master
   git pull origin master
   git switch -c feature/new-logic
   ```

2. **Lập trình và commit**:
   ```bash
   # Viết code, chạy test local và commit
   git add .
   git commit -m "feat: bổ sung logic nghiệp vụ mới"
   git push origin feature/new-logic
   ```

3. **Tạo Pull Request vào `master`**:
   * **Cách 1: Sử dụng GitHub Web**: Tạo PR từ nhánh `feature/new-logic` trỏ vào nhánh `master` trên trang GitHub.
   * **Cách 2: Sử dụng GitHub CLI (`gh`)**:
     ```bash
     gh pr create --base master --head feature/new-logic --fill
     ```

4. **Cơ chế tự động merge**:
   - Hệ thống tự động chạy kiểm thử Rust và Frontend trên PR.
   - **Nếu pass test**: Hệ thống tự động merge PR này vào `master`.
   - **Nếu fail test**: Bạn sửa lỗi tại local trên nhánh `feature/new-logic`, commit và tiếp tục push lên. Hệ thống sẽ tự động chạy lại test cho đến khi pass và PR được merge thành công.

5. **Phát hành phiên bản (Build & Deploy Production)**:
   Sau khi PR đã được merge vào `master` thành công, bạn đồng bộ local và thực hiện gắn tag phiên bản để kích hoạt tiến trình build:
   ```bash
   git checkout master
   git pull origin master
   git tag v1.0.0
   git push origin v1.0.0
   ```

---

## 9. Chi tiết Thuật toán Cắt lớp (Slicing Pipeline Details)

Mã nguồn tại [lib.rs](file:///c:/Users/chien/Desktop/4.SePrinder/private_repo/SeSpark/slicer-engine/src/lib.rs) thực hiện quá trình cắt lớp qua các bước tuần tự:
1. **Dịch chuyển tọa độ (Auto-Centering)**: Đưa mô hình 3D về vị trí trung tâm bàn in (X=128, Y=128) và hạ độ cao Z xuống sát mặt bàn in (Z=0).
2. **Cắt mặt phẳng (Plane Intersection)**: Duyệt qua danh sách tam giác STL để tìm các cạnh cắt qua mặt phẳng nằm ngang tại độ cao Z của mỗi lớp in.
3. **Liên kết vòng (Loop Linking)**: Từ các đoạn thẳng rời rạc thu được sau khi cắt, thuật toán kết hợp chúng lại thành các đường bao khép kín (loops) bằng cách nối điểm gần nhất trong phạm vi sai số cho phép.
4. **Tạo đường chạy đùn nhựa**:
   - **Outer Wall**: Vẽ trực tiếp theo chu vi vòng lặp để tạo thành ngoài.
   - **Sparse Infill (Scanline Fill)**: Sử dụng phương pháp quét dòng ngang (scanline). Các vòng lặp được xoay đi một góc (+45° hoặc +135° tùy theo lớp chẵn/lẻ), cắt với các đường thẳng nằm ngang cách đều nhau tùy thuộc mật độ infill, sau đó xoay ngược lại tọa độ gốc để tạo đường lưới đan xen chắc chắn.
5. **Đùn nhựa và Ước tính G-code**:
   - Sử dụng công thức toán học tính toán thể tích nhựa đùn dựa trên chiều rộng dòng in (nozzle diameter * 1.05) và chiều cao lớp in, đối chiếu diện tích mặt cắt sợi nhựa filament để tính độ dài đùn nhựa (`E`).
   - Tạo mã G-code tiêu chuẩn (hỗ trợ bật nhiệt bàn, nhiệt đầu phun, homing, in prime line làm sạch đầu phun, di chuyển có rút nhựa - retraction để chống tơ và tắt nhiệt khi hoàn tất).

---
*Dự án thuộc hệ sinh thái SePrinder - Giải pháp kết nối và quản lý 3D Printing thông minh.*
