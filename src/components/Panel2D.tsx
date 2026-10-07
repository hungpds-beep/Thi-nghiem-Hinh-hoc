import React, { useState, useEffect, useRef } from 'react';
import { Shape2DType, Shape2DParams } from '../types/geometry';
import { calculate2DShape, get2DShapeVertices, Point } from '../utils/math2d';
import { AlertTriangle, CheckCircle2, RotateCcw } from 'lucide-react';

interface Panel2DProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
}

const defaultParams: Shape2DParams = {
  a: 6,
  b: 7,
  c: 8,
  legA: 6,
  legB: 8,
  squareSide: 6,
  rectWidth: 8,
  rectHeight: 5,
  paraA: 8,
  paraB: 5,
  paraAngle: 60,
  rhombusSide: 6,
  rhombusAngle: 60,
  trapBaseA: 9,
  trapBaseB: 5,
  trapHeight: 5,
  circleRadius: 5,
  sectorAngle: 360,
  polygonSides: 6,
  polygonRadius: 5,
};

const shapeList: { id: Shape2DType; label: string; icon: string }[] = [
  { id: 'triangle_scalene', label: 'Tam giác thường', icon: '▲' },
  { id: 'triangle_right', label: 'Tam giác vuông', icon: '⊿' },
  { id: 'square', label: 'Hình vuông', icon: '■' },
  { id: 'rectangle', label: 'Hình chữ nhật', icon: '▭' },
  { id: 'parallelogram', label: 'Hình bình hành', icon: '▱' },
  { id: 'rhombus', label: 'Hình thoi', icon: '◆' },
  { id: 'trapezoid_isosceles', label: 'Hình thang cân', icon: '⏢' },
  { id: 'circle', label: 'Hình tròn', icon: '●' },
  { id: 'regular_polygon', label: 'Đa giác đều', icon: '⬡' },
];

