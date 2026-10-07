import React, { useState, useEffect, useRef } from 'react';
import { Shape3DType, Shape3DParams } from '../types/geometry';
import { calculate3DShape, get3DModel, rotateVec3, Vec3, Vec2 } from '../utils/math3d';
import { RotateCcw, Play, Pause, Layers, CheckCircle2 } from 'lucide-react';

interface Panel3DProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
}

const default3DParams: Shape3DParams = {
  cubeA: 5,
  cuboidA: 6,
  cuboidB: 4,
  cuboidC: 5,
  prismA: 5,
  prismH: 7,
  pyramidA: 6,
  pyramidH: 7,
  cylinderR: 3.5,
  cylinderH: 7,
  coneR: 4,
  coneH: 7,
  sphereR: 4.5,
};

const shape3DList: { id: Shape3DType; label: string; icon: string }[] = [
  { id: 'cube', label: 'Hình lập phương', icon: '🧊' },
  { id: 'cuboid', label: 'Hình hộp chữ nhật', icon: '📦' },
  { id: 'triangular_prism', label: 'Lăng trụ đứng tam giác', icon: '⛺' },
  { id: 'square_pyramid', label: 'Hình chóp tứ giác đều', icon: '▲' },
  { id: 'cylinder', label: 'Hình trụ', icon: '🥫' },
  { id: 'cone', label: 'Hình nón', icon: '🍦' },
  { id: 'sphere', label: 'Hình cầu', icon: '⚽' },
];

