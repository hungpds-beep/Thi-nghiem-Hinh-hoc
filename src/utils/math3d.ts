import { Shape3DParams, Shape3DType, CalculationResult3D } from '../types/geometry';

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export interface Vec2 {
  x: number;
  y: number;
}

export interface Face3D {
  indices: number[];
  baseColor: [number, number, number]; // RGB
  alpha?: number;
}

export interface Edge3D {
  i: number;
  j: number;
  isDashed?: boolean;
}

export interface Model3D {
  vertices: Vec3[];
  faces: Face3D[];
  edges?: Edge3D[];
  labels?: { index: number; text: string; offset?: Vec3 }[];
}

export function calculate3DShape(type: Shape3DType, params: Shape3DParams): CalculationResult3D {
  switch (type) {
    case 'cube': {
      const a = params.cubeA;
      const v = a * a * a;
      const sxq = 4 * a * a;
      const stp = 6 * a * a;
      const d = a * Math.sqrt(3);
      return {
        volume: v,
        lateralArea: sxq,
        totalArea: stp,
        spaceDiagonal: d,
        formulas: [
          { label: 'Thể tích (V)', formula: 'V = a³', value: `${v.toFixed(2)} cm³` },
          { label: 'Diện tích xung quanh (Sxq)', formula: 'Sxq = 4 · a²', value: `${sxq.toFixed(2)} cm²` },
          { label: 'Diện tích toàn phần (Stp)', formula: 'Stp = 6 · a²', value: `${stp.toFixed(2)} cm²` },
          { label: 'Đường chéo không gian (d)', formula: 'd = a√3', value: `${d.toFixed(2)} cm` }
        ]
      };
    }

    case 'cuboid': {
      const { cuboidA: a, cuboidB: b, cuboidC: c } = params;
      const v = a * b * c;
      const sxq = 2 * (a + b) * c;
      const stp = 2 * (a * b + b * c + c * a);
      const d = Math.sqrt(a * a + b * b + c * c);
      return {
        volume: v,
        lateralArea: sxq,
        totalArea: stp,
        spaceDiagonal: d,
        formulas: [
          { label: 'Thể tích (V)', formula: 'V = a · b · c', value: `${v.toFixed(2)} cm³` },
          { label: 'Diện tích xung quanh (Sxq)', formula: 'Sxq = 2 · (a + b) · c', value: `${sxq.toFixed(2)} cm²`, step: 'Chu vi đáy nhân chiều cao' },
          { label: 'Diện tích toàn phần (Stp)', formula: 'Stp = Sxq + 2 · (a · b)', value: `${stp.toFixed(2)} cm²` },
          { label: 'Đường chéo không gian (d)', formula: 'd = √(a² + b² + c²)', value: `${d.toFixed(2)} cm` }
        ]
      };
    }

    case 'triangular_prism': {
      const { prismA: a, prismH: h } = params;
      const sBase = (Math.sqrt(3) / 4) * a * a;
      const sxq = 3 * a * h;
      const stp = sxq + 2 * sBase;
      const v = sBase * h;
      return {
        volume: v,
        lateralArea: sxq,
        totalArea: stp,
        baseArea: sBase,
        formulas: [
          { label: 'Diện tích đáy (Sđ)', formula: 'Sđ = (a²√3) / 4', value: `${sBase.toFixed(2)} cm²`, step: 'Tam giác đều' },
          { label: 'Thể tích (V)', formula: 'V = Sđ · h = (a²·h·√3) / 4', value: `${v.toFixed(2)} cm³` },
          { label: 'Diện tích xung quanh (Sxq)', formula: 'Sxq = 3 · a · h', value: `${sxq.toFixed(2)} cm²` },
          { label: 'Diện tích toàn phần (Stp)', formula: 'Stp = Sxq + 2 · Sđ', value: `${stp.toFixed(2)} cm²` }
        ]
      };
    }

    case 'square_pyramid': {
      const { pyramidA: a, pyramidH: h } = params;
      const sBase = a * a;
      const v = (1 / 3) * sBase * h;
      // Trung đoạn (slant height) d = sqrt(h^2 + (a/2)^2)
      const d = Math.sqrt(h * h + Math.pow(a / 2, 2));
      const sxq = 2 * a * d; // 4 * (1/2 * a * d)
      const stp = sBase + sxq;
      const edge = Math.sqrt(h * h + 2 * Math.pow(a / 2, 2)); // cạnh bên
      return {
        volume: v,
        lateralArea: sxq,
        totalArea: stp,
        baseArea: sBase,
        slantHeight: d,
        formulas: [
          { label: 'Trung đoạn (d)', formula: 'd = √(h² + (a/2)²)', value: `${d.toFixed(2)} cm`, step: 'Chiều cao mặt bên' },
          { label: 'Cạnh bên (b)', formula: 'b = √(h² + (a√2/2)²)', value: `${edge.toFixed(2)} cm` },
          { label: 'Thể tích (V)', formula: 'V = 1/3 · Sđ · h = 1/3 · a² · h', value: `${v.toFixed(2)} cm³` },
          { label: 'Diện tích xung quanh (Sxq)', formula: 'Sxq = 2 · a · d', value: `${sxq.toFixed(2)} cm²` },
          { label: 'Diện tích toàn phần (Stp)', formula: 'Stp = a² + 2·a·d', value: `${stp.toFixed(2)} cm²` }
        ]
      };
    }

    case 'cylinder': {
      const { cylinderR: r, cylinderH: h } = params;
      const sBase = Math.PI * r * r;
      const sxq = 2 * Math.PI * r * h;
      const stp = sxq + 2 * sBase;
      const v = sBase * h;
      return {
        volume: v,
        lateralArea: sxq,
        totalArea: stp,
        baseArea: sBase,
        formulas: [
          { label: 'Thể tích (V)', formula: 'V = π · r² · h', value: `${v.toFixed(2)} cm³` },
          { label: 'Diện tích xung quanh (Sxq)', formula: 'Sxq = 2 · π · r · h', value: `${sxq.toFixed(2)} cm²` },
          { label: 'Diện tích toàn phần (Stp)', formula: 'Stp = 2π·r·h + 2π·r²', value: `${stp.toFixed(2)} cm²` },
          { label: 'Chu vi đáy (C)', formula: 'C = 2 · π · r', value: `${(2 * Math.PI * r).toFixed(2)} cm` }
        ]
      };
    }

    case 'cone': {
      const { coneR: r, coneH: h } = params;
      const l = Math.sqrt(r * r + h * h); // đường sinh
      const sBase = Math.PI * r * r;
      const sxq = Math.PI * r * l;
      const stp = sxq + sBase;
      const v = (1 / 3) * Math.PI * r * r * h;
      return {
        volume: v,
        lateralArea: sxq,
        totalArea: stp,
        baseArea: sBase,
        slantHeight: l,
        formulas: [
          { label: 'Đường sinh (l)', formula: 'l = √(r² + h²)', value: `${l.toFixed(2)} cm`, step: 'Định lý Pythagoras' },
          { label: 'Thể tích (V)', formula: 'V = 1/3 · π · r² · h', value: `${v.toFixed(2)} cm³` },
          { label: 'Diện tích xung quanh (Sxq)', formula: 'Sxq = π · r · l', value: `${sxq.toFixed(2)} cm²` },
          { label: 'Diện tích toàn phần (Stp)', formula: 'Stp = π·r·l + π·r² = π·r(l + r)', value: `${stp.toFixed(2)} cm²` }
        ]
      };
    }

    case 'sphere': {
      const { sphereR: r } = params;
      const s = 4 * Math.PI * r * r;
      const v = (4 / 3) * Math.PI * r * r * r;
      return {
        volume: v,
        lateralArea: s,
        totalArea: s,
        formulas: [
          { label: 'Thể tích (V)', formula: 'V = 4/3 · π · R³', value: `${v.toFixed(2)} cm³` },
          { label: 'Diện tích mặt cầu (S)', formula: 'S = 4 · π · R²', value: `${s.toFixed(2)} cm²` },
          { label: 'Đường kính (d)', formula: 'd = 2 · R', value: `${(2 * r).toFixed(2)} cm` }
        ]
      };
    }
  }
}