export const Panel2D: React.FC<Panel2DProps> = ({ canvasRef }) => {
  const [currentShape, setCurrentShape] = useState<Shape2DType>('triangle_scalene');
  const [params, setParams] = useState<Shape2DParams>(defaultParams);
  const [showMeasurements, setShowMeasurements] = useState(true);
  const [showAngles, setShowAngles] = useState(true);
  const [showAltitudes, setShowAltitudes] = useState(true);
  const [showCircumcircle, setShowCircumcircle] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  const updateParam = (key: keyof Shape2DParams, val: number) => {
    setParams((prev) => ({ ...prev, [key]: Number(val) }));
  };

  const calcResult = calculate2DShape(currentShape, params);

  // Redraw Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle HiDPI scaling
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const width = rect.width;
    const height = rect.height;

    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx.scale(dpr, dpr);

    // Clear and draw blackboard
    ctx.fillStyle = '#16221b';
    ctx.fillRect(0, 0, width, height);

    // Chalkboard subtle grid
    ctx.strokeStyle = 'rgba(74, 222, 128, 0.05)';
    ctx.lineWidth = 1;
    const gridSize = 32;
    for (let x = 0; x < width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    if (!calcResult.isValid) {
      ctx.fillStyle = '#fb7185';
      ctx.font = '600 16px "Be Vietnam Pro", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('⚠️ Không thể vẽ hình: Điều kiện hình học không thoả mãn', width / 2, height / 2 - 10);
      ctx.font = '400 13px "Be Vietnam Pro", sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(calcResult.errorMessage || 'Vui lòng điều chỉnh thông số thanh trượt ở bảng bên trái.', width / 2, height / 2 + 15);
      return;
    }

    if (currentShape === 'circle') {
      const R = params.circleRadius;
      const deg = params.sectorAngle;
      const centerX = width / 2;
      const centerY = height / 2;
      const maxDrawRadius = Math.min(width, height) * 0.35;
      const scale = maxDrawRadius / Math.max(R, 1);
      const drawR = R * scale;

      // Glow effect for circle
      ctx.shadowColor = 'rgba(56, 189, 248, 0.5)';
      ctx.shadowBlur = 8;
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3;

      if (deg >= 360) {
        // Full circle
        ctx.beginPath();
        ctx.arc(centerX, centerY, drawR, 0, 2 * Math.PI);
        ctx.fillStyle = 'rgba(56, 189, 248, 0.08)';
        ctx.fill();
        ctx.stroke();
      } else {
        // Sector
        const endRad = (deg * Math.PI) / 180;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, drawR, 0, endRad);
        ctx.closePath();
        ctx.fillStyle = 'rgba(253, 224, 71, 0.12)';
        ctx.fill();
        ctx.stroke();
      }

      ctx.shadowBlur = 0;

      // Center point O
      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.arc(centerX, centerY, 4, 0, 2 * Math.PI);
      ctx.fill();
      ctx.font = '600 18px "Caveat", cursive';
      ctx.fillText('O', centerX - 14, centerY - 6);

      // Radius line
      ctx.strokeStyle = '#fde047';
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(centerX + drawR, centerY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Radius point
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(centerX + drawR, centerY, 3, 0, 2 * Math.PI);
      ctx.fill();
      ctx.fillText('R', centerX + drawR + 6, centerY + 5);

      if (showMeasurements) {
        ctx.font = '500 13px "JetBrains Mono", monospace';
        ctx.fillStyle = '#fde047';
        ctx.textAlign = 'center';
        ctx.fillText(`R = ${R} cm`, centerX + drawR / 2, centerY - 8);
      }
      return;
    }

    // Polygon / Triangle rendering
    const geo = get2DShapeVertices(currentShape, params);
    if (!geo.points || geo.points.length === 0) return;

    // Compute bounding box to fit into canvas
    let minX = Infinity,
      maxX = -Infinity,
      minY = Infinity,
      maxY = -Infinity;
    geo.points.forEach((p) => {
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.y > maxY) maxY = p.y;
    });

    if (geo.heightLine) {
      minX = Math.min(minX, geo.heightLine.p1.x, geo.heightLine.p2.x);
      maxX = Math.max(maxX, geo.heightLine.p1.x, geo.heightLine.p2.x);
      minY = Math.min(minY, geo.heightLine.p1.y, geo.heightLine.p2.y);
      maxY = Math.max(maxY, geo.heightLine.p1.y, geo.heightLine.p2.y);
    }

    const shapeW = Math.max(maxX - minX, 0.01);
    const shapeH = Math.max(maxY - minY, 0.01);
    const padding = 70;
    const availW = width - padding * 2;
    const availH = height - padding * 2;
    const scale = Math.min(availW / shapeW, availH / shapeH);

    const toScreen = (p: Point): Point => {
      // Invert Y for standard math orientation
      const cx = (minX + maxX) / 2;
      const cy = (minY + maxY) / 2;
      return {
        x: width / 2 + (p.x - cx) * scale,
        y: height / 2 - (p.y - cy) * scale,
      };
    };

    const screenPoints = geo.points.map(toScreen);

    // Optional circumcircle or incircle
    if (showCircumcircle && calcResult.outRadius) {
      let centerScreen: Point = { x: width / 2, y: height / 2 };
      if (currentShape === 'triangle_scalene' || currentShape === 'triangle_right') {
        // Circumcenter
        const R_screen = calcResult.outRadius * scale;
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.arc(centerScreen.x, centerScreen.y, R_screen, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }

    // Fill polygon with soft chalkboard color
    ctx.beginPath();
    ctx.moveTo(screenPoints[0].x, screenPoints[0].y);
    for (let i = 1; i < screenPoints.length; i++) {
      ctx.lineTo(screenPoints[i].x, screenPoints[i].y);
    }
    ctx.closePath();
    ctx.fillStyle = 'rgba(74, 222, 128, 0.06)';
    ctx.fill();

    // Draw main edges
    ctx.shadowColor = 'rgba(74, 222, 128, 0.5)';
    ctx.shadowBlur = 6;
    ctx.strokeStyle = '#4ade80';
    ctx.lineWidth = 2.8;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Draw Right Angles
    if (geo.rightAngles) {
      geo.rightAngles.forEach((triplet) => {
        const [p1, corner, p2] = triplet.map(toScreen);
        const v1x = p1.x - corner.x;
        const v1y = p1.y - corner.y;
        const v2x = p2.x - corner.x;
        const v2y = p2.y - corner.y;
        const len1 = Math.hypot(v1x, v1y);
        const len2 = Math.hypot(v2x, v2y);
        if (len1 > 0 && len2 > 0) {
          const sqSize = 14;
          const u1x = (v1x / len1) * sqSize;
          const u1y = (v1y / len1) * sqSize;
          const u2x = (v2x / len2) * sqSize;
          const u2y = (v2y / len2) * sqSize;

          ctx.strokeStyle = '#fde047';
          ctx.lineWidth = 1.8;
          ctx.beginPath();
          ctx.moveTo(corner.x + u1x, corner.y + u1y);
          ctx.lineTo(corner.x + u1x + u2x, corner.y + u1y + u2y);
          ctx.lineTo(corner.x + u2x, corner.y + u2y);
          ctx.stroke();
        }
      });
    }

    // Draw Altitude line if applicable
    if (showAltitudes && geo.heightLine) {
      const sp1 = toScreen(geo.heightLine.p1);
      const sp2 = toScreen(geo.heightLine.p2);
      ctx.strokeStyle = '#fde047';
      ctx.setLineDash([5, 4]);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(sp1.x, sp1.y);
      ctx.lineTo(sp2.x, sp2.y);
      ctx.stroke();
      ctx.setLineDash([]);

      // Label for height
      ctx.font = '500 13px "JetBrains Mono", monospace';
      ctx.fillStyle = '#fde047';
      ctx.textAlign = 'center';
      const midHx = (sp1.x + sp2.x) / 2 + 12;
      const midHy = (sp1.y + sp2.y) / 2;
      ctx.fillText(`h = ${(calcResult.heights?.[0] || params.trapHeight).toFixed(1)}`, midHx, midHy);
    }

    // Draw Angles arcs
    if (showAngles && calcResult.angles && screenPoints.length >= 3) {
      ctx.font = '500 12px "JetBrains Mono", monospace';
      ctx.fillStyle = '#38bdf8';
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.7)';
      ctx.lineWidth = 1.5;

      // Arc for first angle
      const pCorner = screenPoints[0];
      const pNext = screenPoints[1];
      const pPrev = screenPoints[screenPoints.length - 1];
      const angNext = Math.atan2(pNext.y - pCorner.y, pNext.x - pCorner.x);
      const angPrev = Math.atan2(pPrev.y - pCorner.y, pPrev.x - pCorner.x);

      ctx.beginPath();
      ctx.arc(pCorner.x, pCorner.y, 22, angNext, angPrev, false);
      ctx.stroke();
    }

    // Draw Side Length Measurements
    if (showMeasurements) {
      ctx.font = '500 12px "JetBrains Mono", monospace';
      ctx.fillStyle = '#f1f5f9';
      for (let i = 0; i < screenPoints.length; i++) {
        const next = (i + 1) % screenPoints.length;
        const pA = screenPoints[i];
        const pB = screenPoints[next];
        const midX = (pA.x + pB.x) / 2;
        const midY = (pA.y + pB.y) / 2;

        const mathLen = Math.hypot(
          geo.points[next].x - geo.points[i].x,
          geo.points[next].y - geo.points[i].y
        );

        // Vector normal to edge
        const dx = pB.x - pA.x;
        const dy = pB.y - pA.y;
        const mag = Math.hypot(dx, dy);
        if (mag > 0) {
          const nx = -dy / mag;
          const ny = dx / mag;
          const textX = midX + nx * 14;
          const textY = midY + ny * 14;
          ctx.textAlign = 'center';
          ctx.fillText(`${mathLen.toFixed(1)}`, textX, textY);
        }
      }
    }

    // Draw Vertices and Caveat Labels (A, B, C...)
    screenPoints.forEach((p, idx) => {
      // Vertex chalk circle
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4.5, 0, 2 * Math.PI);
      ctx.fill();

      // Vertex label
      const label = geo.labels[idx] || String.fromCharCode(65 + idx);
      ctx.font = '600 22px "Caveat", cursive';
      ctx.fillStyle = '#fde047';

      // Offset label outward from polygon center
      const offsetX = p.x > width / 2 ? 10 : -16;
      const offsetY = p.y > height / 2 ? 18 : -10;
      ctx.textAlign = 'left';
      ctx.fillText(label, p.x + offsetX, p.y + offsetY);
    });
  }, [
    currentShape,
    params,
    showMeasurements,
    showAngles,
    showAltitudes,
    showCircumcircle,
    calcResult,
    canvasRef,
  ]);

  return (
    <div className="flex-1 flex flex-col lg:flex-row h-full overflow-hidden bg-[#17221b]">
      {/* Sidebar Controls & Calculations (Left Zone) */}
      <aside className="w-full lg:w-[420px] xl:w-[460px] flex flex-col border-r border-emerald-950/80 bg-[#151f18] overflow-y-auto p-4 shrink-0 shadow-lg">
        {/* Shape selector grid */}
        <div className="mb-4">
          <label className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2 block font-mono">
            Chọn Hình Học Phẳng:
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            {shapeList.map((shape) => (
              <button
                key={shape.id}
                onClick={() => setCurrentShape(shape.id)}
                className={`flex items-center gap-1.5 px-2 py-2 text-xs font-medium rounded border transition-all text-left cursor-pointer ${
                  currentShape === shape.id
                    ? 'bg-emerald-800/90 text-amber-300 border-emerald-500 shadow-sm'
                    : 'bg-[#1b2720] text-slate-300 border-emerald-950/60 hover:bg-[#203127] hover:text-white'
                }`}
              >
                <span className="text-sm font-mono text-amber-300">{shape.icon}</span>
                <span className="truncate">{shape.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Validation warning */}
        {!calcResult.isValid && (
          <div className="mb-4 p-3 bg-rose-950/40 border border-rose-800/80 rounded-md text-rose-200 text-xs flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-rose-300 mb-0.5">Lỗi Điều Kiện Hình Học</div>
              <div>{calcResult.errorMessage}</div>
            </div>
          </div>
        )}

        {/* Sliders & parameter inputs */}
        <div className="bg-[#1b2720] rounded-lg border border-emerald-950 p-3.5 mb-4 shadow-sm">
          <div className="flex items-center justify-between mb-3 border-b border-emerald-900/40 pb-2">
            <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider font-mono">
              Điều Chỉnh Kích Thước:
            </span>
            <button
              onClick={() => setParams(defaultParams)}
              title="Đặt lại thông số mặc định"
              className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Mặc định</span>
            </button>
          </div>

          <div className="space-y-3">
            {/* Triangle Scalene */}
            {currentShape === 'triangle_scalene' && (
              <>
                <ControlSlider
                  label="Cạnh a (BC)"
                  val={params.a}
                  min={1}
                  max={20}
                  step={0.5}
                  unit="cm"
                  onChange={(v) => updateParam('a', v)}
                />
                <ControlSlider
                  label="Cạnh b (CA)"
                  val={params.b}
                  min={1}
                  max={20}
                  step={0.5}
                  unit="cm"
                  onChange={(v) => updateParam('b', v)}
                />
                <ControlSlider
                  label="Cạnh c (AB)"
                  val={params.c}
                  min={1}
                  max={20}
                  step={0.5}
                  unit="cm"
                  onChange={(v) => updateParam('c', v)}
                />
              </>
            )}

            {/* Triangle Right */}
            {currentShape === 'triangle_right' && (
              <>
                <ControlSlider
                  label="Cạnh góc vuông a"
                  val={params.legA}
                  min={1}
                  max={20}
                  step={0.5}
                  unit="cm"
                  onChange={(v) => updateParam('legA', v)}
                />
                <ControlSlider
                  label="Cạnh góc vuông b"
                  val={params.legB}
                  min={1}
                  max={20}
                  step={0.5}
                  unit="cm"
                  onChange={(v) => updateParam('legB', v)}
                />
              </>
            )}

            {/* Square */}
            {currentShape === 'square' && (
              <ControlSlider
                label="Độ dài cạnh a"
                val={params.squareSide}
                min={1}
                max={20}
                step={0.5}
                unit="cm"
                onChange={(v) => updateParam('squareSide', v)}
              />
            )}

            {/* Rectangle */}
            {currentShape === 'rectangle' && (
              <>
                <ControlSlider
                  label="Chiều dài (a)"
                  val={params.rectWidth}
                  min={1}
                  max={20}
                  step={0.5}
                  unit="cm"
                  onChange={(v) => updateParam('rectWidth', v)}
                />
                <ControlSlider
                  label="Chiều rộng (b)"
                  val={params.rectHeight}
                  min={1}
                  max={20}
                  step={0.5}
                  unit="cm"
                  onChange={(v) => updateParam('rectHeight', v)}
                />
              </>
            )}

            {/* Parallelogram */}
            {currentShape === 'parallelogram' && (
              <>
                <ControlSlider
                  label="Cạnh đáy a"
                  val={params.paraA}
                  min={1}
                  max={20}
                  step={0.5}
                  unit="cm"
                  onChange={(v) => updateParam('paraA', v)}
                />
                <ControlSlider
                  label="Cạnh bên b"
                  val={params.paraB}
                  min={1}
                  max={20}
                  step={0.5}
                  unit="cm"
                  onChange={(v) => updateParam('paraB', v)}
                />
                <ControlSlider
                  label="Góc nhọn α"
                  val={params.paraAngle}
                  min={20}
                  max={160}
                  step={1}
                  unit="°"
                  onChange={(v) => updateParam('paraAngle', v)}
                />
              </>
            )}

            {/* Rhombus */}
            {currentShape === 'rhombus' && (
              <>
                <ControlSlider
                  label="Độ dài cạnh a"
                  val={params.rhombusSide}
                  min={1}
                  max={20}
                  step={0.5}
                  unit="cm"
                  onChange={(v) => updateParam('rhombusSide', v)}
                />
                <ControlSlider
                  label="Góc α"
                  val={params.rhombusAngle}
                  min={20}
                  max={160}
                  step={1}
                  unit="°"
                  onChange={(v) => updateParam('rhombusAngle', v)}
                />
              </>
            )}

            {/* Isosceles Trapezoid */}
            {currentShape === 'trapezoid_isosceles' && (
              <>
                <ControlSlider
                  label="Đáy lớn (a)"
                  val={params.trapBaseA}
                  min={2}
                  max={20}
                  step={0.5}
                  unit="cm"
                  onChange={(v) => updateParam('trapBaseA', v)}
                />
                <ControlSlider
                  label="Đáy nhỏ (b)"
                  val={params.trapBaseB}
                  min={1}
                  max={19}
                  step={0.5}
                  unit="cm"
                  onChange={(v) => updateParam('trapBaseB', v)}
                />
                <ControlSlider
                  label="Chiều cao (h)"
                  val={params.trapHeight}
                  min={1}
                  max={15}
                  step={0.5}
                  unit="cm"
                  onChange={(v) => updateParam('trapHeight', v)}
                />
              </>
            )}

            {/* Circle */}
            {currentShape === 'circle' && (
              <>
                <ControlSlider
                  label="Bán kính R"
                  val={params.circleRadius}
                  min={1}
                  max={15}
                  step={0.5}
                  unit="cm"
                  onChange={(v) => updateParam('circleRadius', v)}
                />
                <ControlSlider
                  label="Góc ở tâm / hình quạt"
                  val={params.sectorAngle}
                  min={30}
                  max={360}
                  step={15}
                  unit="°"
                  onChange={(v) => updateParam('sectorAngle', v)}
                />
              </>
            )}

            {/* Regular Polygon */}
            {currentShape === 'regular_polygon' && (
              <>
                <ControlSlider
                  label="Số cạnh (n)"
                  val={params.polygonSides}
                  min={3}
                  max={12}
                  step={1}
                  unit="cạnh"
                  onChange={(v) => updateParam('polygonSides', v)}
                />
                <ControlSlider
                  label="Bán kính ngoại tiếp R"
                  val={params.polygonRadius}
                  min={2}
                  max={15}
                  step={0.5}
                  unit="cm"
                  onChange={(v) => updateParam('polygonRadius', v)}
                />
              </>
            )}
          </div>
        </div>

        {/* Display Toggles */}
        <div className="bg-[#1b2720] rounded-lg border border-emerald-950 p-3 mb-4 shadow-sm">
          <div className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-2 font-mono">
            Tùy Chọn Hiển Thị:
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <label className="flex items-center gap-2 cursor-pointer select-none text-slate-300 hover:text-white">
              <input
                type="checkbox"
                checked={showMeasurements}
                onChange={(e) => setShowMeasurements(e.target.checked)}
                className="rounded border-emerald-700 bg-emerald-950 text-emerald-500 focus:ring-0 cursor-pointer"
              />
              <span>Hiện số đo cạnh</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer select-none text-slate-300 hover:text-white">
              <input
                type="checkbox"
                checked={showAngles}
                onChange={(e) => setShowAngles(e.target.checked)}
                className="rounded border-emerald-700 bg-emerald-950 text-emerald-500 focus:ring-0 cursor-pointer"
              />
              <span>Hiện góc</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer select-none text-slate-300 hover:text-white">
              <input
                type="checkbox"
                checked={showAltitudes}
                onChange={(e) => setShowAltitudes(e.target.checked)}
                className="rounded border-emerald-700 bg-emerald-950 text-emerald-500 focus:ring-0 cursor-pointer"
              />
              <span>Hiện đường cao</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer select-none text-slate-300 hover:text-white">
              <input
                type="checkbox"
                checked={showCircumcircle}
                onChange={(e) => setShowCircumcircle(e.target.checked)}
                className="rounded border-emerald-700 bg-emerald-950 text-emerald-500 focus:ring-0 cursor-pointer"
              />
              <span>Đường tròn ngoại tiếp</span>
            </label>
          </div>
        </div>

        {/* Real-time Mathematical Calculation Cards */}
        <div className="flex-1">
          <div className="text-xs font-semibold text-amber-300 uppercase tracking-wider mb-2.5 font-mono flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Công Thức &amp; Kết Quả Tính Toán:</span>
          </div>

          <div className="space-y-2">
            {calcResult.formulas.map((item, idx) => (
              <div
                key={idx}
                className="p-2.5 bg-[#1a261f] border border-emerald-900/60 rounded-md hover:border-emerald-700/60 transition-colors"
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-medium text-emerald-300">{item.label}</span>
                  <span className="font-mono-math font-semibold text-amber-300 text-sm">
                    {item.value}
                  </span>
                </div>
                <div className="text-[11px] font-mono-math text-slate-400 bg-[#141d17] px-2 py-0.5 rounded border border-emerald-950">
                  {item.formula}
                </div>
                {item.explanation && (
                  <div className="text-[10px] text-emerald-400/80 mt-1 italic">
                    💡 {item.explanation}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* Stage: 2D Blackboard Canvas (Right Zone) */}
      <main
        ref={containerRef}
        className="flex-1 relative flex items-center justify-center p-3 sm:p-6 bg-[#141c17] overflow-hidden chalkboard-stage"
      >
        <div className="w-full h-full relative rounded-xl border-4 border-[#2d3a31] shadow-2xl overflow-hidden bg-[#16221b]">
          <canvas
            ref={canvasRef}
            className="w-full h-full block cursor-crosshair touch-none"
          />

          {/* Quick HUD legend on canvas */}
          <div className="absolute top-3 left-3 bg-[#131d16]/85 backdrop-blur-sm border border-emerald-900/60 rounded px-2.5 py-1 text-[11px] text-slate-300 font-mono flex items-center gap-3 select-none pointer-events-none">
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block"></span>
              Nét hình
            </span>
            <span className="flex items-center gap-1 text-amber-300">
              <span className="w-2 h-2 rounded-full bg-amber-400 inline-block"></span>
              Đỉnh &amp; Đường cao
            </span>
            <span className="flex items-center gap-1 text-sky-300">
              <span className="w-2 h-2 rounded-full bg-sky-400 inline-block"></span>
              Góc &amp; Số đo
            </span>
          </div>

          <div className="absolute bottom-3 right-3 text-emerald-500/60 font-caveat text-base select-none pointer-events-none">
            Phòng Thí Nghiệm Hình Học 2D
          </div>
        </div>
      </main>
    </div>
  );
};

// Reusable Slider Input Component
interface ControlSliderProps {
  label: string;
  val: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (v: number) => void;
}

const ControlSlider: React.FC<ControlSliderProps> = ({
  label,
  val,
  min,
  max,
  step,
  unit,
  onChange,
}) => {
  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="text-slate-300 font-medium">{label}</span>
        <div className="flex items-center gap-1 font-mono-math">
          <input
            type="number"
            min={min}
            max={max}
            step={step}
            value={val}
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-14 px-1.5 py-0.5 text-right text-xs bg-[#141d17] border border-emerald-900 rounded text-amber-300 focus:outline-none focus:border-amber-400 font-mono-math"
          />
          <span className="text-slate-400 text-[11px]">{unit}</span>
        </div>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={val}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-amber-400 h-1.5 bg-[#141d17] rounded-lg cursor-pointer"
      />
    </div>
  );
};
