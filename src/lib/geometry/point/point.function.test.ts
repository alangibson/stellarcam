import { angleBetweenPoints, distanceBetweenPoints, transformPoint } from './point.function';

test('angleBetweenPoints north', () => {
	expect(angleBetweenPoints(1, 1, 1, 10)).toBe(0);
});

test('angleBetweenPoints east', () => {
	expect(angleBetweenPoints(1, 1, 10, 1)).toBe(90);
});

test('angleBetweenPoints south', () => {
	expect(angleBetweenPoints(1, 10, 1, 1)).toBe(180);
});

test('angleBetweenPoints west', () => {
	expect(angleBetweenPoints(10, 1, 1, 1)).toBe(270);
});

test('distanceBetweenPoints negative mirrored', () => {
	// Given
	const p1 = { x: -60.0, y: -74.00000000000009 };
	const p2 = { x: 60.0, y: -74.00000000000006 };
	// When
	const distance = distanceBetweenPoints(p1.x, p1.y, p2.x, p2.y);
	// TODO Then
	expect(distance).toBe(120.0);
});

test('transformPoint', () => {
	// Given
	const point = { x: 10, y: 20 };
	// Define a 3x3 transformation matrix (e.g., translate by 50 in x and 30 in y)
	const matrix = [
		1,
		0,
		50, // a, b, c
		0,
		1,
		30, // d, e, f
		0,
		0,
		1 // g, h, i (usually 0, 0, 1 in 2D transformations)
	];
	// When
	const transformedPoint = transformPoint(point, matrix);
	// Then
	expect(transformedPoint.x).toBe(60);
	expect(transformedPoint.y).toBe(50);
});
