import { ArcProperties } from "./arc";
import { arcOrientation, arcSweep, rotateArc, transformArc } from "../arc/arc.function";
import { DirectionEnum } from "../geometry.enum";

const PI = Math.PI;
const HALFPI = PI / 2;

test("arcSweep CCW 90 -> 270", () => {
  expect(arcSweep(HALFPI, HALFPI * 3)).toBe(PI);
});

test("arcSweep CW 90 -> 270", () => {
  expect(arcSweep(-HALFPI, -HALFPI * 3)).toBe(-PI);
});

// TODO Clockwise (CW) tests

// test('arcOrientation: 0 -> -PI', () => {
//     expect(arcOrientation(0, -PI)).toBe(DirectionEnum.CW);
// });

// test('arcOrientation: 0 -> -HALFPI*3', () => {
//     expect(arcOrientation(0, -HALFPI*3)).toBe(DirectionEnum.CW);
// });

// Counterclockwise (CCW)

test("arcOrientation", () => {
  expect(arcOrientation(-HALFPI * 3, -PI)).toBe(DirectionEnum.CCW);
});

test("arcOrientation", () => {
  expect(arcOrientation(-HALFPI, 0)).toBe(DirectionEnum.CCW);
});

test("arcOrientation", () => {
  expect(arcOrientation(-PI, -HALFPI)).toBe(DirectionEnum.CCW);
});

test("arcOrientation: 0 -> PI", () => {
  expect(arcOrientation(0, PI)).toBe(DirectionEnum.CCW);
});

test("arcOrientation", () => {
  expect(arcOrientation(-PI, 0)).toBe(DirectionEnum.CCW);
});

test("rotateArc", () => {
  // Given
  const x = 100;
  const y = 100;
  const radius = 50;
  const startAngle = 0;
  const endAngle = Math.PI;
  const centerX = 50;
  const centerY = 50;
  const angle = Math.PI / 4;
  // When
  const arcdef: ArcProperties = rotateArc(
    x,
    y,
    radius,
    startAngle,
    endAngle,
    centerX,
    centerY,
    angle,
  );
  // Then
  expect(arcdef.center.x).toBeCloseTo(50);
  expect(arcdef.center.y).toBe(120.71067811865476);
  expect(arcdef.radius).toBe(50);
  expect(arcdef.startAngle).toBe(0.7853981633974483);
  expect(arcdef.endAngle).toBe(3.9269908169872414);
});

test('transformArc', () => {
  // Given
  // Define the 3x3 transformation matrix (e.g., scale and translate)
  const matrix = [
    1, 0, 50,  // a, b, c
    0, 1, 50,  // d, e, f
    0, 0, 1    // g, h, i (usually 0, 0, 1 in 2D transformations)
  ];
  const arc: ArcProperties = {
    center: {x:100, y:100},
    radius: 50,
    startAngle: 0,
    endAngle: Math.PI / 2
  };
  // When
  const transformedArc = transformArc(arc, matrix);
  // TODO Then
  expect(transformedArc.center.x).toBe(150);
  expect(transformedArc.center.y).toBe(150);
  expect(transformedArc.radius).toBe(arc.radius);
  expect(transformedArc.startAngle).toBe(arc.startAngle);
  expect(transformedArc.endAngle).toBe(arc.endAngle);
});