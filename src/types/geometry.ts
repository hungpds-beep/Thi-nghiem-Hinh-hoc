export type TabType = '2d' | '3d' | 'freedraw';

export type Shape2DType = 
  | 'triangle_scalene'
  | 'triangle_right'
  | 'square'
  | 'rectangle'
  | 'parallelogram'
  | 'rhombus'
  | 'trapezoid_isosceles'
  | 'circle'
  | 'regular_polygon';

export interface Shape2DParams {
  // Triangle scalene
  a: number; // side a
  b: number; // side b
  c: number; // side c
  // Triangle right
  legA: number;
  legB: number;
  // Square
  squareSide: number;
  // Rectangle
  rectWidth: number;
  rectHeight: number;
  // Parallelogram
  paraA: number;
  paraB: number;
  paraAngle: number; // degrees
  // Rhombus
  rhombusSide: number;
  rhombusAngle: number; // degrees
  // Isosceles trapezoid
  trapBaseA: number; // bottom base
  trapBaseB: number; // top base
  trapHeight: number;
  // Circle
  circleRadius: number;
  sectorAngle: number; // degrees (default 360)
  // Regular polygon
  polygonSides: number;
  polygonRadius: number;
}

export interface CalculationResult2D {
  isValid: boolean;
  errorMessage?: string;
  perimeter: number;
  area: number;
  diagonals?: number[];
  angles?: number[]; // in degrees
  heights?: number[];
  inRadius?: number; // bán kính đường tròn nội tiếp
  outRadius?: number; // bán kính đường tròn ngoại tiếp
  formulas: {
    label: string;
    formula: string;
    value: string;
    explanation?: string;
  }[];
}

export type Shape3DType =
  | 'cube'
  | 'cuboid'
  | 'triangular_prism'
  | 'square_pyramid'
  | 'cylinder'
  | 'cone'
  | 'sphere';

export interface Shape3DParams {
  cubeA: number;
  cuboidA: number;
  cuboidB: number;
  cuboidC: number;
  prismA: number;
  prismH: number;
  pyramidA: number;
  pyramidH: number;
  cylinderR: number;
  cylinderH: number;
  coneR: number;
  coneH: number;
  sphereR: number;
}

export interface CalculationResult3D {
  volume: number;
  lateralArea: number; // Sxq
  totalArea: number;   // Stp
  baseArea?: number;
  slantHeight?: number; // Đường sinh hoặc trung đoạn
  spaceDiagonal?: number;
  formulas: {
    label: string;
    formula: string;
    value: string;
    step?: string;
  }[];
}

// Free draw tool types
export type FreeDrawTool =
  | 'select'
  | 'point'
  | 'segment'
  | 'ray'
  | 'line'
  | 'circle'
  | 'polygon'
  | 'angle'
  | 'delete';

export interface Point2D {
  id: string;
  name: string;
  x: number;
  y: number;
  color?: string;
}

export interface SegmentObj {
  id: string;
  type: 'segment';
  p1Id: string;
  p2Id: string;
  color?: string;
}

export interface RayObj {
  id: string;
  type: 'ray';
  p1Id: string; // origin
  p2Id: string; // direction
  color?: string;
}

export interface LineObj {
  id: string;
  type: 'line';
  p1Id: string;
  p2Id: string;
  color?: string;
}

export interface CircleObj {
  id: string;
  type: 'circle';
  centerId: string;
  radiusPointId?: string;
  radiusValue?: number;
  color?: string;
}

export interface PolygonObj {
  id: string;
  type: 'polygon';
  pointIds: string[];
  color?: string;
}

export interface AngleObj {
  id: string;
  type: 'angle';
  p1Id: string; // arm 1
  vertexId: string; // vertex
  p2Id: string; // arm 2
  color?: string;
}

export type GeoObject = SegmentObj | RayObj | LineObj | CircleObj | PolygonObj | AngleObj;
