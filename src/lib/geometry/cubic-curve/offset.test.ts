import { CubicCurve, CubicCurveBuilder, Point, offsetCubicCurve } from './offset';

test('offsetCubicCurve', () => {
	// Given
	const curve: CubicCurve = new CubicCurve(
		new Point(1, 10),
		new Point(3, 5),
		new Point(7, 5),
		new Point(10, 10)
	);
	const distance: number = 10;
	const maximumError: number = 1;
	// When
	const curves: CubicCurve[] = offsetCubicCurve(curve, distance, maximumError);
	// Then
	expect(curves.length).toBe(2);
});
