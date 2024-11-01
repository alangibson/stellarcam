import { rectangleCentroid } from './boundary.function';

test('rectangleCentroid', () => {
    // Given
    const p1 = { x: 0, y: 0 };
    const p2 = { x: 4, y: 4 };
    // When
    const centroid = rectangleCentroid(p1.x, p1.y, p2.x, p2.y);
    // Then
    expect(centroid.x).toBe(2);
    expect(centroid.y).toBe(2);
});