// Generate 3D geometry mesh for rendering
export function get3DModel(type: Shape3DType, params: Shape3DParams): Model3D {
  switch (type) {
    case 'cube': {
      const s = 1.0;
      const vertices: Vec3[] = [
        { x: -s, y: -s, z: -s }, // 0
        { x:  s, y: -s, z: -s }, // 1
        { x:  s, y:  s, z: -s }, // 2
        { x: -s, y:  s, z: -s }, // 3
        { x: -s, y: -s, z:  s }, // 4
        { x:  s, y: -s, z:  s }, // 5
        { x:  s, y:  s, z:  s }, // 6
        { x: -s, y:  s, z:  s }  // 7
      ];

      const chalkBlue: [number, number, number] = [56, 189, 248];
      const chalkGreen: [number, number, number] = [74, 222, 128];
      const chalkYellow: [number, number, number] = [253, 224, 71];
      const chalkCoral: [number, number, number] = [251, 113, 133];

      const faces: Face3D[] = [
        { indices: [0, 1, 2, 3], baseColor: chalkBlue },  // Back
        { indices: [4, 7, 6, 5], baseColor: chalkBlue },  // Front
        { indices: [0, 4, 5, 1], baseColor: chalkGreen }, // Bottom
        { indices: [3, 2, 6, 7], baseColor: chalkGreen }, // Top
        { indices: [0, 3, 7, 4], baseColor: chalkCoral }, // Left
        { indices: [1, 5, 6, 2], baseColor: chalkYellow } // Right
      ];

      const labels = [
        { index: 0, text: "A'" },
        { index: 1, text: "B'" },
        { index: 2, text: "C'" },
        { index: 3, text: "D'" },
        { index: 4, text: "A" },
        { index: 5, text: "B" },
        { index: 6, text: "C" },
        { index: 7, text: "D" }
      ];

      return { vertices, faces, labels };
    }

    case 'cuboid': {
      const { cuboidA: a, cuboidB: b, cuboidC: c } = params;
      const maxDim = Math.max(a, b, c, 1);
      const sx = (a / maxDim) * 1.3;
      const sy = (c / maxDim) * 1.3; // height
      const sz = (b / maxDim) * 1.3;

      const vertices: Vec3[] = [
        { x: -sx, y: -sy, z: -sz },
        { x:  sx, y: -sy, z: -sz },
        { x:  sx, y:  sy, z: -sz },
        { x: -sx, y:  sy, z: -sz },
        { x: -sx, y: -sy, z:  sz },
        { x:  sx, y: -sy, z:  sz },
        { x:  sx, y:  sy, z:  sz },
        { x: -sx, y:  sy, z:  sz }
      ];

      const chalkBlue: [number, number, number] = [56, 189, 248];
      const chalkGreen: [number, number, number] = [74, 222, 128];
      const chalkYellow: [number, number, number] = [253, 224, 71];
      const chalkCoral: [number, number, number] = [251, 113, 133];

      const faces: Face3D[] = [
        { indices: [0, 1, 2, 3], baseColor: chalkBlue },
        { indices: [4, 7, 6, 5], baseColor: chalkBlue },
        { indices: [0, 4, 5, 1], baseColor: chalkGreen },
        { indices: [3, 2, 6, 7], baseColor: chalkGreen },
        { indices: [0, 3, 7, 4], baseColor: chalkCoral },
        { indices: [1, 5, 6, 2], baseColor: chalkYellow }
      ];

      const labels = [
        { index: 4, text: 'A' }, { index: 5, text: 'B' }, { index: 6, text: 'C' }, { index: 7, text: 'D' },
        { index: 0, text: "A'" }, { index: 1, text: "B'" }, { index: 2, text: "C'" }, { index: 3, text: "D'" }
      ];

      return { vertices, faces, labels };
    }

    case 'triangular_prism': {
      const { prismA: a, prismH: h } = params;
      const maxDim = Math.max(a, h, 1);
      const sa = (a / maxDim) * 1.4;
      const sh = (h / maxDim) * 1.4;

      // Base triangle coordinates (equilateral)
      const r = sa / Math.sqrt(3);
      const yBottom = -sh / 2;
      const yTop = sh / 2;

      const baseAngles = [Math.PI / 2, Math.PI / 2 + (2 * Math.PI) / 3, Math.PI / 2 + (4 * Math.PI) / 3];
      const vertices: Vec3[] = [];

      // Bottom triangle 0, 1, 2
      baseAngles.forEach(ang => {
        vertices.push({ x: r * Math.cos(ang), y: yBottom, z: r * Math.sin(ang) });
      });
      // Top triangle 3, 4, 5
      baseAngles.forEach(ang => {
        vertices.push({ x: r * Math.cos(ang), y: yTop, z: r * Math.sin(ang) });
      });

      const chalkBlue: [number, number, number] = [56, 189, 248];
      const chalkGreen: [number, number, number] = [74, 222, 128];
      const chalkYellow: [number, number, number] = [253, 224, 71];

      const faces: Face3D[] = [
        { indices: [0, 2, 1], baseColor: chalkGreen },       // Bottom
        { indices: [3, 4, 5], baseColor: chalkGreen },       // Top
        { indices: [0, 1, 4, 3], baseColor: chalkBlue },     // Side 1
        { indices: [1, 2, 5, 4], baseColor: chalkYellow },   // Side 2
        { indices: [2, 0, 3, 5], baseColor: chalkBlue }      // Side 3
      ];

      const labels = [
        { index: 0, text: 'A' }, { index: 1, text: 'B' }, { index: 2, text: 'C' },
        { index: 3, text: "A'" }, { index: 4, text: "B'" }, { index: 5, text: "C'" }
      ];

      return { vertices, faces, labels };
    }

    case 'square_pyramid': {
      const { pyramidA: a, pyramidH: h } = params;
      const maxDim = Math.max(a, h, 1);
      const sa = (a / maxDim) * 1.3;
      const sh = (h / maxDim) * 1.4;

      const yBase = -sh / 2;
      const yApex = sh / 2;

      const vertices: Vec3[] = [
        { x: -sa / 2, y: yBase, z: -sa / 2 }, // 0: A
        { x:  sa / 2, y: yBase, z: -sa / 2 }, // 1: B
        { x:  sa / 2, y: yBase, z:  sa / 2 }, // 2: C
        { x: -sa / 2, y: yBase, z:  sa / 2 }, // 3: D
        { x: 0, y: yApex, z: 0 }              // 4: S (Apex)
      ];

      const chalkGreen: [number, number, number] = [74, 222, 128];
      const chalkBlue: [number, number, number] = [56, 189, 248];
      const chalkCoral: [number, number, number] = [251, 113, 133];
      const chalkYellow: [number, number, number] = [253, 224, 71];

      const faces: Face3D[] = [
        { indices: [0, 1, 2, 3], baseColor: chalkGreen }, // Base
        { indices: [4, 0, 1], baseColor: chalkBlue },     // Side SAB
        { indices: [4, 1, 2], baseColor: chalkYellow },   // Side SBC
        { indices: [4, 2, 3], baseColor: chalkCoral },    // Side SCD
        { indices: [4, 3, 0], baseColor: chalkBlue }      // Side SDA
      ];

      const labels = [
        { index: 4, text: 'S' },
        { index: 0, text: 'A' },
        { index: 1, text: 'B' },
        { index: 2, text: 'C' },
        { index: 3, text: 'D' }
      ];

      return { vertices, faces, labels };
    }

    case 'cylinder': {
      const { cylinderR: r, cylinderH: h } = params;
      const maxDim = Math.max(r * 2, h, 1);
      const sr = (r / maxDim) * 1.3;
      const sh = (h / maxDim) * 1.4;
      const N = 24;

      const yBottom = -sh / 2;
      const yTop = sh / 2;
      const vertices: Vec3[] = [];

      // Bottom rim: 0..N-1
      for (let i = 0; i < N; i++) {
        const ang = (i * 2 * Math.PI) / N;
        vertices.push({ x: sr * Math.cos(ang), y: yBottom, z: sr * Math.sin(ang) });
      }
      // Top rim: N..2N-1
      for (let i = 0; i < N; i++) {
        const ang = (i * 2 * Math.PI) / N;
        vertices.push({ x: sr * Math.cos(ang), y: yTop, z: sr * Math.sin(ang) });
      }
      // Bottom center: 2N
      vertices.push({ x: 0, y: yBottom, z: 0 });
      // Top center: 2N + 1
      vertices.push({ x: 0, y: yTop, z: 0 });

      const chalkBlue: [number, number, number] = [56, 189, 248];
      const chalkGreen: [number, number, number] = [74, 222, 128];
      const faces: Face3D[] = [];

      // Side quads
      for (let i = 0; i < N; i++) {
        const next = (i + 1) % N;
        faces.push({
          indices: [i, next, N + next, N + i],
          baseColor: chalkBlue
        });
      }

      // Bottom cap
      const bottomCap: number[] = [];
      for (let i = N - 1; i >= 0; i--) bottomCap.push(i);
      faces.push({ indices: bottomCap, baseColor: chalkGreen });

      // Top cap
      const topCap: number[] = [];
      for (let i = 0; i < N; i++) topCap.push(N + i);
      faces.push({ indices: topCap, baseColor: chalkGreen });

      const labels = [
        { index: 2 * N, text: "O'" },
        { index: 2 * N + 1, text: 'O' }
      ];

      return { vertices, faces, labels };
    }

    case 'cone': {
      const { coneR: r, coneH: h } = params;
      const maxDim = Math.max(r * 2, h, 1);
      const sr = (r / maxDim) * 1.3;
      const sh = (h / maxDim) * 1.4;
      const N = 24;

      const yBottom = -sh / 2;
      const yApex = sh / 2;
      const vertices: Vec3[] = [];

      // Rim: 0..N-1
      for (let i = 0; i < N; i++) {
        const ang = (i * 2 * Math.PI) / N;
        vertices.push({ x: sr * Math.cos(ang), y: yBottom, z: sr * Math.sin(ang) });
      }
      // Apex: N
      vertices.push({ x: 0, y: yApex, z: 0 });
      // Base center: N + 1
      vertices.push({ x: 0, y: yBottom, z: 0 });

      const chalkCoral: [number, number, number] = [251, 113, 133];
      const chalkGreen: [number, number, number] = [74, 222, 128];
      const faces: Face3D[] = [];

      // Side triangles
      for (let i = 0; i < N; i++) {
        const next = (i + 1) % N;
        faces.push({
          indices: [N, i, next],
          baseColor: chalkCoral
        });
      }

      // Base cap
      const bottomCap: number[] = [];
      for (let i = N - 1; i >= 0; i--) bottomCap.push(i);
      faces.push({ indices: bottomCap, baseColor: chalkGreen });

      const labels = [
        { index: N, text: 'S' },
        { index: N + 1, text: 'O' }
      ];

      return { vertices, faces, labels };
    }

    case 'sphere': {
      const sr = 1.1;
      const latBands = 12;
      const lonBands = 20;
      const vertices: Vec3[] = [];

      for (let lat = 0; lat <= latBands; lat++) {
        const theta = (lat * Math.PI) / latBands;
        const sinTheta = Math.sin(theta);
        const cosTheta = Math.cos(theta);

        for (let lon = 0; lon <= lonBands; lon++) {
          const phi = (lon * 2 * Math.PI) / lonBands;
          const x = sr * Math.cos(phi) * sinTheta;
          const y = sr * cosTheta;
          const z = sr * Math.sin(phi) * sinTheta;
          vertices.push({ x, y, z });
        }
      }

      const faces: Face3D[] = [];
      const chalkCyan: [number, number, number] = [56, 189, 248];

      for (let lat = 0; lat < latBands; lat++) {
        for (let lon = 0; lon < lonBands; lon++) {
          const first = lat * (lonBands + 1) + lon;
          const second = first + lonBands + 1;
          faces.push({
            indices: [first, second, second + 1, first + 1],
            baseColor: chalkCyan
          });
        }
      }

      return { vertices, faces };
    }
  }
}

// 3D vector rotation
export function rotateVec3(v: Vec3, rotX: number, rotY: number, rotZ: number = 0): Vec3 {
  // Rot X
  const cx = Math.cos(rotX);
  const sx = Math.sin(rotX);
  const y1 = v.y * cx - v.z * sx;
  const z1 = v.y * sx + v.z * cx;

  // Rot Y
  const cy = Math.cos(rotY);
  const sy = Math.sin(rotY);
  const x2 = v.x * cy + z1 * sy;
  const z2 = -v.x * sy + z1 * cy;

  // Rot Z
  const cz = Math.cos(rotZ);
  const sz = Math.sin(rotZ);
  const x3 = x2 * cz - y1 * sz;
  const y3 = x2 * sz + y1 * cz;

  return { x: x3, y: y3, z: z2 };
}
