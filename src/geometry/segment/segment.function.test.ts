import { DirectionEnum } from "../geometry.enum";
import { segmentDirection } from "./segment.function";

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
