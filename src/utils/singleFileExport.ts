/**
 * Utility to generate and download a 100% self-contained Single-File HTML
 * with HTML, CSS, and pure Vanilla JavaScript for offline teaching.
 */
export function downloadSingleFileHTML(): void {
  const htmlContent = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Phòng Thí Nghiệm Hình Học - Single File HTML</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@300;400;500;600;700&family=Caveat:wght@600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Be Vietnam Pro', -apple-system, BlinkMacSystemFont, sans-serif;
      background-color: #141d18;
      color: #f1f5f9;
      display: flex;
      flex-direction: column;
      height: 100vh;
      overflow: hidden;
      user-select: none;
    }
    .font-caveat { font-family: 'Caveat', cursive; }
    .font-mono { font-family: 'JetBrains Mono', monospace; }
    
    /* Topbar */
    header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 24px;
      background: #141c17;
      border-bottom: 1px solid rgba(74, 222, 128, 0.2);
      z-index: 50;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .brand h1 {
      font-family: 'Caveat', cursive;
      font-size: 26px;
      color: #fde047;
      font-weight: 700;
    }
    .brand span {
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      color: #4ade80;
    }
    .tab-bar {
      display: flex;
      background: #1c2720;
      border: 1px solid rgba(74, 222, 128, 0.25);
      border-radius: 8px;
      padding: 3px;
      gap: 4px;
    }
    .tab-btn {
      background: transparent;
      border: none;
      color: #94a3b8;
      padding: 6px 14px;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }
    .tab-btn.active {
      background: #166534;
      color: #fde047;
      box-shadow: 0 1px 3px rgba(0,0,0,0.3);
    }
    .top-actions {
      display: flex;
      gap: 8px;
    }
    .btn-action {
      background: #1f2e24;
      border: 1px solid rgba(74, 222, 128, 0.3);
      color: #f1f5f9;
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 12px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .btn-action:hover { background: #26382c; }

    /* Main Workspace */
    .workspace {
      display: flex;
      flex: 1;
      height: calc(100vh - 58px);
      overflow: hidden;
    }
    .sidebar {
      width: 420px;
      background: #16201a;
      border-right: 1px solid rgba(74, 222, 128, 0.15);
      overflow-y: auto;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .sidebar::-webkit-scrollbar { width: 6px; }
    .sidebar::-webkit-scrollbar-thumb { background: rgba(74, 222, 128, 0.2); border-radius: 3px; }

    .stage {
      flex: 1;
      background: #121914;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      position: relative;
    }
    .canvas-card {
      width: 100%;
      height: 100%;
      border-radius: 12px;
      border: 4px solid #2d3a31;
      background: #16221b;
      overflow: hidden;
      position: relative;
      box-shadow: inset 0 0 40px rgba(0,0,0,0.6);
    }
    canvas {
      width: 100%;
      height: 100%;
      display: block;
    }

    /* Cards & controls */
    .section-title {
      font-size: 11px;
      text-transform: uppercase;
      font-family: 'JetBrains Mono', monospace;
      color: #4ade80;
      letter-spacing: 0.5px;
      margin-bottom: 8px;
    }
    .btn-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 6px;
    }
    .btn-grid-2 {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 6px;
    }
    .shape-btn {
      background: #1b2720;
      border: 1px solid rgba(74, 222, 128, 0.15);
      color: #cbd5e1;
      padding: 8px;
      border-radius: 6px;
      font-size: 12px;
      cursor: pointer;
      text-align: left;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .shape-btn.active {
      background: #166534;
      color: #fde047;
      border-color: #4ade80;
    }
    .card {
      background: #1b2720;
      border: 1px solid rgba(74, 222, 128, 0.15);
      border-radius: 8px;
      padding: 12px;
    }
    .slider-row {
      margin-bottom: 12px;
    }
    .slider-header {
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      margin-bottom: 4px;
      color: #cbd5e1;
    }
    .slider-header span.val {
      font-family: 'JetBrains Mono', monospace;
      color: #fde047;
      font-weight: 600;
    }
    input[type=range] {
      width: 100%;
      height: 6px;
      background: #121914;
      border-radius: 3px;
      outline: none;
      accent-color: #fde047;
      cursor: pointer;
    }
    .formula-item {
      padding: 8px 10px;
      background: #16201a;
      border: 1px solid rgba(74, 222, 128, 0.15);
      border-radius: 6px;
      margin-bottom: 8px;
    }
    .formula-item .top {
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      color: #4ade80;
      margin-bottom: 2px;
    }
    .formula-item .top .res {
      color: #fde047;
      font-family: 'JetBrains Mono', monospace;
      font-weight: 600;
    }
    .formula-item .code {
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      color: #94a3b8;
    }
    .alert-box {
      background: rgba(225, 29, 72, 0.15);
      border: 1px solid #e11d48;
      border-radius: 6px;
      padding: 10px;
      color: #fecdd3;
      font-size: 12px;
    }
  </style>
</head>
<body>

  <!-- Topbar -->
  <header>
    <div class="brand">
      <h1>📐 Phòng Thí Nghiệm Hình Học</h1>
      <span>· TOÁN CẤP 2 &amp; CẤP 3</span>
    </div>

    <div class="tab-bar">
      <button class="tab-btn active" id="tab-2d" onclick="switchTab('2d')">1. Hình Học Phẳng (2D)</button>
      <button class="tab-btn" id="tab-3d" onclick="switchTab('3d')">2. Hình Học Không Gian (3D)</button>
      <button class="tab-btn" id="tab-draw" onclick="switchTab('freedraw')">3. Bảng Vẽ Tự Do</button>
    </div>

    <div class="top-actions">
      <button class="btn-action" onclick="exportPNG()">📷 Xuất ảnh PNG</button>
    </div>
  </header>

  <!-- Workspace Container -->
  <div class="workspace">
    <!-- Sidebar -->
    <div class="sidebar" id="sidebar-container">
      <!-- Dynamic Sidebar controls injected via JS -->
    </div>

    <!-- Stage -->
    <div class="stage">
      <div class="canvas-card">
        <canvas id="mainCanvas"></canvas>
      </div>
    </div>
  </div>

  <script>
    // Global State
    let activeTab = '2d';
    const canvas = document.getElementById('mainCanvas');
    const ctx = canvas.getContext('2d');

    // 2D State
    let shape2D = 'triangle_scalene';
    const params2D = {
      a: 6, b: 7, c: 8,
      legA: 6, legB: 8,
      squareSide: 6,
      rectWidth: 8, rectHeight: 5,
      paraA: 8, paraB: 5, paraAngle: 60,
      rhombusSide: 6, rhombusAngle: 60,
      trapBaseA: 9, trapBaseB: 5, trapHeight: 5,
      circleRadius: 5, sectorAngle: 360,
      polygonSides: 6, polygonRadius: 5
    };

    // 3D State
    let shape3D = 'cube';
    const params3D = {
      cubeA: 5,
      cuboidA: 6, cuboidB: 4, cuboidC: 5,
      prismA: 5, prismH: 7,
      pyramidA: 6, pyramidH: 7,
      cylinderR: 3.5, cylinderH: 7,
      coneR: 4, coneH: 7,
      sphereR: 4.5
    };
    let rot3D = { x: 0.45, y: -0.65 };
    let autoRotate = true;
    let isDragging3D = false;
    let lastMouse = { x: 0, y: 0 };

    // Free Draw State
    let freeTool = 'select';
    let freePoints = [
      { id: 'p1', name: 'A', x: 200, y: 320 },
      { id: 'p2', name: 'B', x: 450, y: 320 },
      { id: 'p3', name: 'C', x: 325, y: 160 }
    ];
    let freeObjects = [
      { id: 'poly1', type: 'polygon', pointIds: ['p1', 'p2', 'p3'], color: '#4ade80' }
    ];
    let draggedPtId = null;
    let stepPtIds = [];
    let mouseCoord = { x: 0, y: 0 };

    // Switch Tab
    function switchTab(tab) {
      activeTab = tab;
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.getElementById('tab-' + (tab === 'freedraw' ? 'draw' : tab)).classList.add('active');
      renderSidebar();
      renderScene();
    }

    // Export PNG
    function exportPNG() {
      const link = document.createElement('a');
      link.download = 'phong-thi-nghiem-hinh-hoc.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    }

    // 2D Math Functions
    function calc2D() {
      if (shape2D === 'triangle_scalene') {
        const { a, b, c } = params2D;
        if (a + b <= c || a + c <= b || b + c <= a) {
          return { valid: false, error: 'Bất đẳng thức tam giác không thoả mãn (tổng 2 cạnh phải lớn hơn cạnh còn lại).' };
        }
        const p = (a + b + c) / 2;
        const s = Math.sqrt(p * (p - a) * (p - b) * (p - c));
        const ha = (2 * s) / a;
        return {
          valid: true,
          formulas: [
            { label: 'Chu vi (P)', formula: 'P = a + b + c', val: (a + b + c).toFixed(2) + ' cm' },
            { label: 'Nửa chu vi (p)', formula: 'p = P / 2', val: p.toFixed(2) + ' cm' },
            { label: 'Diện tích (S)', formula: 'S = √(p(p-a)(p-b)(p-c))', val: s.toFixed(2) + ' cm²' },
            { label: 'Chiều cao ha', formula: 'ha = 2S / a', val: ha.toFixed(2) + ' cm' }
          ]
        };
      }
      if (shape2D === 'triangle_right') {
        const { legA: a, legB: b } = params2D;
        const c = Math.sqrt(a * a + b * b);
        const s = 0.5 * a * b;
        return {
          valid: true,
          formulas: [
            { label: 'Cạnh huyền (c)', formula: 'c = √(a² + b²)', val: c.toFixed(2) + ' cm' },
            { label: 'Chu vi (P)', formula: 'P = a + b + c', val: (a + b + c).toFixed(2) + ' cm' },
            { label: 'Diện tích (S)', formula: 'S = 1/2 · a · b', val: s.toFixed(2) + ' cm²' },
            { label: 'Đường cao hạ từ đỉnh vuông', formula: 'h = (a·b) / c', val: ((a*b)/c).toFixed(2) + ' cm' }
          ]
        };
      }
      if (shape2D === 'square') {
        const a = params2D.squareSide;
        return {
          valid: true,
          formulas: [
            { label: 'Chu vi (P)', formula: 'P = 4 · a', val: (4 * a).toFixed(2) + ' cm' },
            { label: 'Diện tích (S)', formula: 'S = a²', val: (a * a).toFixed(2) + ' cm²' },
            { label: 'Đường chéo (d)', formula: 'd = a√2', val: (a * Math.SQRT2).toFixed(2) + ' cm' }
          ]
        };
      }
      if (shape2D === 'rectangle') {
        const { rectWidth: a, rectHeight: b } = params2D;
        return {
          valid: true,
          formulas: [
            { label: 'Chu vi (P)', formula: 'P = 2 · (a + b)', val: (2 * (a + b)).toFixed(2) + ' cm' },
            { label: 'Diện tích (S)', formula: 'S = a · b', val: (a * b).toFixed(2) + ' cm²' },
            { label: 'Đường chéo (d)', formula: 'd = √(a² + b²)', val: Math.sqrt(a * a + b * b).toFixed(2) + ' cm' }
          ]
        };
      }
      if (shape2D === 'circle') {
        const R = params2D.circleRadius;
        return {
          valid: true,
          formulas: [
            { label: 'Chu vi (C)', formula: 'C = 2 · π · R', val: (2 * Math.PI * R).toFixed(2) + ' cm' },
            { label: 'Diện tích (S)', formula: 'S = π · R²', val: (Math.PI * R * R).toFixed(2) + ' cm²' }
          ]
        };
      }
      return { valid: true, formulas: [] };
    }

    // 3D Math Functions
    function calc3D() {
      if (shape3D === 'cube') {
        const a = params3D.cubeA;
        return [
          { label: 'Thể tích (V)', formula: 'V = a³', val: (a*a*a).toFixed(2) + ' cm³' },
          { label: 'Diện tích xung quanh', formula: 'Sxq = 4 · a²', val: (4*a*a).toFixed(2) + ' cm²' },
          { label: 'Diện tích toàn phần', formula: 'Stp = 6 · a²', val: (6*a*a).toFixed(2) + ' cm²' }
        ];
      }
      if (shape3D === 'cuboid') {
        const { cuboidA: a, cuboidB: b, cuboidC: c } = params3D;
        return [
          { label: 'Thể tích (V)', formula: 'V = a · b · c', val: (a*b*c).toFixed(2) + ' cm³' },
          { label: 'Diện tích xung quanh', formula: 'Sxq = 2 · (a + b) · c', val: (2*(a+b)*c).toFixed(2) + ' cm²' },
          { label: 'Diện tích toàn phần', formula: 'Stp = 2(ab + bc + ca)', val: (2*(a*b+b*c+c*a)).toFixed(2) + ' cm²' }
        ];
      }
      if (shape3D === 'cylinder') {
        const { cylinderR: r, cylinderH: h } = params3D;
        const v = Math.PI * r * r * h;
        const sxq = 2 * Math.PI * r * h;
        return [
          { label: 'Thể tích (V)', formula: 'V = π · r² · h', val: v.toFixed(2) + ' cm³' },
          { label: 'Diện tích xung quanh', formula: 'Sxq = 2 · π · r · h', val: sxq.toFixed(2) + ' cm²' },
          { label: 'Diện tích toàn phần', formula: 'Stp = Sxq + 2πr²', val: (sxq + 2*Math.PI*r*r).toFixed(2) + ' cm²' }
        ];
      }
      if (shape3D === 'cone') {
        const { coneR: r, coneH: h } = params3D;
        const l = Math.sqrt(r * r + h * h);
        const v = (1/3) * Math.PI * r * r * h;
        const sxq = Math.PI * r * l;
        return [
          { label: 'Đường sinh (l)', formula: 'l = √(r² + h²)', val: l.toFixed(2) + ' cm' },
          { label: 'Thể tích (V)', formula: 'V = 1/3 · π · r² · h', val: v.toFixed(2) + ' cm³' },
          { label: 'Diện tích xung quanh', formula: 'Sxq = π · r · l', val: sxq.toFixed(2) + ' cm²' }
        ];
      }
      if (shape3D === 'sphere') {
        const r = params3D.sphereR;
        const v = (4/3) * Math.PI * r * r * r;
        const s = 4 * Math.PI * r * r;
        return [
          { label: 'Thể tích (V)', formula: 'V = 4/3 · π · R³', val: v.toFixed(2) + ' cm³' },
          { label: 'Diện tích mặt cầu (S)', formula: 'S = 4 · π · R²', val: s.toFixed(2) + ' cm²' }
        ];
      }
      return [];
    }

    // Render Sidebar based on active tab
    function renderSidebar() {
      const container = document.getElementById('sidebar-container');
      if (activeTab === '2d') {
        const res = calc2D();
        container.innerHTML = \`
          <div>
            <div class="section-title">Chọn hình 2D:</div>
            <div class="btn-grid">
              <button class="shape-btn \${shape2D==='triangle_scalene'?'active':''}" onclick="setShape2D('triangle_scalene')">▲ TG Thường</button>
              <button class="shape-btn \${shape2D==='triangle_right'?'active':''}" onclick="setShape2D('triangle_right')">⊿ TG Vuông</button>
              <button class="shape-btn \${shape2D==='square'?'active':''}" onclick="setShape2D('square')">■ Hình Vuông</button>
              <button class="shape-btn \${shape2D==='rectangle'?'active':''}" onclick="setShape2D('rectangle')">▭ Chữ Nhật</button>
              <button class="shape-btn \${shape2D==='circle'?'active':''}" onclick="setShape2D('circle')">● Hình Tròn</button>
            </div>
          </div>
          \${!res.valid ? \`<div class="alert-box">⚠️ \${res.error}</div>\` : ''}
          <div class="card">
            <div class="section-title">Kích thước:</div>
            \${get2DSliders()}
          </div>
          <div>
            <div class="section-title">Công thức &amp; Kết quả:</div>
            \${res.formulas ? res.formulas.map(f => \`
              <div class="formula-item">
                <div class="top"><span>\${f.label}</span><span class="res">\${f.val}</span></div>
                <div class="code">\${f.formula}</div>
              </div>
            \`).join('') : ''}
          </div>
        \`;
      } else if (activeTab === '3d') {
        const formulas = calc3D();
        container.innerHTML = \`
          <div>
            <div class="section-title">Chọn khối 3D:</div>
            <div class="btn-grid-2">
              <button class="shape-btn \${shape3D==='cube'?'active':''}" onclick="setShape3D('cube')">🧊 Lập Phương</button>
              <button class="shape-btn \${shape3D==='cuboid'?'active':''}" onclick="setShape3D('cuboid')">📦 Hộp Chữ Nhật</button>
              <button class="shape-btn \${shape3D==='cylinder'?'active':''}" onclick="setShape3D('cylinder')">🥫 Hình Trụ</button>
              <button class="shape-btn \${shape3D==='cone'?'active':''}" onclick="setShape3D('cone')">🍦 Hình Nón</button>
              <button class="shape-btn \${shape3D==='sphere'?'active':''}" onclick="setShape3D('sphere')">⚽ Hình Cầu</button>
            </div>
          </div>
          <div class="card">
            <div class="section-title">Thông số:</div>
            \${get3DSliders()}
          </div>
          <div style="display:flex;gap:8px;">
            <button class="btn-action" style="flex:1" onclick="autoRotate=!autoRotate;renderSidebar()">\${autoRotate?'Dừng tự xoay':'Tự xoay'}</button>
            <button class="btn-action" style="flex:1" onclick="rot3D={x:0.45,y:-0.65}">Đặt lại góc</button>
          </div>
          <div>
            <div class="section-title">Tính toán 3D:</div>
            \${formulas.map(f => \`
              <div class="formula-item">
                <div class="top"><span>\${f.label}</span><span class="res">\${f.val}</span></div>
                <div class="code">\${f.formula}</div>
              </div>
            \`).join('')}
          </div>
        \`;
      } else {
        container.innerHTML = \`
          <div>
            <div class="section-title">Công cụ dựng hình:</div>
            <div class="btn-grid">
              <button class="shape-btn \${freeTool==='select'?'active':''}" onclick="setFreeTool('select')">Di chuyển</button>
              <button class="shape-btn \${freeTool==='point'?'active':''}" onclick="setFreeTool('point')">Điểm</button>
              <button class="shape-btn \${freeTool==='segment'?'active':''}" onclick="setFreeTool('segment')">Đoạn thẳng</button>
              <button class="shape-btn \${freeTool==='circle'?'active':''}" onclick="setFreeTool('circle')">Đường tròn</button>
              <button class="shape-btn \${freeTool==='polygon'?'active':''}" onclick="setFreeTool('polygon')">Đa giác</button>
              <button class="shape-btn \${freeTool==='delete'?'active':''}" onclick="setFreeTool('delete')">Xoá</button>
            </div>
          </div>
          <div style="display:flex;gap:8px;">
            <button class="btn-action" style="flex:1" onclick="freePoints=[];freeObjects=[];renderSidebar();renderScene();">Xoá tất cả</button>
          </div>
          <div class="card">
            <div class="section-title">Đối tượng đã vẽ (\${freePoints.length} điểm):</div>
            \${freePoints.map(p => \`
              <div style="display:flex;justify-content:space-between;font-size:12px;padding:4px 0;border-bottom:1px solid rgba(74,222,128,0.1)">
                <span class="font-caveat" style="color:#fde047;font-size:16px;">Điểm \${p.name}</span>
                <span class="font-mono" style="color:#94a3b8">(\${Math.round(p.x)}, \${Math.round(p.y)})</span>
              </div>
            \`).join('')}
          </div>
        \`;
      }
    }

    function setShape2D(s) { shape2D = s; renderSidebar(); renderScene(); }
    function setShape3D(s) { shape3D = s; renderSidebar(); renderScene(); }
    function setFreeTool(t) { freeTool = t; stepPtIds = []; renderSidebar(); }

    function get2DSliders() {
      if (shape2D === 'triangle_scalene') {
        return \`
          \${makeSlider('Cạnh a', params2D.a, 1, 20, v => { params2D.a = v; })}
          \${makeSlider('Cạnh b', params2D.b, 1, 20, v => { params2D.b = v; })}
          \${makeSlider('Cạnh c', params2D.c, 1, 20, v => { params2D.c = v; })}
        \`;
      }
      if (shape2D === 'triangle_right') {
        return \`
          \${makeSlider('Cạnh góc vuông a', params2D.legA, 1, 20, v => { params2D.legA = v; })}
          \${makeSlider('Cạnh góc vuông b', params2D.legB, 1, 20, v => { params2D.legB = v; })}
        \`;
      }
      if (shape2D === 'square') {
        return makeSlider('Cạnh a', params2D.squareSide, 1, 20, v => { params2D.squareSide = v; });
      }
      if (shape2D === 'rectangle') {
        return \`
          \${makeSlider('Chiều dài', params2D.rectWidth, 1, 20, v => { params2D.rectWidth = v; })}
          \${makeSlider('Chiều rộng', params2D.rectHeight, 1, 20, v => { params2D.rectHeight = v; })}
        \`;
      }
      if (shape2D === 'circle') {
        return makeSlider('Bán kính R', params2D.circleRadius, 1, 15, v => { params2D.circleRadius = v; });
      }
      return '';
    }

    function get3DSliders() {
      if (shape3D === 'cube') return makeSlider3D('Cạnh a', params3D.cubeA, 1, 15, v => { params3D.cubeA = v; });
      if (shape3D === 'cuboid') {
        return \`
          \${makeSlider3D('Chiều dài a', params3D.cuboidA, 1, 15, v => { params3D.cuboidA = v; })}
          \${makeSlider3D('Chiều rộng b', params3D.cuboidB, 1, 15, v => { params3D.cuboidB = v; })}
          \${makeSlider3D('Chiều cao c', params3D.cuboidC, 1, 15, v => { params3D.cuboidC = v; })}
        \`;
      }
      if (shape3D === 'cylinder') {
        return \`
          \${makeSlider3D('Bán kính đáy r', params3D.cylinderR, 1, 12, v => { params3D.cylinderR = v; })}
          \${makeSlider3D('Chiều cao h', params3D.cylinderH, 1, 15, v => { params3D.cylinderH = v; })}
        \`;
      }
      if (shape3D === 'cone') {
        return \`
          \${makeSlider3D('Bán kính r', params3D.coneR, 1, 12, v => { params3D.coneR = v; })}
          \${makeSlider3D('Chiều cao h', params3D.coneH, 1, 15, v => { params3D.coneH = v; })}
        \`;
      }
      if (shape3D === 'sphere') return makeSlider3D('Bán kính R', params3D.sphereR, 1, 10, v => { params3D.sphereR = v; });
      return '';
    }

    function makeSlider(label, val, min, max, cb) {
      return \`
        <div class="slider-row">
          <div class="slider-header"><span>\${label}</span><span class="val">\${val} cm</span></div>
          <input type="range" min="\${min}" max="\${max}" step="0.5" value="\${val}" oninput="this.previousElementSibling.children[1].innerText=this.value+' cm';(\${cb.toString()})(Number(this.value));renderSidebar();renderScene();">
        </div>
      \`;
    }

    function makeSlider3D(label, val, min, max, cb) {
      return \`
        <div class="slider-row">
          <div class="slider-header"><span>\${label}</span><span class="val">\${val} cm</span></div>
          <input type="range" min="\${min}" max="\${max}" step="0.5" value="\${val}" oninput="this.previousElementSibling.children[1].innerText=this.value+' cm';(\${cb.toString()})(Number(this.value));renderSidebar();renderScene();">
        </div>
      \`;
    }

    // Canvas Master Render Loop
    function renderScene() {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Background
      ctx.fillStyle = '#16221b';
      ctx.fillRect(0, 0, rect.width, rect.height);

      // Subtle chalk grid
      ctx.strokeStyle = 'rgba(74, 222, 128, 0.05)';
      ctx.lineWidth = 1;
      for (let x = 0; x < rect.width; x += 32) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, rect.height); ctx.stroke();
      }
      for (let y = 0; y < rect.height; y += 32) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(rect.width, y); ctx.stroke();
      }

      if (activeTab === '2d') draw2D(rect.width, rect.height);
      else if (activeTab === '3d') draw3D(rect.width, rect.height);
      else drawFree(rect.width, rect.height);
    }

    function draw2D(w, h) {
      if (shape2D === 'circle') {
        const R = params2D.circleRadius;
        const drawR = Math.min(w, h) * 0.3;
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(w/2, h/2, drawR, 0, 2*Math.PI);
        ctx.fillStyle = 'rgba(56, 189, 248, 0.08)';
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#fde047';
        ctx.beginPath(); ctx.arc(w/2, h/2, 4, 0, 2*Math.PI); ctx.fill();
        ctx.font = '600 20px "Caveat", cursive';
        ctx.fillText('O', w/2 - 15, h/2 - 5);
        return;
      }

      let pts = [];
      let labels = ['A', 'B', 'C', 'D'];
      if (shape2D === 'triangle_scalene') {
        const { a, b, c } = params2D;
        if (a + b <= c || a + c <= b || b + c <= a) return;
        const cosB = (a*a + c*c - b*b) / (2*a*c);
        const sinB = Math.sqrt(Math.max(0, 1 - cosB*cosB));
        pts = [{ x: c * cosB, y: c * sinB }, { x: 0, y: 0 }, { x: a, y: 0 }];
      } else if (shape2D === 'triangle_right') {
        pts = [{ x: 0, y: params2D.legA }, { x: 0, y: 0 }, { x: params2D.legB, y: 0 }];
      } else if (shape2D === 'square') {
        const a = params2D.squareSide;
        pts = [{ x: 0, y: 0 }, { x: a, y: 0 }, { x: a, y: a }, { x: 0, y: a }];
      } else if (shape2D === 'rectangle') {
        const { rectWidth: a, rectHeight: b } = params2D;
        pts = [{ x: 0, y: 0 }, { x: a, y: 0 }, { x: a, y: b }, { x: 0, y: b }];
      }

      if (pts.length === 0) return;
      let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
      pts.forEach(p => { minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x); minY = Math.min(minY, p.y); maxY = Math.max(maxY, p.y); });
      const scale = Math.min((w - 120) / (maxX - minX || 1), (h - 120) / (maxY - minY || 1));
      const cx = (minX + maxX) / 2;
      const cy = (minY + maxY) / 2;
      const scr = pts.map(p => ({ x: w/2 + (p.x - cx)*scale, y: h/2 - (p.y - cy)*scale }));

      ctx.beginPath();
      ctx.moveTo(scr[0].x, scr[0].y);
      for (let i = 1; i < scr.length; i++) ctx.lineTo(scr[i].x, scr[i].y);
      ctx.closePath();
      ctx.fillStyle = 'rgba(74, 222, 128, 0.08)';
      ctx.fill();
      ctx.strokeStyle = '#4ade80';
      ctx.lineWidth = 2.8;
      ctx.stroke();

      scr.forEach((p, i) => {
        ctx.fillStyle = '#fde047';
        ctx.beginPath(); ctx.arc(p.x, p.y, 4, 0, 2*Math.PI); ctx.fill();
        ctx.font = '600 22px "Caveat", cursive';
        ctx.fillText(labels[i]||'P', p.x + 8, p.y - 8);
      });
    }

    function draw3D(w, h) {
      const s = 1.0;
      let verts = [
        {x:-s,y:-s,z:-s},{x:s,y:-s,z:-s},{x:s,y:s,z:-s},{x:-s,y:s,z:-s},
        {x:-s,y:-s,z:s},{x:s,y:-s,z:s},{x:s,y:s,z:s},{x:-s,y:s,z:s}
      ];
      let faces = [
        {i:[0,1,2,3],c:[56,189,248]},{i:[4,7,6,5],c:[56,189,248]},
        {i:[0,4,5,1],c:[74,222,128]},{i:[3,2,6,7],c:[74,222,128]},
        {i:[0,3,7,4],c:[251,113,133]},{i:[1,5,6,2],c:[253,224,71]}
      ];

      // Rotate
      const cx = Math.cos(rot3D.x), sx = Math.sin(rot3D.x);
      const cy = Math.cos(rot3D.y), sy = Math.sin(rot3D.y);
      const rot = verts.map(v => {
        const y1 = v.y * cx - v.z * sx;
        const z1 = v.y * sx + v.z * cx;
        const x2 = v.x * cy + z1 * sy;
        const z2 = -v.x * sy + z1 * cy;
        return { x: x2, y: y1, z: z2 };
      });

      const camDist = 4.0;
      const zoom = Math.min(w, h) * 0.4;
      const prj = rot.map(v => ({
        x: w/2 + v.x * (camDist / (v.z + camDist)) * zoom,
        y: h/2 - v.y * (camDist / (v.z + camDist)) * zoom
      }));

      // Sort faces
      faces.forEach(f => {
        f.avgZ = (rot[f.i[0]].z + rot[f.i[1]].z + rot[f.i[2]].z + rot[f.i[3]].z) / 4;
      });
      faces.sort((a,b) => a.avgZ - b.avgZ);

      faces.forEach(f => {
        ctx.beginPath();
        ctx.moveTo(prj[f.i[0]].x, prj[f.i[0]].y);
        for(let j=1; j<f.i.length; j++) ctx.lineTo(prj[f.i[j]].x, prj[f.i[j]].y);
        ctx.closePath();
        ctx.fillStyle = \`rgba(\${f.c[0]},\${f.c[1]},\${f.c[2]},0.5)\`;
        ctx.fill();
        ctx.strokeStyle = \`rgba(\${f.c[0]},\${f.c[1]},\${f.c[2]},0.9)\`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      });
    }

    function drawFree(w, h) {
      freeObjects.forEach(obj => {
        if (obj.type === 'polygon') {
          const pts = obj.pointIds.map(id => freePoints.find(p=>p.id===id)).filter(Boolean);
          if (pts.length >= 3) {
            ctx.beginPath();
            ctx.moveTo(pts[0].x, pts[0].y);
            for(let i=1; i<pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
            ctx.closePath();
            ctx.fillStyle = 'rgba(74, 222, 128, 0.08)';
            ctx.fill();
            ctx.strokeStyle = '#4ade80';
            ctx.lineWidth = 2.4;
            ctx.stroke();
          }
        }
      });
      freePoints.forEach(p => {
        ctx.fillStyle = '#facc15';
        ctx.beginPath(); ctx.arc(p.x, p.y, 5, 0, 2*Math.PI); ctx.fill();
        ctx.font = '600 20px "Caveat", cursive';
        ctx.fillText(p.name, p.x + 8, p.y - 8);
      });
    }

    // 3D Mouse drag
    canvas.addEventListener('mousedown', e => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      if (activeTab === '3d') {
        isDragging3D = true;
        lastMouse = { x: e.clientX, y: e.clientY };
      } else if (activeTab === 'freedraw') {
        const hit = freePoints.find(p => Math.hypot(p.x - x, p.y - y) < 14);
        if (freeTool === 'select' && hit) draggedPtId = hit.id;
        else if (freeTool === 'point') {
          const name = String.fromCharCode(65 + freePoints.length);
          freePoints.push({ id: 'p_' + Date.now(), name, x, y });
          renderSidebar();
          renderScene();
        }
      }
    });

    window.addEventListener('mousemove', e => {
      if (isDragging3D && activeTab === '3d') {
        const dx = e.clientX - lastMouse.x;
        const dy = e.clientY - lastMouse.y;
        lastMouse = { x: e.clientX, y: e.clientY };
        rot3D.y += dx * 0.01;
        rot3D.x += dy * 0.01;
      }
      if (draggedPtId && activeTab === 'freedraw') {
        const rect = canvas.getBoundingClientRect();
        const pt = freePoints.find(p => p.id === draggedPtId);
        if (pt) {
          pt.x = e.clientX - rect.left;
          pt.y = e.clientY - rect.top;
          renderScene();
        }
      }
    });

    window.addEventListener('mouseup', () => {
      isDragging3D = false;
      draggedPtId = null;
    });

    // Animation Loop
    function anim() {
      if (activeTab === '3d' && autoRotate && !isDragging3D) {
        rot3D.y += 0.008;
      }
      renderScene();
      requestAnimationFrame(anim);
    }

    window.addEventListener('resize', renderScene);
    renderSidebar();
    requestAnimationFrame(anim);
  </script>
</body>
</html>`;

  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'phong_thi_nghiem_hinh_hoc.html';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
