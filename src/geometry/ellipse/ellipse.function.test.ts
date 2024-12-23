import { EllipseProperties } from "./ellipse";
import { ellipseIsClosed, ellipseMiddlePoint, ellipseToCubicCurves } from "./ellipse.function";

test("ellipseIsClosed -> true because full sweep", () => {
  // Given
  const startAngle = 0;
  const endAngle = 2 * Math.PI;
  // When
  const isClosed = ellipseIsClosed(startAngle, endAngle);
  // Then
  expect(isClosed).toBe(true);
});

test("ellipseIsClosed -> false because no arc sweep", () => {
  // Given
  const startAngle = Math.PI;
  const endAngle = Math.PI;
  // When
  const isClosed = ellipseIsClosed(startAngle, endAngle);
  // Then
  expect(isClosed).toBe(false);
});

test("ellipseIsClosed -> false", () => {
  // Given
  const startAngle = 1.286463370861387;
  const endAngle = 4.502415467522527;
  // When
  const isClosed = ellipseIsClosed(startAngle, endAngle);
  // Then
  expect(isClosed).toBe(false);
});

test("ellipseToCubicCurve open", () => {
  // Given
  const cx = -130;
  const cy = 290;
  const rx = 90.00000000000001; // majorX
  const ry = 75.00000000000001; // majorY
  const axisRatio = 0.3224043715846993;
  const startAngle = 1.286463370861387;
  const endAngle = 4.502415467522527;
  // When
  const curves = ellipseToCubicCurves({
    center: {x: cx, y: cy},
    focus: { x: rx, y: ry},
    axisRatio,
    startAngle,
    endAngle,
  });
  // Then
  expect(curves.length).toBe(3);
  // console.log(curves);
});

test("ellipseToCubicCurve closed", () => {
  // Given
  const cx = -130;
  const cy = 290;
  const rx = 90.00000000000001; // majorX
  const ry = 75.00000000000001; // majorY
  const axisRatio = 0.3224043715846993;
  const startAngle = 0;
  const endAngle = 2 * Math.PI;
  // When
  const curves = ellipseToCubicCurves({
    center: {x: cx, y: cy},
    focus: { x: rx, y: ry},
    axisRatio,
    startAngle,
    endAngle,
  });
  // TODO Then
  // console.log(curves);
  // expect(curves.length).toBe(5);
});

test('ellipseMiddlePoint', () => {
  // Given
  const ellipse: EllipseProperties = {
    center: { x: 0, y: 0 },
    focus: { x: 5, y: 0 },
    axisRatio: 0.5,
    startAngle: 0,
    endAngle: Math.PI / 2,
  };
  // When
  const midpoint = ellipseMiddlePoint(ellipse);
  // Then
  expect(midpoint).toStrictEqual({ x: 3.5355339059327378, y: 1.7677669529663687 });
});

// test('estimateSegmentCount', () => {
//     // Given
//     // const startAngle = 0;
//     // const endAngle = 2 * Math.PI;
//     const maxError = 0.5;
//     const angleRange = 2 * Math.PI; // full circle
//     // When
//     const count = estimateSegmentCount(1, 1, angleRange, maxError)
//     // Then
//     expect(count).toBe(4);
// });

// test('estimateSegmentCount', () => {
//     // Given
//     const startAngle = 1.286463370861387;
//     const endAngle = 4.502415467522527;
//     const angleRange = ellipseAngleRange(startAngle, endAngle);
//     const maxError = 0.5;
//     // When
//     const count = estimateSegmentCount(1, 1, angleRange, maxError)
//     // Then
//     expect(count).toBe(4);
// });
