import { cubicCurveDirection, transformCubicCurve } from "./cubic-curve.function";
import { DirectionEnum } from "../geometry.enum";
import { PointProperties } from "../point/point";
import { CubicCurveProperties } from "./cubic-curve";

test("cubicCurveDirection CW", () => {
  // Given
  // Clockwise example: a curve that goes in a clockwise direction
  const P0: PointProperties = { x: 0, y: 0 };
  const P1: PointProperties = { x: 1, y: -2 };
  const P2: PointProperties = { x: 2, y: -1 };
  const P3: PointProperties = { x: 3, y: 3 };
  const samples = 100;
  // When
  const direction: DirectionEnum = cubicCurveDirection(P0, P1, P2, P3, samples);
  // Then
  expect(direction).toBe(DirectionEnum.CCW);
});

test("cubicCurveDirection CCW", () => {
  // Given
  const P0 = { x: 0, y: 0 };
  const P1 = { x: 1, y: 2 };
  const P2 = { x: 2, y: -1 };
  const P3 = { x: 3, y: 0 };
  const samples = 100;
  // When
  const direction: DirectionEnum = cubicCurveDirection(P0, P1, P2, P3, samples);
  // Then
  expect(direction).toBe(DirectionEnum.CW);
});

test('transformCubicCurve', () => {
  // Given
  const curve: CubicCurveProperties = {
    startPoint: { x: 50, y: 50 },
    control1: { x: 150, y: 50 },
    control2: { x: 150, y: 150 },
    endPoint: { x: 50, y: 150 }
  };
  // scale the curve by a factor of 2 and translate it by (100, 50).
  const scaleX = 2;
  const scaleY = 2;
  const translateX = 100;
  const translateY = 50;
  const a = scaleX;
  const b = 0;
  const c = translateX;
  const d = 0;
  const e = scaleY;
  const f = translateY;
  const matrix = [a, b, c, d, e, f, 0, 0, 1];
  // When
  const transformedCubicCurve = transformCubicCurve(curve, matrix);
  // Then
  expect(transformedCubicCurve.startPoint).toStrictEqual({ x: 200, y: 150 });
  expect(transformedCubicCurve.control1).toStrictEqual({ x: 400, y: 150 });
  expect(transformedCubicCurve.control2).toStrictEqual({ x: 400, y: 350 });
  expect(transformedCubicCurve.endPoint).toStrictEqual({ x: 200, y: 350 });
});

// test('mirrorCubicCurve', () => {
// TODO
//     // Example usage:
// const bezierCurve = [
//     { x: 1, y: 2 }, // P0
//     { x: 2, y: 3 }, // P1
//     { x: 3, y: 4 }, // P2
//     { x: 4, y: 5 }, // P3
//   ];
//   const mirroredCurve = mirrorBezierCurve(bezierCurve, 2.5);
//   console.log(mirroredCurve);
//   /*
//   Output:
//   [
//     { x: 4, y: 2 },
//     { x: 3, y: 3 },
//     { x: 2, y: 4 },
//     { x: 1, y: 5 }
//   ]
//   */
// });

// TODO reverseCubicCurve
// Example usage:
// const bezierCurve = [
//     { x: 1, y: 2 }, // P0
//     { x: 2, y: 3 }, // P1
//     { x: 3, y: 4 }, // P2
//     { x: 4, y: 5 }, // P3
//   ];
//   const reversedCurve = reverseBezierCurve(bezierCurve);
//   console.log(reversedCurve);
//   /*
//   Output:
//   [
//     { x: 4, y: 5 }, // New P0
//     { x: 3, y: 4 }, // New P1
//     { x: 2, y: 3 }, // New P2
//     { x: 1, y: 2 }  // New P3
//   ]
//   */

// TODO translateCubicCurve
// Example usage:
// const bezierCurve = [
//     { x: 1, y: 2 }, // P0
//     { x: 2, y: 3 }, // P1
//     { x: 3, y: 4 }, // P2
//     { x: 4, y: 5 }, // P3
//   ];
//
//   const deltaX = 5;
//   const deltaY = -2;
//
//   const translatedCurve = translateBezierCurve(bezierCurve, deltaX, deltaY);
//   console.log(translatedCurve);
//   /*
//   Output:
//   [
//     { x: 6, y: 0 }, // P0 translated
//     { x: 7, y: 1 }, // P1 translated
//     { x: 8, y: 2 }, // P2 translated
//     { x: 9, y: 3 }  // P3 translated
//   ]
//   */
