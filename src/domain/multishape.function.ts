import { DirectionEnum } from "../geometry/geometry.enum";
import { Shape } from "../geometry/shape";

export function sortShapesInDirection(shapes: Shape[], direction: DirectionEnum): Shape[] {

    // Function to generate a key for a point with rounding to handle floating point inaccuracies
    function getPointKey(point) {
        const x = point.x.toFixed(6);
        const y = point.y.toFixed(6);
        return `${x},${y}`;
    }

    // Step 1: Collect unique points and calculate centroid
    const pointMap = new Map();
    let sumX = 0;
    let sumY = 0;
    shapes.forEach((shape) => {
        [shape.start_point, shape.end_point].forEach((point) => {
            const key = getPointKey(point);
            if (!pointMap.has(key)) {
                pointMap.set(key, { point, key });
                sumX += point.x;
                sumY += point.y;
            }
        });
    });
    const points = Array.from(pointMap.values());
    const centroidX = sumX / pointMap.size;
    const centroidY = sumY / pointMap.size;

    // Step 2: Compute angles for each point
    points.forEach((p) => {
        p.angle = Math.atan2(p.point.y - centroidY, p.point.x - centroidX);
    });

    // Step 3: Sort points based on angle
    points.sort((a, b) => {
        if (direction === DirectionEnum.CW) {
            return b.angle - a.angle;
        } else {
            return a.angle - b.angle;
        }
    });

    // Step 4: Map shapes between points
    const shapeMap = new Map();
    shapes.forEach((shape) => {
        const startKey = getPointKey(shape.start_point);
        const endKey = getPointKey(shape.end_point);
        const keyForward = `${startKey}->${endKey}`;
        const keyBackward = `${endKey}->${startKey}`;
        shapeMap.set(keyForward, { shape, reverse: false });
        shapeMap.set(keyBackward, { shape, reverse: true });
    });

    // Step 5: Build sorted list of shapes
    const sortedShapes = [];
    const n = points.length;
    for (let i = 0; i < n; i++) {
        const pointA = points[i];
        const pointB = points[(i + 1) % n]; // Wrap around to form a loop
        const keyAB = `${pointA.key}->${pointB.key}`;
        const keyBA = `${pointB.key}->${pointA.key}`;
        if (shapeMap.has(keyAB)) {
            const { shape } = shapeMap.get(keyAB);
            sortedShapes.push(shape);
        } else if (shapeMap.has(keyBA)) {
            const { shape } = shapeMap.get(keyBA);
            // Reverse the shape to maintain direction
            const reversedShape = { start: shape.end, end: shape.start };
            sortedShapes.push(reversedShape);
        } else {
            throw new Error(
                `No shape connects point ${pointA.key} to point ${pointB.key}`
            );
        }
    }

    return sortedShapes;
}