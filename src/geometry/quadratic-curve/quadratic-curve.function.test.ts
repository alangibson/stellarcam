import { QuadraticCurveProperties } from "./quadratic-curve";
import { transformQuadraticCurve } from "./quadratic-curve.function";

test('transformQuadraticCurve', () => {
    // Given
    const curve: QuadraticCurveProperties = {
        startPoint: { x: 50, y: 50 },
        control1: { x: 150, y: 50 },
        endPoint: { x: 100, y: 150 }
    }
    // scale the curve by a factor of 1.5 and translate it by (100, 50).
    const scaleX = 1.5;
    const scaleY = 1.5;
    const translateX = 100;
    const translateY = 50;
    const rotationAngle = 30 * (Math.PI / 180); // Convert 30 degrees to radians
    // Compute transformation matrix components
    const cosTheta = Math.cos(rotationAngle); // ≈ 0.8660
    const sinTheta = Math.sin(rotationAngle); // ≈ 0.5
    const a = scaleX * cosTheta;  // a = scaleX * cos(θ) ≈ 1.2990
    const b = -sinTheta;          // b = -sin(θ) = -0.5
    const c = translateX;         // c = translateX = 100
    const d = sinTheta;           // d = sin(θ) = 0.5
    const e = scaleY * cosTheta;  // e = scaleY * cos(θ) ≈ 1.2990
    const f = translateY;         // f = translateY = 50
    const matrix = [a, b, c, d, e, f];
    // When
    const transformedCurve = transformQuadraticCurve(curve, matrix);
    // Then
    expect(transformedCurve.startPoint).toStrictEqual({ x: 139.9519052838329, y: 139.9519052838329 });
    expect(transformedCurve.control1).toStrictEqual({ x: 269.8557158514987, y: 189.9519052838329 });
    expect(transformedCurve.endPoint).toStrictEqual({ x: 154.9038105676658, y: 294.8557158514987 });
});