export const Panel3D: React.FC<Panel3DProps> = ({ canvasRef }) => {
  const [currentShape, setCurrentShape] = useState<Shape3DType>('cube');
  const [params, setParams] = useState<Shape3DParams>(default3DParams);
  const [autoRotate, setAutoRotate] = useState(true);
  const [renderMode, setRenderMode] = useState<'shaded' | 'wireframe'>('shaded');
  const [showLabels, setShowLabels] = useState(true);

  // Rotation angles in radians
  const rotRef = useRef<{ x: number; y: number }>({ x: 0.45, y: -0.65 });
  const isDraggingRef = useRef(false);
  const lastMousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const animFrameIdRef = useRef<number | null>(null);

  const updateParam = (key: keyof Shape3DParams, val: number) => {
    setParams((prev) => ({ ...prev, [key]: Number(val) }));
  };

  const calcResult = calculate3DShape(currentShape, params);

  const resetView = () => {
    rotRef.current = { x: 0.45, y: -0.65 };
  };

  // Continuous animation and render loop
  useEffect(() => {
    let active = true;

    const render = () => {
      if (!active) return;

      if (autoRotate && !isDraggingRef.current) {
        rotRef.current.y += 0.008;
      }

      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          drawScene(ctx, canvas);
        }
      }

      animFrameIdRef.current = requestAnimationFrame(render);
    };

    animFrameIdRef.current = requestAnimationFrame(render);

    return () => {
      active = false;
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
    };
  }, [currentShape, params, autoRotate, renderMode, showLabels]);

  const drawScene = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const width = rect.width;
    const height = rect.height;

    // Resize if needed
    if (canvas.width !== Math.floor(width * dpr) || canvas.height !== Math.floor(height * dpr)) {
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
    }

    ctx.save();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Chalkboard background
    ctx.fillStyle = '#16221b';
    ctx.fillRect(0, 0, width, height);

    // Subtle chalkboard grid
    ctx.strokeStyle = 'rgba(74, 222, 128, 0.04)';
    ctx.lineWidth = 1;
    const step = 32;
    for (let x = 0; x < width; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    const model = get3DModel(currentShape, params);
    const { x: rotX, y: rotY } = rotRef.current;

    // Camera and projection settings
    const camDist = 4.2;
    const zoom = Math.min(width, height) * 0.42;
    const centerX = width / 2;
    const centerY = height / 2;

    // 1. Rotate all vertices
    const rotatedVertices = model.vertices.map((v) => rotateVec3(v, rotX, rotY, 0));

    // 2. Project vertices to 2D
    const projected: Vec2[] = rotatedVertices.map((v) => {
      const zEff = Math.max(0.1, v.z + camDist);
      const fovScale = camDist / zEff;
      return {
        x: centerX + v.x * fovScale * zoom,
        y: centerY - v.y * fovScale * zoom, // Invert Y
      };
    });

    // 3. Lighting setup (Directional light vector normalized)
    const lightDir: Vec3 = { x: 0.55, y: 0.7, z: 0.45 };
    const lightMag = Math.hypot(lightDir.x, lightDir.y, lightDir.z);
    lightDir.x /= lightMag;
    lightDir.y /= lightMag;
    lightDir.z /= lightMag;

    // 4. Painter's algorithm: sort faces by average Z depth
    interface FaceRenderItem {
      indices: number[];
      avgZ: number;
      normal: Vec3;
      intensity: number;
      baseColor: [number, number, number];
    }

    const faceItems: FaceRenderItem[] = [];

    model.faces.forEach((f) => {
      if (f.indices.length < 3) return;

      // Compute average Z depth
      let sumZ = 0;
      f.indices.forEach((idx) => {
        sumZ += rotatedVertices[idx].z;
      });
      const avgZ = sumZ / f.indices.length;

      // Surface normal vector calculation
      const p0 = rotatedVertices[f.indices[0]];
      const p1 = rotatedVertices[f.indices[1]];
      const p2 = rotatedVertices[f.indices[2]];

      const v1x = p1.x - p0.x;
      const v1y = p1.y - p0.y;
      const v1z = p1.z - p0.z;

      const v2x = p2.x - p0.x;
      const v2y = p2.y - p0.y;
      const v2z = p2.z - p0.z;

      // Cross product
      const nx = v1y * v2z - v1z * v2y;
      const ny = v1z * v2x - v1x * v2z;
      const nz = v1x * v2y - v1y * v2x;
      const nMag = Math.hypot(nx, ny, nz) || 1;

      const norm: Vec3 = { x: nx / nMag, y: ny / nMag, z: nz / nMag };

      // Diffuse Lambertian reflection with ambient term
      const dot = norm.x * lightDir.x + norm.y * lightDir.y + norm.z * lightDir.z;
      const intensity = Math.max(0.18, Math.min(1.0, 0.4 + 0.6 * Math.max(0, dot)));

      faceItems.push({
        indices: f.indices,
        avgZ,
        normal: norm,
        intensity,
        baseColor: f.baseColor,
      });
    });

    // Sort furthest away (lowest Z) to closest (highest Z)
    faceItems.sort((a, b) => a.avgZ - b.avgZ);

    // 5. Render Faces with Painter's Algorithm & Chalk Aesthetics
    faceItems.forEach((item) => {
      if (item.indices.length < 3) return;

      ctx.beginPath();
      const pFirst = projected[item.indices[0]];
      ctx.moveTo(pFirst.x, pFirst.y);
      for (let i = 1; i < item.indices.length; i++) {
        const pt = projected[item.indices[i]];
        ctx.lineTo(pt.x, pt.y);
      }
      ctx.closePath();

      if (renderMode === 'shaded') {
        // Face lighting color
        const [r, g, b] = item.baseColor;
        const litR = Math.round(r * item.intensity);
        const litG = Math.round(g * item.intensity);
        const litB = Math.round(b * item.intensity);

        // Semi-transparent chalkboard face shader
        ctx.fillStyle = `rgba(${litR}, ${litG}, ${litB}, 0.55)`;
        ctx.fill();

        // Edge stroke
        ctx.strokeStyle = `rgba(${Math.min(255, litR + 40)}, ${Math.min(255, litG + 40)}, ${Math.min(255, litB + 40)}, 0.85)`;
        ctx.lineWidth = 1.6;
        ctx.stroke();
      } else {
        // Wireframe mode
        ctx.fillStyle = 'rgba(20, 28, 23, 0.4)';
        ctx.fill();
        ctx.strokeStyle = '#4ade80';
        ctx.lineWidth = 1.8;
        ctx.stroke();
      }
    });

    // 6. Draw Vertex Chalk Glow Markers and Labels (A, B, C, S...)
    if (showLabels && model.labels) {
      model.labels.forEach((lbl) => {
        const pt = projected[lbl.index];
        if (!pt) return;

        // Chalk point dot
        ctx.fillStyle = '#fde047';
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 4, 0, 2 * Math.PI);
        ctx.fill();

        // Label text in Caveat font
        ctx.font = '600 20px "Caveat", cursive';
        ctx.fillStyle = '#fde047';
        ctx.fillText(lbl.text, pt.x + 8, pt.y - 6);
      });
    }

    ctx.restore();
  };

  // Mouse / Touch Drag handlers for 3D rotation
  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - lastMousePosRef.current.x;
    const dy = e.clientY - lastMousePosRef.current.y;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };

    // Update rotation angles
    rotRef.current.y += dx * 0.009;
    rotRef.current.x += dy * 0.009;
    // Clamp X rotation to avoid flipping upside down
    rotRef.current.x = Math.max(-1.4, Math.min(1.4, rotRef.current.x));
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    isDraggingRef.current = false;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // Ignored
    }
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row h-full overflow-hidden bg-[#17221b]">
      {/* Sidebar Controls & 3D Formulas (Left Zone) */}
      <aside className="w-full lg:w-[420px] xl:w-[460px] flex flex-col border-r border-emerald-950/80 bg-[#151f18] overflow-y-auto p-4 shrink-0 shadow-lg">
        {/* Shape selector */}
        <div className="mb-4">
          <label className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2 block font-mono">
            Chọn Khối Hình Học Không Gian:
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            {shape3DList.map((shape) => (
              <button
                key={shape.id}
                onClick={() => setCurrentShape(shape.id)}
                className={`flex items-center gap-2 px-2.5 py-2 text-xs font-medium rounded border transition-all text-left cursor-pointer ${
                  currentShape === shape.id
                    ? 'bg-emerald-800/90 text-sky-300 border-sky-500 shadow-sm'
                    : 'bg-[#1b2720] text-slate-300 border-emerald-950/60 hover:bg-[#203127] hover:text-white'
                }`}
              >
                <span className="text-sm">{shape.icon}</span>
                <span className="truncate">{shape.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Dimension sliders */}
        <div className="bg-[#1b2720] rounded-lg border border-emerald-950 p-3.5 mb-4 shadow-sm">
          <div className="flex items-center justify-between mb-3 border-b border-emerald-900/40 pb-2">
            <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider font-mono">
              Thông Số Khối 3D:
            </span>
            <button
              onClick={() => setParams(default3DParams)}
              title="Đặt lại thông số mặc định"
              className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Mặc định</span>
            </button>
          </div>

          <div className="space-y-3">
            {/* Cube */}
            {currentShape === 'cube' && (
              <ControlSlider3D
                label="Cạnh hình lập phương (a)"
                val={params.cubeA}
                min={1}
                max={15}
                step={0.5}
                unit="cm"
                onChange={(v) => updateParam('cubeA', v)}
              />
            )}

            {/* Cuboid */}
            {currentShape === 'cuboid' && (
              <>
                <ControlSlider3D
                  label="Chiều dài (a)"
                  val={params.cuboidA}
                  min={1}
                  max={15}
                  step={0.5}
                  unit="cm"
                  onChange={(v) => updateParam('cuboidA', v)}
                />
                <ControlSlider3D
                  label="Chiều rộng (b)"
                  val={params.cuboidB}
                  min={1}
                  max={15}
                  step={0.5}
                  unit="cm"
                  onChange={(v) => updateParam('cuboidB', v)}
                />
                <ControlSlider3D
                  label="Chiều cao (c)"
                  val={params.cuboidC}
                  min={1}
                  max={15}
                  step={0.5}
                  unit="cm"
                  onChange={(v) => updateParam('cuboidC', v)}
                />
              </>
            )}

            {/* Triangular Prism */}
            {currentShape === 'triangular_prism' && (
              <>
                <ControlSlider3D
                  label="Cạnh đáy tam giác (a)"
                  val={params.prismA}
                  min={1}
                  max={15}
                  step={0.5}
                  unit="cm"
                  onChange={(v) => updateParam('prismA', v)}
                />
                <ControlSlider3D
                  label="Chiều cao lăng trụ (h)"
                  val={params.prismH}
                  min={1}
                  max={15}
                  step={0.5}
                  unit="cm"
                  onChange={(v) => updateParam('prismH', v)}
                />
              </>
            )}

            {/* Square Pyramid */}
            {currentShape === 'square_pyramid' && (
              <>
                <ControlSlider3D
                  label="Cạnh đáy hình vuông (a)"
                  val={params.pyramidA}
                  min={1}
                  max={15}
                  step={0.5}
                  unit="cm"
                  onChange={(v) => updateParam('pyramidA', v)}
                />
                <ControlSlider3D
                  label="Chiều cao chóp (h)"
                  val={params.pyramidH}
                  min={1}
                  max={15}
                  step={0.5}
                  unit="cm"
                  onChange={(v) => updateParam('pyramidH', v)}
                />
              </>
            )}

            {/* Cylinder */}
            {currentShape === 'cylinder' && (
              <>
                <ControlSlider3D
                  label="Bán kính đáy (r)"
                  val={params.cylinderR}
                  min={1}
                  max={12}
                  step={0.5}
                  unit="cm"
                  onChange={(v) => updateParam('cylinderR', v)}
                />
                <ControlSlider3D
                  label="Chiều cao trụ (h)"
                  val={params.cylinderH}
                  min={1}
                  max={15}
                  step={0.5}
                  unit="cm"
                  onChange={(v) => updateParam('cylinderH', v)}
                />
              </>
            )}

            {/* Cone */}
            {currentShape === 'cone' && (
              <>
                <ControlSlider3D
                  label="Bán kính đáy (r)"
                  val={params.coneR}
                  min={1}
                  max={12}
                  step={0.5}
                  unit="cm"
                  onChange={(v) => updateParam('coneR', v)}
                />
                <ControlSlider3D
                  label="Chiều cao nón (h)"
                  val={params.coneH}
                  min={1}
                  max={15}
                  step={0.5}
                  unit="cm"
                  onChange={(v) => updateParam('coneH', v)}
                />
              </>
            )}

            {/* Sphere */}
            {currentShape === 'sphere' && (
              <ControlSlider3D
                label="Bán kính mặt cầu (R)"
                val={params.sphereR}
                min={1}
                max={10}
                step={0.5}
                unit="cm"
                onChange={(v) => updateParam('sphereR', v)}
              />
            )}
          </div>
        </div>

        {/* View & Lighting controls */}
        <div className="bg-[#1b2720] rounded-lg border border-emerald-950 p-3 mb-4 shadow-sm">
          <div className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-2 font-mono">
            Góc Nhìn &amp; Chiếu Sáng 3D:
          </div>
          <div className="flex flex-wrap gap-2 text-xs mb-2.5">
            <button
              onClick={() => setAutoRotate(!autoRotate)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded border transition-colors cursor-pointer ${
                autoRotate
                  ? 'bg-emerald-800 text-sky-200 border-emerald-600'
                  : 'bg-[#141d17] text-slate-300 border-emerald-900'
              }`}
            >
              {autoRotate ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{autoRotate ? 'Dừng tự xoay' : 'Tự xoay (Auto-rotate)'}</span>
            </button>
            <button
              onClick={resetView}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#141d17] text-slate-300 border border-emerald-900 hover:text-white cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Đặt lại góc nhìn</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => setRenderMode(renderMode === 'shaded' ? 'wireframe' : 'shaded')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-[#141d17] text-slate-300 border border-emerald-900 hover:text-white cursor-pointer"
            >
              <Layers className="w-3.5 h-3.5 text-sky-400" />
              <span>{renderMode === 'shaded' ? 'Mặt bóng chiếu sáng' : 'Khung dây (Wireframe)'}</span>
            </button>
            <label className="flex items-center gap-2 cursor-pointer select-none text-slate-300 hover:text-white px-1">
              <input
                type="checkbox"
                checked={showLabels}
                onChange={(e) => setShowLabels(e.target.checked)}
                className="rounded border-emerald-700 bg-emerald-950 text-emerald-500 focus:ring-0 cursor-pointer"
              />
              <span>Hiện tên đỉnh</span>
            </label>
          </div>
        </div>

        {/* Real-time 3D Math Calculations */}
        <div className="flex-1">
          <div className="text-xs font-semibold text-sky-300 uppercase tracking-wider mb-2.5 font-mono flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Công Thức &amp; Kết Quả Khối 3D:</span>
          </div>

          <div className="space-y-2">
            {calcResult.formulas.map((item, idx) => (
              <div
                key={idx}
                className="p-2.5 bg-[#1a261f] border border-emerald-900/60 rounded-md hover:border-emerald-700/60 transition-colors"
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-medium text-emerald-300">{item.label}</span>
                  <span className="font-mono-math font-semibold text-sky-300 text-sm">
                    {item.value}
                  </span>
                </div>
                <div className="text-[11px] font-mono-math text-slate-400 bg-[#141d17] px-2 py-0.5 rounded border border-emerald-950">
                  {item.formula}
                </div>
                {item.step && (
                  <div className="text-[10px] text-sky-400/80 mt-1 italic">
                    💡 {item.step}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* 3D Canvas Stage (Right Zone) */}
      <main className="flex-1 relative flex items-center justify-center p-3 sm:p-6 bg-[#141c17] overflow-hidden chalkboard-stage">
        <div className="w-full h-full relative rounded-xl border-4 border-[#2d3a31] shadow-2xl overflow-hidden bg-[#16221b]">
          <canvas
            ref={canvasRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            className="w-full h-full block cursor-grab active:cursor-grabbing touch-none"
          />

          {/* Interactive 3D guide overlay */}
          <div className="absolute top-3 left-3 bg-[#131d16]/85 backdrop-blur-sm border border-emerald-900/60 rounded px-2.5 py-1 text-[11px] text-slate-300 font-mono flex items-center gap-2.5 select-none pointer-events-none">
            <span>🖱️ Kéo chuột / chạm màn hình để xoay không gian 360°</span>
          </div>

          <div className="absolute bottom-3 right-3 text-emerald-500/60 font-caveat text-base select-none pointer-events-none">
            Không Gian 3D · Painter's Algorithm &amp; Shading
          </div>
        </div>
      </main>
    </div>
  );
};

// Reusable Slider Component
interface ControlSlider3DProps {
  label: string;
  val: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (v: number) => void;
}

const ControlSlider3D: React.FC<ControlSlider3DProps> = ({
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
            className="w-14 px-1.5 py-0.5 text-right text-xs bg-[#141d17] border border-emerald-900 rounded text-sky-300 focus:outline-none focus:border-sky-400 font-mono-math"
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
        className="w-full accent-sky-400 h-1.5 bg-[#141d17] rounded-lg cursor-pointer"
      />
    </div>
  );
};
