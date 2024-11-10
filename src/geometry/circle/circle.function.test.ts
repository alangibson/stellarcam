import { CircleProperties } from './circle';
import { transformCircle } from './circle.function';

test('transformCircle translate and scale', () => {
    // Given
    const circle: CircleProperties = {
        center: {x: 100, y: 100},
        radius: 100
    };
    const matrix = [2, 0, 50, 0, 2, 30];
    // When
    const transformedCircle = transformCircle(circle, matrix);
    // Then
    expect(transformedCircle.center.x).toBe(250);
    expect(transformedCircle.center.y).toBe(230);
    expect(transformedCircle.radius).toBe(100); 
});

// TODO support transforming Circle into Ellipse?
// test('transformCircle into Ellipse', () => {
//       // Given
//     const circle: CircleProperties = {
//         center: {x: 100, y: 100},
//         radius: 100
//     };
//     // Define a transformation matrix (e.g., scale x by 2, rotate 30 degrees, and translate)
//     const angle = 30 * (Math.PI / 180); // Convert 30 degrees to radians
//     const scaleX = 2;
//     const scaleY = 1;
//     const translateX = 50;
//     const translateY = 30;
//     // Construct the transformation matrix components
//     const a = scaleX * Math.cos(angle);     // scale x axis
//     const b = -Math.sin(angle);             // rotate
//     const c = translateX;                   // translate x axis
//     const d = Math.sin(angle);              // rotate
//     const e = scaleY * Math.cos(angle);     // scale y axis
//     const f = translateY;                   // translate y axis
//     const matrix = [a, b, c, d, e, f];
//     // When
//     const transformedCircle = transformCircle(circle, matrix);
//     // Then
//     expect(transformedCircle.center.x).toBe(173.2);
//     expect(transformedCircle.center.y).toBe(166.6);
//     expect(transformedCircle.radius).toBe(circle);

//     // Final Result
//     // After applying the transformation:
//     // Transformed Center Point: 
//     // (173.2,166.6)
//     // Semi-major Axis (
//     // radiusX): Approximately 
//     // 90.24
//     // Semi-minor Axis (radiusY): 
//     // 50
//     // Rotation Angle: Approximately 
//     // 16.1∘
//     // (counterclockwise from the x-axis)
//     // The circle has been transformed into an ellipse with the above parameters.
// });