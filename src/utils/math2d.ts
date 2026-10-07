import { Shape2DParams, Shape2DType, CalculationResult2D } from '../types/geometry';

export interface Point {
  x: number;
  y: number;
}

export function calculate2DShape(type: Shape2DType, params: Shape2DParams): CalculationResult2D {
  switch (type) {
    case 'triangle_scalene': {
      const { a, b, c } = params;
      // Triangle inequality check
      if (a <= 0 || b <= 0 || c <= 0) {
        return {
          isValid: false,
          errorMessage: 'Độ dài các cạnh của tam giác phải lớn hơn 0.',
          perimeter: 0,
          area: 0,
          formulas: []
        };
      }
      if (a + b <= c || a + c <= b || b + c <= a) {
        return {
          isValid: false,
          errorMessage: 'Bất đẳng thức tam giác không thoả mãn: Tổng hai cạnh bất kỳ phải lớn hơn cạnh còn lại (a + b > c, a + c > b, b + c > a).',
          perimeter: a + b + c,
          area: 0,
          formulas: [
            { label: 'Kiểm tra', formula: 'a + b > c', value: `${a} + ${b} = ${a + b} ${a + b <= c ? '≤' : '>'} ${c}`, explanation: 'Điều kiện tạo thành tam giác' }
          ]
        };
      }

      const p = (a + b + c) / 2; // semi-perimeter
      const area = Math.sqrt(p * (p - a) * (p - b) * (p - c));
      const perimeter = a + b + c;

      // Cosine rule for angles (in radians -> degrees)
      const cosA = Math.max(-1, Math.min(1, (b * b + c * c - a * a) / (2 * b * c)));
      const cosB = Math.max(-1, Math.min(1, (a * a + c * c - b * b) / (2 * a * c)));
      const cosC = Math.max(-1, Math.min(1, (a * a + b * b - c * c) / (2 * a * b)));
      
      const angleA = (Math.acos(cosA) * 180) / Math.PI;
      const angleB = (Math.acos(cosB) * 180) / Math.PI;
      const angleC = 180 - angleA - angleB;

      // Heights
      const ha = (2 * area) / a;
      const hb = (2 * area) / b;
      const hc = (2 * area) / c;

      // Radii
      const r = area / p; // inradius
      const R = (a * b * c) / (4 * area); // circumradius

      return {
        isValid: true,
        perimeter,
        area,
        angles: [angleA, angleB, angleC],
        heights: [ha, hb, hc],
        inRadius: r,
        outRadius: R,
        formulas: [
          { label: 'Chu vi (P)', formula: 'P = a + b + c', value: `${perimeter.toFixed(2)} cm` },
          { label: 'Nửa chu vi (p)', formula: 'p = P / 2', value: `${p.toFixed(2)} cm` },
          { label: 'Diện tích (S)', formula: 'S = √(p(p-a)(p-b)(p-c))', value: `${area.toFixed(2)} cm²`, explanation: 'Công thức Heron' },
          { label: 'Chiều cao ha (ứng với cạnh a)', formula: 'ha = 2S / a', value: `${ha.toFixed(2)} cm` },
          { label: 'Bán kính nội tiếp (r)', formula: 'r = S / p', value: `${r.toFixed(2)} cm` },
          { label: 'Bán kính ngoại tiếp (R)', formula: 'R = (a·b·c) / (4S)', value: `${R.toFixed(2)} cm` },
          { label: 'Các góc (Â, B̂, Ĉ)', formula: 'cos A = (b² + c² - a²) / (2bc)', value: `Â ≈ ${angleA.toFixed(1)}°, B̂ ≈ ${angleB.toFixed(1)}°, Ĉ ≈ ${angleC.toFixed(1)}°` }
        ]
      };
    }

    case 'triangle_right': {
      const { legA: a, legB: b } = params;
      if (a <= 0 || b <= 0) {
        return { isValid: false, errorMessage: 'Độ dài cạnh góc vuông phải lớn hơn 0.', perimeter: 0, area: 0, formulas: [] };
      }
      const c = Math.sqrt(a * a + b * b); // hypotenuse
      const area = 0.5 * a * b;
      const perimeter = a + b + c;
      const hc = (a * b) / c; // altitude to hypotenuse
      const angleA = (Math.atan(a / b) * 180) / Math.PI;
      const angleB = 90 - angleA;
      const r = (a + b - c) / 2; // inradius
      const R = c / 2; // circumradius

      return {
        isValid: true,
        perimeter,
        area,
        angles: [90, angleA, angleB],
        heights: [a, b, hc],
        inRadius: r,
        outRadius: R,
        formulas: [
          { label: 'Cạnh huyền (c)', formula: 'c = √(a² + b²)', value: `${c.toFixed(2)} cm`, explanation: 'Định lý Pythagoras' },
          { label: 'Chu vi (P)', formula: 'P = a + b + c', value: `${perimeter.toFixed(2)} cm` },
          { label: 'Diện tích (S)', formula: 'S = 1/2 · a · b', value: `${area.toFixed(2)} cm²` },
          { label: 'Đường cao ứng cạnh huyền (h)', formula: 'h = (a · b) / c', value: `${hc.toFixed(2)} cm`, explanation: 'Hệ thức lượng trong tam giác vuông' },
          { label: 'Bán kính ngoại tiếp (R)', formula: 'R = c / 2', value: `${R.toFixed(2)} cm` },
          { label: 'Bán kính nội tiếp (r)', formula: 'r = (a + b - c) / 2', value: `${r.toFixed(2)} cm` }
        ]
      };
    }

    case 'square': {
      const a = params.squareSide;
      if (a <= 0) {
        return { isValid: false, errorMessage: 'Cạnh hình vuông phải lớn hơn 0.', perimeter: 0, area: 0, formulas: [] };
      }
      const perimeter = 4 * a;
      const area = a * a;
      const d = a * Math.SQRT2;
      const r = a / 2;
      const R = d / 2;

      return {
        isValid: true,
        perimeter,
        area,
        diagonals: [d, d],
        inRadius: r,
        outRadius: R,
        formulas: [
          { label: 'Chu vi (P)', formula: 'P = 4 · a', value: `${perimeter.toFixed(2)} cm` },
          { label: 'Diện tích (S)', formula: 'S = a²', value: `${area.toFixed(2)} cm²` },
          { label: 'Đường chéo (d)', formula: 'd = a√2', value: `${d.toFixed(2)} cm` },
          { label: 'Bán kính ngoại tiếp (R)', formula: 'R = d / 2 = a√2 / 2', value: `${R.toFixed(2)} cm` },
          { label: 'Bán kính nội tiếp (r)', formula: 'r = a / 2', value: `${r.toFixed(2)} cm` }
        ]
      };
    }

    case 'rectangle': {
      const { rectWidth: a, rectHeight: b } = params;
      if (a <= 0 || b <= 0) {
        return { isValid: false, errorMessage: 'Chiều dài và chiều rộng phải lớn hơn 0.', perimeter: 0, area: 0, formulas: [] };
      }
      const perimeter = 2 * (a + b);
      const area = a * b;
      const d = Math.sqrt(a * a + b * b);
      const R = d / 2;

      return {
        isValid: true,
        perimeter,
        area,
        diagonals: [d, d],
        outRadius: R,
        formulas: [
          { label: 'Chu vi (P)', formula: 'P = 2 · (a + b)', value: `${perimeter.toFixed(2)} cm` },
          { label: 'Diện tích (S)', formula: 'S = a · b', value: `${area.toFixed(2)} cm²` },
          { label: 'Đường chéo (d)', formula: 'd = √(a² + b²)', value: `${d.toFixed(2)} cm` },
          { label: 'Bán kính ngoại tiếp (R)', formula: 'R = d / 2', value: `${R.toFixed(2)} cm` }
        ]
      };
    }

    case 'parallelogram': {
      const { paraA: a, paraB: b, paraAngle: alphaDeg } = params;
      if (a <= 0 || b <= 0 || alphaDeg <= 0 || alphaDeg >= 180) {
        return { isValid: false, errorMessage: 'Cạnh và góc không hợp lệ (0 < góc < 180°).', perimeter: 0, area: 0, formulas: [] };
      }
      const alphaRad = (alphaDeg * Math.PI) / 180;
      const h = b * Math.sin(alphaRad);
      const perimeter = 2 * (a + b);
      const area = a * h;
      const d1 = Math.sqrt(a * a + b * b - 2 * a * b * Math.cos(alphaRad));
      const d2 = Math.sqrt(a * a + b * b + 2 * a * b * Math.cos(alphaRad));

      return {
        isValid: true,
        perimeter,
        area,
        diagonals: [d1, d2],
        heights: [h],
        angles: [alphaDeg, 180 - alphaDeg],
        formulas: [
          { label: 'Chu vi (P)', formula: 'P = 2 · (a + b)', value: `${perimeter.toFixed(2)} cm` },
          { label: 'Chiều cao (h)', formula: 'h = b · sin(α)', value: `${h.toFixed(2)} cm` },
          { label: 'Diện tích (S)', formula: 'S = a · h = a · b · sin(α)', value: `${area.toFixed(2)} cm²` },
          { label: 'Đường chéo ngắn (d₁)', formula: 'd₁ = √(a² + b² - 2ab·cos α)', value: `${d1.toFixed(2)} cm` },
          { label: 'Đường chéo dài (d₂)', formula: 'd₂ = √(a² + b² + 2ab·cos α)', value: `${d2.toFixed(2)} cm` }
        ]
      };
    }

    case 'rhombus': {
      const { rhombusSide: a, rhombusAngle: alphaDeg } = params;
      if (a <= 0 || alphaDeg <= 0 || alphaDeg >= 180) {
        return { isValid: false, errorMessage: 'Cạnh và góc không hợp lệ.', perimeter: 0, area: 0, formulas: [] };
      }
      const alphaRad = (alphaDeg * Math.PI) / 180;
      const perimeter = 4 * a;
      const area = a * a * Math.sin(alphaRad);
      const d1 = 2 * a * Math.sin(alphaRad / 2);
      const d2 = 2 * a * Math.cos(alphaRad / 2);
      const h = area / a;

      return {
        isValid: true,
        perimeter,
        area,
        diagonals: [d1, d2],
        heights: [h],
        angles: [alphaDeg, 180 - alphaDeg],
        formulas: [
          { label: 'Chu vi (P)', formula: 'P = 4 · a', value: `${perimeter.toFixed(2)} cm` },
          { label: 'Diện tích (S)', formula: 'S = a² · sin(α) = 1/2 · d₁ · d₂', value: `${area.toFixed(2)} cm²` },
          { label: 'Đường chéo 1 (d₁)', formula: 'd₁ = 2a · sin(α/2)', value: `${d1.toFixed(2)} cm` },
          { label: 'Đường chéo 2 (d₂)', formula: 'd₂ = 2a · cos(α/2)', value: `${d2.toFixed(2)} cm` },
          { label: 'Chiều cao (h)', formula: 'h = S / a', value: `${h.toFixed(2)} cm` }
        ]
      };
    }

    case 'trapezoid_isosceles': {
      const { trapBaseA: a, trapBaseB: b, trapHeight: h } = params;
      if (a <= 0 || b <= 0 || h <= 0) {
        return { isValid: false, errorMessage: 'Hai đáy và chiều cao phải lớn hơn 0.', perimeter: 0, area: 0, formulas: [] };
      }
      const dx = Math.abs(a - b) / 2;
      const leg = Math.sqrt(h * h + dx * dx);
      const perimeter = a + b + 2 * leg;
      const area = 0.5 * (a + b) * h;
      const diag = Math.sqrt(h * h + Math.pow((a + b) / 2, 2));

      return {
        isValid: true,
        perimeter,
        area,
        diagonals: [diag, diag],
        heights: [h],
        formulas: [
          { label: 'Cạnh bên (c)', formula: 'c = √(h² + ((a - b)/2)²)', value: `${leg.toFixed(2)} cm` },
          { label: 'Chu vi (P)', formula: 'P = a + b + 2c', value: `${perimeter.toFixed(2)} cm` },
          { label: 'Diện tích (S)', formula: 'S = ((a + b) · h) / 2', value: `${area.toFixed(2)} cm²` },
          { label: 'Đường chéo (d)', formula: 'd = √(h² + ((a + b)/2)²)', value: `${diag.toFixed(2)} cm` }
        ]
      };
    }

    case 'circle': {
      const { circleRadius: R, sectorAngle: deg } = params;
      if (R <= 0) {
        return { isValid: false, errorMessage: 'Bán kính hình tròn phải lớn hơn 0.', perimeter: 0, area: 0, formulas: [] };
      }
      const perimeter = 2 * Math.PI * R;
      const area = Math.PI * R * R;
      const arcLength = (perimeter * deg) / 360;
      const sectorArea = (area * deg) / 360;

      return {
        isValid: true,
        perimeter,
        area,
        outRadius: R,
        formulas: [
          { label: 'Chu vi (C)', formula: 'C = 2 · π · R', value: `${perimeter.toFixed(2)} cm` },
          { label: 'Diện tích (S)', formula: 'S = π · R²', value: `${area.toFixed(2)} cm²` },
          { label: 'Đường kính (d)', formula: 'd = 2R', value: `${(2 * R).toFixed(2)} cm` },
          ...(deg < 360
            ? [
                { label: `Độ dài cung (${deg}°)`, formula: 'l = (π · R · n) / 180', value: `${arcLength.toFixed(2)} cm` },
                { label: `Diện tích quạt tròn (${deg}°)`, formula: 'S_quạt = (π · R² · n) / 360', value: `${sectorArea.toFixed(2)} cm²` }
              ]
            : [])
        ]
      };
    }

    case 'regular_polygon': {
      const { polygonSides: n, polygonRadius: R } = params;
      if (n < 3 || R <= 0) {
        return { isValid: false, errorMessage: 'Số cạnh phải ≥ 3 và bán kính > 0.', perimeter: 0, area: 0, formulas: [] };
      }
      const halfAngle = Math.PI / n;
      const side = 2 * R * Math.sin(halfAngle);
      const apothem = R * Math.cos(halfAngle); // inradius
      const perimeter = n * side;
      const area = 0.5 * perimeter * apothem;
      const interiorAngle = ((n - 2) * 180) / n;
      const centralAngle = 360 / n;

      return {
        isValid: true,
        perimeter,
        area,
        inRadius: apothem,
        outRadius: R,
        formulas: [
          { label: 'Độ dài một cạnh (a)', formula: 'a = 2R · sin(180°/n)', value: `${side.toFixed(2)} cm` },
          { label: 'Chu vi (P)', formula: 'P = n · a', value: `${perimeter.toFixed(2)} cm` },
          { label: 'Trung đoạn / Bán kính nội tiếp (r)', formula: 'r = R · cos(180°/n)', value: `${apothem.toFixed(2)} cm` },
          { label: 'Diện tích (S)', formula: 'S = 1/2 · P · r = (n/2)·R²·sin(360°/n)', value: `${area.toFixed(2)} cm²` },
          { label: 'Góc ở tâm', formula: 'γ = 360° / n', value: `${centralAngle.toFixed(1)}°` },
          { label: 'Góc trong mỗi đỉnh', formula: 'α = ((n - 2) · 180°) / n', value: `${interiorAngle.toFixed(1)}°` }
        ]
      };
    }
  }
}

