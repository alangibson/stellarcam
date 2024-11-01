import { cubicCurveDirection } from './cubic-curve.function';
import { DirectionEnum } from '../geometry.enum';
import { PointProperties } from '../point/point';

test('cubicCurveDirection CW', () => {
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

test('cubicCurveDirection CCW', () => {
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