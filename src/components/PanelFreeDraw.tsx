import React, { useState, useEffect, useRef } from 'react';
import {
  FreeDrawTool,
  Point2D,
  GeoObject,
  SegmentObj,
  RayObj,
  LineObj,
  CircleObj,
  PolygonObj,
  AngleObj,
} from '../types/geometry';
import {
  MousePointer,
  Dot,
  Minus,
  MoveRight,
  Maximize2,
  Circle as CircleIcon,
  Pentagon,
  CornerDownRight,
  Trash2,
  Undo2,
  Grid,
  Magnet,
  Eye,
  Edit2,
} from 'lucide-react';

interface PanelFreeDrawProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
}

export const PanelFreeDraw: React.FC<PanelFreeDrawProps> = ({ canvasRef }) => {
  const [currentTool, setCurrentTool] = useState<FreeDrawTool>('select');
  const [points, setPoints] = useState<Point2D[]>([
    { id: 'p_1', name: 'A', x: 200, y: 350 },
    { id: 'p_2', name: 'B', x: 450, y: 350 },
    { id: 'p_3', name: 'C', x: 325, y: 180 },
  ]);
  const [objects, setObjects] = useState<GeoObject[]>([
    { id: 'poly_1', type: 'polygon', pointIds: ['p_1', 'p_2', 'p_3'], color: '#4ade80' },
    { id: 'ang_1', type: 'angle', p1Id: 'p_1', vertexId: 'p_3', p2Id: 'p_2', color: '#fde047' },
  ]);

  // Settings
  const [snapToGrid, setSnapToGrid] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [showMeasurements, setShowMeasurements] = useState(true);

  // History for Undo
  const historyRef = useRef<{ points: Point2D[]; objects: GeoObject[] }[]>([]);

  // Interaction State
  const [activePointId, setActivePointId] = useState<string | null>(null);
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);
  const [draggedPointId, setDraggedPointId] = useState<string | null>(null);

  // Construction multi-step buffer (e.g. polygon vertices being placed, angle points)
  const [stepPointIds, setStepPointIds] = useState<string[]>([]);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);

  const saveHistory = () => {
    historyRef.current.push({
      points: JSON.parse(JSON.stringify(points)),
      objects: JSON.parse(JSON.stringify(objects)),
    });
    if (historyRef.current.length > 30) historyRef.current.shift();
  };

  const handleUndo = () => {
    if (historyRef.current.length === 0) return;
    const prev = historyRef.current.pop()!;
    setPoints(prev.points);
    setObjects(prev.objects);
    setStepPointIds([]);
    setSelectedObjectId(null);
  };

  const handleClearAll = () => {
    saveHistory();
    setPoints([]);
    setObjects([]);
    setStepPointIds([]);
    setSelectedObjectId(null);
  };

  // Generate next automatic label: A, B, C ... Z, A1, B1 ...
  const getNextLabel = (currentPoints: Point2D[]): string => {
    const usedNames = new Set(currentPoints.map((p) => p.name));
    for (let i = 0; i < 26; i++) {
      const char = String.fromCharCode(65 + i);
      if (!usedNames.has(char)) return char;
    }
    for (let num = 1; num <= 50; num++) {
      for (let i = 0; i < 26; i++) {
        const name = `${String.fromCharCode(65 + i)}${num}`;
        if (!usedNames.has(name)) return name;
      }
    }
    return `P${currentPoints.length + 1}`;
  };

  // Convert raw coords with optional snap to grid
  const getCanvasCoords = (clientX: number, clientY: number): { x: number; y: number } => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    let x = clientX - rect.x;
    let y = clientY - rect.y;

    if (snapToGrid) {
      const gridSize = 25;
      x = Math.round(x / gridSize) * gridSize;
      y = Math.round(y / gridSize) * gridSize;
    }
    return { x, y };
  };

  // Find existing point near coordinate (hit tolerance ~12px)
  const findPointNear = (x: number, y: number, tol: number = 14): Point2D | null => {
    for (const p of points) {
      if (Math.hypot(p.x - x, p.y - y) <= tol) {
        return p;
      }
    }
    return null;
  };

  // Canvas Click / Mouse Interactions
  const handlePointerDown = (e: React.PointerEvent) => {
    const { x, y } = getCanvasCoords(e.clientX, e.clientY);
    const hitPoint = findPointNear(x, y);

    if (currentTool === 'select') {
      if (hitPoint) {
        setDraggedPointId(hitPoint.id);
        setActivePointId(hitPoint.id);
      } else {
        setActivePointId(null);
      }
      return;
    }

    if (currentTool === 'delete') {
      if (hitPoint) {
        saveHistory();
        // Remove point and all objects connected to this point
        setPoints((prev) => prev.filter((p) => p.id !== hitPoint.id));
        setObjects((prev) =>
          prev.filter((obj) => {
            if (obj.type === 'segment' || obj.type === 'ray' || obj.type === 'line') {
              return obj.p1Id !== hitPoint.id && obj.p2Id !== hitPoint.id;
            }
            if (obj.type === 'circle') {
              return obj.centerId !== hitPoint.id && obj.radiusPointId !== hitPoint.id;
            }
            if (obj.type === 'polygon') {
              return !obj.pointIds.includes(hitPoint.id);
            }
            if (obj.type === 'angle') {
              return (
                obj.p1Id !== hitPoint.id &&
                obj.vertexId !== hitPoint.id &&
                obj.p2Id !== hitPoint.id
              );
            }
            return true;
          })
        );
      }
      return;
    }

    if (currentTool === 'point') {
      saveHistory();
      const newPt: Point2D = {
        id: `p_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        name: getNextLabel(points),
        x,
        y,
      };
      setPoints((prev) => [...prev, newPt]);
      return;
    }

    // For tools that connect points: Segment, Ray, Line, Circle, Polygon, Angle
    // If no existing point hit, create one on the fly!
    let targetPoint = hitPoint;
    if (!targetPoint) {
      saveHistory();
      targetPoint = {
        id: `p_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        name: getNextLabel(points),
        x,
        y,
      };
      setPoints((prev) => [...prev, targetPoint!]);
    }

    const currentStep = [...stepPointIds, targetPoint.id];

    if (currentTool === 'segment') {
      if (currentStep.length === 2) {
        if (currentStep[0] !== currentStep[1]) {
          saveHistory();
          const newSeg: SegmentObj = {
            id: `seg_${Date.now()}`,
            type: 'segment',
            p1Id: currentStep[0],
            p2Id: currentStep[1],
            color: '#38bdf8',
          };
          setObjects((prev) => [...prev, newSeg]);
        }
        setStepPointIds([]);
      } else {
        setStepPointIds(currentStep);
      }
    } else if (currentTool === 'ray') {
      if (currentStep.length === 2) {
        if (currentStep[0] !== currentStep[1]) {
          saveHistory();
          const newRay: RayObj = {
            id: `ray_${Date.now()}`,
            type: 'ray',
            p1Id: currentStep[0],
            p2Id: currentStep[1],
            color: '#fb7185',
          };
          setObjects((prev) => [...prev, newRay]);
        }
        setStepPointIds([]);
      } else {
        setStepPointIds(currentStep);
      }
    } else if (currentTool === 'line') {
      if (currentStep.length === 2) {
        if (currentStep[0] !== currentStep[1]) {
          saveHistory();
          const newLine: LineObj = {
            id: `line_${Date.now()}`,
            type: 'line',
            p1Id: currentStep[0],
            p2Id: currentStep[1],
            color: '#fde047',
          };
          setObjects((prev) => [...prev, newLine]);
        }
        setStepPointIds([]);
      } else {
        setStepPointIds(currentStep);
      }
    } else if (currentTool === 'circle') {
      if (currentStep.length === 2) {
        if (currentStep[0] !== currentStep[1]) {
          saveHistory();
          const newCircle: CircleObj = {
            id: `circle_${Date.now()}`,
            type: 'circle',
            centerId: currentStep[0],
            radiusPointId: currentStep[1],
            color: '#4ade80',
          };
          setObjects((prev) => [...prev, newCircle]);
        }
        setStepPointIds([]);
      } else {
        setStepPointIds(currentStep);
      }
    } else if (currentTool === 'polygon') {
      // Check if clicking back on first point to close polygon
      if (currentStep.length > 2 && targetPoint.id === currentStep[0]) {
        saveHistory();
        const polyPointIds = currentStep.slice(0, currentStep.length - 1);
        const newPoly: PolygonObj = {
          id: `poly_${Date.now()}`,
          type: 'polygon',
          pointIds: polyPointIds,
          color: '#38bdf8',
        };
        setObjects((prev) => [...prev, newPoly]);
        setStepPointIds([]);
      } else {
        setStepPointIds(currentStep);
      }
    } else if (currentTool === 'angle') {
      if (currentStep.length === 3) {
        saveHistory();
        const newAngle: AngleObj = {
          id: `angle_${Date.now()}`,
          type: 'angle',
          p1Id: currentStep[0],
          vertexId: currentStep[1],
          p2Id: currentStep[2],
          color: '#fde047',
        };
        setObjects((prev) => [...prev, newAngle]);
        setStepPointIds([]);
      } else {
        setStepPointIds(currentStep);
      }
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    const coords = getCanvasCoords(e.clientX, e.clientY);
    setMousePos(coords);

    if (draggedPointId && currentTool === 'select') {
      setPoints((prev) =>
        prev.map((p) => {
          if (p.id === draggedPointId) {
            return { ...p, x: coords.x, y: coords.y };
          }
          return p;
        })
      );
    }
  };

  const handlePointerUp = () => {
    setDraggedPointId(null);
  };

  // Render Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const width = rect.width;
    const height = rect.height;

    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx.scale(dpr, dpr);

    // Blackboard background
    ctx.fillStyle = '#16221b';
    ctx.fillRect(0, 0, width, height);

    // Chalk grid
    if (showGrid) {
      ctx.strokeStyle = 'rgba(74, 222, 128, 0.05)';
      ctx.lineWidth = 1;
      const step = 25;
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
    }

    const pointMap = new Map<string, Point2D>();
    points.forEach((p) => pointMap.set(p.id, p));

    // 1. Draw Polygons
    objects.forEach((obj) => {
      if (obj.type === 'polygon') {
        const polyPoints = obj.pointIds.map((id) => pointMap.get(id)).filter(Boolean) as Point2D[];
        if (polyPoints.length >= 3) {
          ctx.beginPath();
          ctx.moveTo(polyPoints[0].x, polyPoints[0].y);
          for (let i = 1; i < polyPoints.length; i++) {
            ctx.lineTo(polyPoints[i].x, polyPoints[i].y);
          }
          ctx.closePath();
          ctx.fillStyle = 'rgba(74, 222, 128, 0.08)';
          ctx.fill();
          ctx.strokeStyle = obj.color || '#4ade80';
          ctx.lineWidth = 2.4;
          ctx.stroke();
        }
      }
    });

    // 2. Draw Circles
    objects.forEach((obj) => {
      if (obj.type === 'circle') {
        const center = pointMap.get(obj.centerId);
        if (!center) return;
        let r = 0;
        if (obj.radiusPointId) {
          const rPt = pointMap.get(obj.radiusPointId);
          if (rPt) r = Math.hypot(rPt.x - center.x, rPt.y - center.y);
        } else if (obj.radiusValue) {
          r = obj.radiusValue * 25; // scaled
        }
        if (r > 0) {
          ctx.beginPath();
          ctx.arc(center.x, center.y, r, 0, 2 * Math.PI);
          ctx.fillStyle = 'rgba(56, 189, 248, 0.05)';
          ctx.fill();
          ctx.strokeStyle = obj.color || '#38bdf8';
          ctx.lineWidth = 2.2;
          ctx.stroke();

          if (showMeasurements) {
            ctx.font = '500 12px "JetBrains Mono", monospace';
            ctx.fillStyle = '#38bdf8';
            ctx.fillText(`R = ${(r / 25).toFixed(1)} cm`, center.x + r / 2, center.y - 8);
          }
        }
      }
    });

    // 3. Draw Lines & Rays & Segments
    objects.forEach((obj) => {
      if (obj.type === 'segment') {
        const p1 = pointMap.get(obj.p1Id);
        const p2 = pointMap.get(obj.p2Id);
        if (p1 && p2) {
          ctx.strokeStyle = obj.color || '#fde047';
          ctx.lineWidth = 2.4;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();

          if (showMeasurements) {
            const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
            const midX = (p1.x + p2.x) / 2;
            const midY = (p1.y + p2.y) / 2;
            ctx.font = '500 12px "JetBrains Mono", monospace';
            ctx.fillStyle = '#fde047';
            ctx.fillText(`${(dist / 25).toFixed(1)} cm`, midX + 6, midY - 6);
          }
        }
      } else if (obj.type === 'ray') {
        const p1 = pointMap.get(obj.p1Id); // origin
        const p2 = pointMap.get(obj.p2Id);
        if (p1 && p2) {
          const dx = p2.x - p1.x;
          const dy = p2.y - p1.y;
          const len = Math.hypot(dx, dy);
          if (len > 0) {
            const extLen = 2000;
            ctx.strokeStyle = obj.color || '#fb7185';
            ctx.lineWidth = 2.2;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p1.x + (dx / len) * extLen, p1.y + (dy / len) * extLen);
            ctx.stroke();
          }
        }
      } else if (obj.type === 'line') {
        const p1 = pointMap.get(obj.p1Id);
        const p2 = pointMap.get(obj.p2Id);
        if (p1 && p2) {
          const dx = p2.x - p1.x;
          const dy = p2.y - p1.y;
          const len = Math.hypot(dx, dy);
          if (len > 0) {
            const extLen = 2000;
            ctx.strokeStyle = obj.color || '#fde047';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(p1.x - (dx / len) * extLen, p1.y - (dy / len) * extLen);
            ctx.lineTo(p1.x + (dx / len) * extLen, p1.y + (dy / len) * extLen);
            ctx.stroke();
          }
        }
      } else if (obj.type === 'angle') {
        const p1 = pointMap.get(obj.p1Id);
        const v = pointMap.get(obj.vertexId);
        const p2 = pointMap.get(obj.p2Id);
        if (p1 && v && p2) {
          const a1 = Math.atan2(p1.y - v.y, p1.x - v.x);
          const a2 = Math.atan2(p2.y - v.y, p2.x - v.x);
          let diff = (a2 - a1) * (180 / Math.PI);
          if (diff < 0) diff += 360;
          if (diff > 180) diff = 360 - diff;

          ctx.strokeStyle = '#fde047';
          ctx.lineWidth = 1.8;
          ctx.beginPath();
          ctx.arc(v.x, v.y, 24, a1, a2, false);
          ctx.stroke();

          if (showMeasurements) {
            ctx.font = '500 12px "JetBrains Mono", monospace';
            ctx.fillStyle = '#fde047';
            ctx.fillText(`${diff.toFixed(1)}°`, v.x + 30, v.y - 6);
          }
        }
      }
    });

    // 4. Drawing Preview (when user is connecting multiple points)
    if (stepPointIds.length > 0 && mousePos) {
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = 'rgba(253, 224, 71, 0.7)';
      ctx.lineWidth = 1.8;

      const lastId = stepPointIds[stepPointIds.length - 1];
      const lastPt = pointMap.get(lastId);

      if (lastPt) {
        if (currentTool === 'circle') {
          const rPreview = Math.hypot(mousePos.x - lastPt.x, mousePos.y - lastPt.y);
          ctx.beginPath();
          ctx.arc(lastPt.x, lastPt.y, rPreview, 0, 2 * Math.PI);
          ctx.stroke();
        } else {
          ctx.beginPath();
          ctx.moveTo(lastPt.x, lastPt.y);
          ctx.lineTo(mousePos.x, mousePos.y);
          ctx.stroke();
        }
      }
      ctx.setLineDash([]);
    }

    // 5. Draw Points and Labels (A, B, C...)
    points.forEach((p) => {
      const isSelected = p.id === activePointId || stepPointIds.includes(p.id);

      // Chalk dot
      ctx.fillStyle = isSelected ? '#38bdf8' : '#facc15';
      ctx.beginPath();
      ctx.arc(p.x, p.y, isSelected ? 6 : 4.5, 0, 2 * Math.PI);
      ctx.fill();

      if (isSelected) {
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 9, 0, 2 * Math.PI);
        ctx.stroke();
      }

      // Caveat font label
      ctx.font = '600 20px "Caveat", cursive';
      ctx.fillStyle = isSelected ? '#38bdf8' : '#fde047';
      ctx.fillText(p.name, p.x + 8, p.y - 8);
    });
  }, [points, objects, currentTool, activePointId, stepPointIds, mousePos, showGrid, showMeasurements, canvasRef]);

  // Object list helpers
  const pointMap = new Map<string, Point2D>();
  points.forEach((p) => pointMap.set(p.id, p));

  const deleteObject = (id: string) => {
    saveHistory();
    setObjects((prev) => prev.filter((o) => o.id !== id));
  };

  const deletePoint = (id: string) => {
    saveHistory();
    setPoints((prev) => prev.filter((p) => p.id !== id));
    setObjects((prev) =>
      prev.filter((o) => {
        if (o.type === 'segment' || o.type === 'ray' || o.type === 'line') return o.p1Id !== id && o.p2Id !== id;
        if (o.type === 'circle') return o.centerId !== id && o.radiusPointId !== id;
        if (o.type === 'polygon') return !o.pointIds.includes(id);
        if (o.type === 'angle') return o.p1Id !== id && o.vertexId !== id && o.p2Id !== id;
        return true;
      })
    );
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row h-full overflow-hidden bg-[#17221b]">
      {/* Sidebar Controls & Object List (Left Zone) */}
      <aside className="w-full lg:w-[420px] xl:w-[460px] flex flex-col border-r border-emerald-950/80 bg-[#151f18] overflow-y-auto p-4 shrink-0 shadow-lg">
        {/* Tool selector */}
        <div className="mb-4">
          <label className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2 block font-mono">
            Công Cụ Dựng Hình:
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              onClick={() => { setCurrentTool('select'); setStepPointIds([]); }}
              className={`flex items-center gap-1.5 px-2.5 py-2 text-xs font-medium rounded border transition-all cursor-pointer ${
                currentTool === 'select'
                  ? 'bg-emerald-800 text-amber-300 border-amber-400 shadow-sm'
                  : 'bg-[#1b2720] text-slate-300 border-emerald-950 hover:bg-[#203127]'
              }`}
            >
              <MousePointer className="w-3.5 h-3.5" />
              <span>Di chuyển</span>
            </button>
            <button
              onClick={() => { setCurrentTool('point'); setStepPointIds([]); }}
              className={`flex items-center gap-1.5 px-2.5 py-2 text-xs font-medium rounded border transition-all cursor-pointer ${
                currentTool === 'point'
                  ? 'bg-emerald-800 text-amber-300 border-amber-400 shadow-sm'
                  : 'bg-[#1b2720] text-slate-300 border-emerald-950 hover:bg-[#203127]'
              }`}
            >
              <Dot className="w-4 h-4 text-amber-400" />
              <span>Điểm</span>
            </button>
            <button
              onClick={() => { setCurrentTool('segment'); setStepPointIds([]); }}
              className={`flex items-center gap-1.5 px-2.5 py-2 text-xs font-medium rounded border transition-all cursor-pointer ${
                currentTool === 'segment'
                  ? 'bg-emerald-800 text-amber-300 border-amber-400 shadow-sm'
                  : 'bg-[#1b2720] text-slate-300 border-emerald-950 hover:bg-[#203127]'
              }`}
            >
              <Minus className="w-3.5 h-3.5" />
              <span>Đoạn thẳng</span>
            </button>
            <button
              onClick={() => { setCurrentTool('ray'); setStepPointIds([]); }}
              className={`flex items-center gap-1.5 px-2.5 py-2 text-xs font-medium rounded border transition-all cursor-pointer ${
                currentTool === 'ray'
                  ? 'bg-emerald-800 text-amber-300 border-amber-400 shadow-sm'
                  : 'bg-[#1b2720] text-slate-300 border-emerald-950 hover:bg-[#203127]'
              }`}
            >
              <MoveRight className="w-3.5 h-3.5" />
              <span>Tia</span>
            </button>
            <button
              onClick={() => { setCurrentTool('line'); setStepPointIds([]); }}
              className={`flex items-center gap-1.5 px-2.5 py-2 text-xs font-medium rounded border transition-all cursor-pointer ${
                currentTool === 'line'
                  ? 'bg-emerald-800 text-amber-300 border-amber-400 shadow-sm'
                  : 'bg-[#1b2720] text-slate-300 border-emerald-950 hover:bg-[#203127]'
              }`}
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Đường thẳng</span>
            </button>
            <button
              onClick={() => { setCurrentTool('circle'); setStepPointIds([]); }}
              className={`flex items-center gap-1.5 px-2.5 py-2 text-xs font-medium rounded border transition-all cursor-pointer ${
                currentTool === 'circle'
                  ? 'bg-emerald-800 text-amber-300 border-amber-400 shadow-sm'
                  : 'bg-[#1b2720] text-slate-300 border-emerald-950 hover:bg-[#203127]'
              }`}
            >
              <CircleIcon className="w-3.5 h-3.5" />
              <span>Đường tròn</span>
            </button>
            <button
              onClick={() => { setCurrentTool('polygon'); setStepPointIds([]); }}
              className={`flex items-center gap-1.5 px-2.5 py-2 text-xs font-medium rounded border transition-all cursor-pointer ${
                currentTool === 'polygon'
                  ? 'bg-emerald-800 text-amber-300 border-amber-400 shadow-sm'
                  : 'bg-[#1b2720] text-slate-300 border-emerald-950 hover:bg-[#203127]'
              }`}
            >
              <Pentagon className="w-3.5 h-3.5" />
              <span>Đa giác</span>
            </button>
            <button
              onClick={() => { setCurrentTool('angle'); setStepPointIds([]); }}
              className={`flex items-center gap-1.5 px-2.5 py-2 text-xs font-medium rounded border transition-all cursor-pointer ${
                currentTool === 'angle'
                  ? 'bg-emerald-800 text-amber-300 border-amber-400 shadow-sm'
                  : 'bg-[#1b2720] text-slate-300 border-emerald-950 hover:bg-[#203127]'
              }`}
            >
              <CornerDownRight className="w-3.5 h-3.5" />
              <span>Đo góc</span>
            </button>
            <button
              onClick={() => { setCurrentTool('delete'); setStepPointIds([]); }}
              className={`flex items-center gap-1.5 px-2.5 py-2 text-xs font-medium rounded border transition-all cursor-pointer ${
                currentTool === 'delete'
                  ? 'bg-rose-900 text-white border-rose-500 shadow-sm'
                  : 'bg-[#1b2720] text-rose-300 border-emerald-950 hover:bg-rose-950/40'
              }`}
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
              <span>Xoá</span>
            </button>
          </div>
        </div>

        {/* Action buttons: Undo & Clear */}
        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={handleUndo}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded bg-[#1b2720] text-slate-300 border border-emerald-900 hover:text-white cursor-pointer"
          >
            <Undo2 className="w-3.5 h-3.5" />
            <span>Hoàn tác (Undo)</span>
          </button>
          <button
            onClick={handleClearAll}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded bg-[#1b2720] text-rose-300 border border-emerald-900 hover:bg-rose-950/30 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
            <span>Xoá tất cả</span>
          </button>
        </div>

        {/* Toggles: Snap to grid, show grid, show measurements */}
        <div className="bg-[#1b2720] rounded-lg border border-emerald-950 p-3 mb-4 shadow-sm">
          <div className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-2 font-mono">
            Cài Đặt Bảng Vẽ:
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <label className="flex items-center gap-2 cursor-pointer select-none text-slate-300 hover:text-white">
              <input
                type="checkbox"
                checked={snapToGrid}
                onChange={(e) => setSnapToGrid(e.target.checked)}
                className="rounded border-emerald-700 bg-emerald-950 text-emerald-500 focus:ring-0 cursor-pointer"
              />
              <span className="flex items-center gap-1">
                <Magnet className="w-3.5 h-3.5 text-amber-400" />
                Bắt điểm lưới
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer select-none text-slate-300 hover:text-white">
              <input
                type="checkbox"
                checked={showGrid}
                onChange={(e) => setShowGrid(e.target.checked)}
                className="rounded border-emerald-700 bg-emerald-950 text-emerald-500 focus:ring-0 cursor-pointer"
              />
              <span className="flex items-center gap-1">
                <Grid className="w-3.5 h-3.5 text-emerald-400" />
                Hiện lưới toạ độ
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer select-none text-slate-300 hover:text-white">
              <input
                type="checkbox"
                checked={showMeasurements}
                onChange={(e) => setShowMeasurements(e.target.checked)}
                className="rounded border-emerald-700 bg-emerald-950 text-emerald-500 focus:ring-0 cursor-pointer"
              />
              <span className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5 text-sky-400" />
                Hiện số đo
              </span>
            </label>
          </div>
        </div>

        {/* Step helper banner */}
        {stepPointIds.length > 0 && (
          <div className="mb-4 p-2.5 bg-emerald-950/60 border border-emerald-700 rounded text-xs text-amber-300 flex items-center justify-between">
            <span>
              Đang chọn điểm ({stepPointIds.length}). Click tiếp vào bảng vẽ...
            </span>
            <button
              onClick={() => setStepPointIds([])}
              className="text-xs text-rose-300 hover:underline cursor-pointer"
            >
              Huỷ
            </button>
          </div>
        )}

        {/* Geometric Object List */}
        <div className="flex-1">
          <div className="text-xs font-semibold text-amber-300 uppercase tracking-wider mb-2 font-mono">
            Danh Sách Đối Tượng ({points.length} Điểm, {objects.length} Hình):
          </div>

          <div className="space-y-2">
            {/* Points list */}
            {points.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between p-2 bg-[#1a261f] border border-emerald-950 rounded text-xs hover:border-emerald-800 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400 inline-block"></span>
                  <span className="font-caveat font-bold text-amber-300 text-base">{p.name}</span>
                  <span className="font-mono text-[11px] text-slate-400">
                    ({Math.round(p.x)}, {Math.round(p.y)})
                  </span>
                </div>
                <button
                  onClick={() => deletePoint(p.id)}
                  title="Xoá điểm"
                  className="text-slate-400 hover:text-rose-400 p-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            {/* Objects list */}
            {objects.map((obj) => {
              if (obj.type === 'segment') {
                const p1 = pointMap.get(obj.p1Id);
                const p2 = pointMap.get(obj.p2Id);
                const len = p1 && p2 ? (Math.hypot(p2.x - p1.x, p2.y - p1.y) / 25).toFixed(1) : 0;
                return (
                  <div
                    key={obj.id}
                    className="flex items-center justify-between p-2 bg-[#1a261f] border border-emerald-950 rounded text-xs hover:border-emerald-800 transition-colors"
                  >
                    <div>
                      <span className="font-medium text-sky-300">Đoạn thẳng </span>
                      <span className="font-caveat font-bold text-amber-300 text-base">
                        {p1?.name}{p2?.name}
                      </span>
                      <span className="font-mono-math text-[11px] text-slate-400 ml-2">
                        = {len} cm
                      </span>
                    </div>
                    <button
                      onClick={() => deleteObject(obj.id)}
                      className="text-slate-400 hover:text-rose-400 p-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              }

              if (obj.type === 'circle') {
                const center = pointMap.get(obj.centerId);
                const rPt = obj.radiusPointId ? pointMap.get(obj.radiusPointId) : null;
                const r = center && rPt ? (Math.hypot(rPt.x - center.x, rPt.y - center.y) / 25).toFixed(1) : '—';
                return (
                  <div
                    key={obj.id}
                    className="flex items-center justify-between p-2 bg-[#1a261f] border border-emerald-950 rounded text-xs hover:border-emerald-800 transition-colors"
                  >
                    <div>
                      <span className="font-medium text-emerald-300">Đường tròn </span>
                      <span className="font-caveat font-bold text-amber-300 text-base">
                        ({center?.name})
                      </span>
                      <span className="font-mono-math text-[11px] text-slate-400 ml-2">
                        R = {r} cm
                      </span>
                    </div>
                    <button
                      onClick={() => deleteObject(obj.id)}
                      className="text-slate-400 hover:text-rose-400 p-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              }

              if (obj.type === 'polygon') {
                const names = obj.pointIds.map((id) => pointMap.get(id)?.name || '').join('');
                return (
                  <div
                    key={obj.id}
                    className="flex items-center justify-between p-2 bg-[#1a261f] border border-emerald-950 rounded text-xs hover:border-emerald-800 transition-colors"
                  >
                    <div>
                      <span className="font-medium text-emerald-300">Đa giác </span>
                      <span className="font-caveat font-bold text-amber-300 text-base">
                        {names}
                      </span>
                      <span className="text-[11px] text-slate-400 ml-2">
                        ({obj.pointIds.length} đỉnh)
                      </span>
                    </div>
                    <button
                      onClick={() => deleteObject(obj.id)}
                      className="text-slate-400 hover:text-rose-400 p-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              }

              if (obj.type === 'angle') {
                const p1 = pointMap.get(obj.p1Id);
                const v = pointMap.get(obj.vertexId);
                const p2 = pointMap.get(obj.p2Id);
                let diff = '—';
                if (p1 && v && p2) {
                  const a1 = Math.atan2(p1.y - v.y, p1.x - v.x);
                  const a2 = Math.atan2(p2.y - v.y, p2.x - v.x);
                  let deg = (a2 - a1) * (180 / Math.PI);
                  if (deg < 0) deg += 360;
                  if (deg > 180) deg = 360 - deg;
                  diff = `${deg.toFixed(1)}°`;
                }
                return (
                  <div
                    key={obj.id}
                    className="flex items-center justify-between p-2 bg-[#1a261f] border border-emerald-950 rounded text-xs hover:border-emerald-800 transition-colors"
                  >
                    <div>
                      <span className="font-medium text-amber-300">Góc </span>
                      <span className="font-caveat font-bold text-amber-300 text-base">
                        ∠{p1?.name}{v?.name}{p2?.name}
                      </span>
                      <span className="font-mono-math text-[11px] text-slate-400 ml-2">
                        = {diff}
                      </span>
                    </div>
                    <button
                      onClick={() => deleteObject(obj.id)}
                      className="text-slate-400 hover:text-rose-400 p-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              }

              return null;
            })}
          </div>
        </div>
      </aside>

      {/* Free Draw Canvas Stage (Right Zone) */}
      <main className="flex-1 relative flex items-center justify-center p-3 sm:p-6 bg-[#141c17] overflow-hidden chalkboard-stage">
        <div className="w-full h-full relative rounded-xl border-4 border-[#2d3a31] shadow-2xl overflow-hidden bg-[#16221b]">
          <canvas
            ref={canvasRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            className="w-full h-full block cursor-crosshair touch-none select-none"
          />

          {/* Quick HUD legend on canvas */}
          <div className="absolute top-3 left-3 bg-[#131d16]/85 backdrop-blur-sm border border-emerald-900/60 rounded px-2.5 py-1 text-[11px] text-slate-300 font-mono flex items-center gap-2 select-none pointer-events-none">
            <span>✏️ Chọn công cụ và click lên bảng để dựng hình · Kéo điểm mốc để biến dạng trực tiếp</span>
          </div>

          <div className="absolute bottom-3 right-3 text-emerald-500/60 font-caveat text-base select-none pointer-events-none">
            Bảng Dựng Hình Động Tương Tác
          </div>
        </div>
      </main>
    </div>
  );
};