// Generate normalized polygon vertices for 2D rendering
export function get2DShapeVertices(type: Shape2DType, params: Shape2DParams): {
  points: Point[];
  labels: string[];
  heightLine?: { p1: Point; p2: Point; label: string };
  rightAngles?: Point[][]; // triplets for right angle markers: [prev, corner, next]
  auxiliaryCircles?: { center: Point; radius: number; isOut?: boolean }[];
} {
  switch (type) {
    case 'triangle_scalene': {
      const { a, b, c } = params;
      if (a + b <= c || a + c <= b || b + c <= a) {
        return { points: [], labels: [] };
      }
      // B at (0, 0), C at (a, 0)
      const cosB = (a * a + c * c - b * b) / (2 * a * c);
      const sinB = Math.sqrt(Math.max(0, 1 - cosB * cosB));
      const Ax = c * cosB;
      const Ay = c * sinB;
      
      const pB: Point = { x: 0, y: 0 };
      const pC: Point = { x: a, y: 0 };
      const pA: Point = { x: Ax, y: Ay };

      // Height from A to BC
      const pH: Point = { x: Ax, y: 0 };

      return {
        points: [pA, pB, pC],
        labels: ['A', 'B', 'C'],
        heightLine: { p1: pA, p2: pH, label: 'ha' },
        rightAngles: [[pA, pH, pC]]
      };
    }

    case 'triangle_right': {
      const { legA: a, legB: b } = params;
      // Right angle at B (0, 0). Leg b on x-axis (B to C), leg a on y-axis (B to A).
      const pB: Point = { x: 0, y: 0 };
      const pC: Point = { x: b, y: 0 };
      const pA: Point = { x: 0, y: a };
      
      // Altitude to hypotenuse
      const c = Math.sqrt(a * a + b * b);
      const t = (b * b) / (c * c);
      const pH: Point = { x: (1 - t) * 0 + t * b, y: (1 - t) * a + t * 0 };

      return {
        points: [pA, pB, pC],
        labels: ['A', 'B', 'C'],
        rightAngles: [
          [pA, pB, pC],
          [pB, pH, pC]
        ],
        heightLine: { p1: pB, p2: pH, label: 'h' }
      };
    }

    case 'square': {
      const a = params.squareSide;
      return {
        points: [
          { x: 0, y: 0 },
          { x: a, y: 0 },
          { x: a, y: a },
          { x: 0, y: a }
        ],
        labels: ['A', 'B', 'C', 'D'],
        rightAngles: [
          [{ x: 0, y: a }, { x: 0, y: 0 }, { x: a, y: 0 }]
        ]
      };
    }

    case 'rectangle': {
      const { rectWidth: a, rectHeight: b } = params;
      return {
        points: [
          { x: 0, y: 0 },
          { x: a, y: 0 },
          { x: a, y: b },
          { x: 0, y: b }
        ],
        labels: ['A', 'B', 'C', 'D'],
        rightAngles: [
          [{ x: 0, y: b }, { x: 0, y: 0 }, { x: a, y: 0 }]
        ]
      };
    }

    case 'parallelogram': {
      const { paraA: a, paraB: b, paraAngle: alphaDeg } = params;
      const alphaRad = (alphaDeg * Math.PI) / 180;
      const dx = b * Math.cos(alphaRad);
      const dy = b * Math.sin(alphaRad);

      const pA: Point = { x: 0, y: 0 };
      const pB: Point = { x: a, y: 0 };
      const pC: Point = { x: a + dx, y: dy };
      const pD: Point = { x: dx, y: dy };
      const pH: Point = { x: dx, y: 0 };

      return {
        points: [pA, pB, pC, pD],
        labels: ['A', 'B', 'C', 'D'],
        heightLine: { p1: pD, p2: pH, label: 'h' },
        rightAngles: [[pD, pH, pB]]
      };
    }

    case 'rhombus': {
      const { rhombusSide: a, rhombusAngle: alphaDeg } = params;
      const alphaRad = (alphaDeg * Math.PI) / 180;
      const dx = a * Math.cos(alphaRad);
      const dy = a * Math.sin(alphaRad);

      return {
        points: [
          { x: 0, y: 0 },
          { x: a, y: 0 },
          { x: a + dx, y: dy },
          { x: dx, y: dy }
        ],
        labels: ['A', 'B', 'C', 'D']
      };
    }

    case 'trapezoid_isosceles': {
      const { trapBaseA: a, trapBaseB: b, trapHeight: h } = params;
      const dx = (a - b) / 2;
      const pA: Point = { x: 0, y: 0 };
      const pB: Point = { x: a, y: 0 };
      const pC: Point = { x: a - dx, y: h };
      const pD: Point = { x: dx, y: h };
      const pH: Point = { x: dx, y: 0 };

      return {
        points: [pA, pB, pC, pD],
        labels: ['A', 'B', 'C', 'D'],
        heightLine: { p1: pD, p2: pH, label: 'h' },
        rightAngles: [[pD, pH, pB]]
      };
    }

    case 'circle': {
      // Return 0 points for polygon, handled specially in canvas
      return {
        points: [{ x: 0, y: 0 }],
        labels: ['O']
      };
    }

    case 'regular_polygon': {
      const { polygonSides: n, polygonRadius: R } = params;
      const points: Point[] = [];
      const labels: string[] = [];
      for (let i = 0; i < n; i++) {
        // Start from top
        const angle = -Math.PI / 2 + (i * 2 * Math.PI) / n;
        points.push({
          x: R * Math.cos(angle),
          y: R * Math.sin(angle)
        });
        labels.push(String.fromCharCode(65 + (i % 26)));
      }
      return { points, labels };
    }
  }
}
