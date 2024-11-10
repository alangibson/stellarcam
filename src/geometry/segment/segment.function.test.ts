import { degreesToRadians } from '../arc/arc.function';
import { DirectionEnum } from "../geometry.enum";
import { SegmentProperties } from "./segment";
import { segmentDirection, segmentMiddlePoint, transformSegment } from "./segment.function";

test("segmentDirection vertical upwards", () => {
  // Given
  const startPoint = { x: 0, y: 0 };
  const endPoint = { x: 0, y: 1 };
  // When
  const direction = segmentDirection(startPoint, endPoint);
  // Then
  expect(direction).toBe(DirectionEnum.CW);
});

test("segmentDirection vertical downward", () => {
  // Given
  const endPoint = { x: 0, y: 0 };
  const startPoint = { x: 0, y: 1 };
  // When
  const direction = segmentDirection(startPoint, endPoint);
  // Then
  expect(direction).toBe(DirectionEnum.CCW);
});

test("segmentDirection horizontal rightward", () => {
  // Given
  const startPoint = { x: 0, y: 1 };
  const endPoint = { x: 1, y: 1 };

  // When
  const direction = segmentDirection(startPoint, endPoint);
  // Then
  expect(direction).toBe(DirectionEnum.CW);
});

test("segmentDirection horizontal leftward", () => {
  // Given
  const endPoint = { x: 0, y: 1 };
  const startPoint = { x: 1, y: 1 };

  // When
  const direction = segmentDirection(startPoint, endPoint);
  // Then
  expect(direction).toBe(DirectionEnum.CW);
});

test('transformSegment translate', () => {
  // Given
  const segment: SegmentProperties = {
    startPoint: { x: 50, y: 50 },
    endPoint: { x: 150, y: 100 }
  };
  const translateX = 50;
  const translateY = 30;
  const matrix = [
      1, 0, translateX, // a, b, c
      0, 1, translateY, // d, e, f
  ];
  // When
  const transformedSegment = transformSegment(segment, matrix);
  // Then
  expect(transformedSegment.startPoint).toStrictEqual({ x: 100, y: 80 });
  expect(transformedSegment.endPoint).toStrictEqual({ x: 200, y: 130 });
});

test('transformSegment scale, rotate, translate', () => {
  // Given
  const segment: SegmentProperties = {
    startPoint: { x: 50, y: 50 },
    endPoint: { x: 150, y: 100 }
  };
  const scaleX = 1.5;
  const scaleY = 2;
  const rotationAngle = degreesToRadians(30);
  const translateX = 100;
  const translateY = 50;
  const cosA = Math.cos(rotationAngle); // ≈ 0.8660
  const sinA = Math.sin(rotationAngle); // ≈ 0.5
  const a = scaleX * cosA;              // a ≈ 1.2990
  const b = -sinA;                      // b = -0.5
  const c = translateX;                 // c = 100
  const d = sinA;                       // d = 0.5
  const e = scaleY * cosA;              // e ≈ 1.7321
  const f = translateY;                 // f = 50
  const matrix = [a, b, c, d, e, f];
  // When
  const transformedSegment = transformSegment(segment, matrix);
  // Then
  expect(transformedSegment.startPoint).toStrictEqual({ x: 139.9519052838329, y: 161.60254037844388 });
  expect(transformedSegment.endPoint).toStrictEqual({ x: 244.8557158514987, y: 298.20508075688775 });
});

test('segmentMiddlePoint', () => {
  // Given
  const segment: SegmentProperties = {
    startPoint: { x: 2, y: 3 },
    endPoint: { x: 8, y: 7 }
  };
  // When
  const midpoint = segmentMiddlePoint(segment);
  // Then
  expect(midpoint).toStrictEqual({ x: 5, y: 5 });
});