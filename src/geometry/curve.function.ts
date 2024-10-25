import { DirectionEnum } from "./geometry.enum";
import { Point } from "./point";

export function cubicBezierBoundingBox(p0: Point, p1: Point, p2: Point, p3: Point) {
    // The bezier(t) function computes the point on the 
    // curve for a given parameter t (from 0 to 1).
    function bezier(t) {
        const x = Math.pow(1 - t, 3) * p0.x +
            3 * Math.pow(1 - t, 2) * t * p1.x +
            3 * (1 - t) * Math.pow(t, 2) * p2.x +
            Math.pow(t, 3) * p3.x;

        const y = Math.pow(1 - t, 3) * p0.y +
            3 * Math.pow(1 - t, 2) * t * p1.y +
            3 * (1 - t) * Math.pow(t, 2) * p2.y +
            Math.pow(t, 3) * p3.y;

        return [x, y];
    }

    //  initialize the bounding box coordinates using the control points.
    let minX = Math.min(p0.x, p1.x, p2.x, p3.x);
    let maxX = Math.max(p0.x, p1.x, p2.x, p3.x);
    let minY = Math.min(p0.y, p1.y, p2.y, p3.y);
    let maxY = Math.max(p0.y, p1.y, p2.y, p3.y);

    // By incrementing t in small steps (in this case, 0.01), 
    // we evaluate points on the curve and update the bounding box accordingly.
    for (let t = 0; t <= 1; t += 0.01) {
        const point = bezier(t);
        minX = Math.min(minX, point[0]);
        maxX = Math.max(maxX, point[0]);
        minY = Math.min(minY, point[1]);
        maxY = Math.max(maxY, point[1]);
    }

    // Return the bounding box as an object
    return {
        minX: minX,
        minY: minY,
        maxX: maxX,
        maxY: maxY
    };
}

export function quadraticBezierBoundingBox(p0: Point, p1: Point, p2: Point) {
    // Function to evaluate the quadratic Bezier curve at a given t
    function bezier(t) {
        const x = Math.pow(1 - t, 2) * p0.x +
            2 * (1 - t) * t * p1.x +
            Math.pow(t, 2) * p2.x;

        const y = Math.pow(1 - t, 2) * p0.y +
            2 * (1 - t) * t * p1.y +
            Math.pow(t, 2) * p2.y;

        return [x, y];
    }

    // Initialize bounding box coordinates
    let minX = Math.min(p0.x, p1.x, p2.x);
    let maxX = Math.max(p0.x, p1.x, p2.x);
    let minY = Math.min(p0.y, p1.y, p2.y);
    let maxY = Math.max(p0.y, p1.y, p2.y);

    // Check for critical points
    for (let t = 0; t <= 1; t += 0.01) {
        const point = bezier(t);
        minX = Math.min(minX, point[0]);
        maxX = Math.max(maxX, point[0]);
        minY = Math.min(minY, point[1]);
        maxY = Math.max(maxY, point[1]);
    }

    // Return the bounding box as an object
    return {
        minX: minX,
        minY: minY,
        maxX: maxX,
        maxY: maxY
    };
}

export function cubicBezierOrientation(P0, P1, P2, P3): DirectionEnum {
    // Calculate the direction vectors
    const v1 = { x: P1.x - P0.x, y: P1.y - P0.y };
    const v2 = { x: P3.x - P2.x, y: P3.y - P2.y };
    
    // Calculate the cross product of v1 and v2
    const crossProduct = v1.x * v2.y - v1.y * v2.x;

    // Determine orientation
    if (crossProduct > 0) {
        return DirectionEnum.CCW;
    } else if (crossProduct < 0) {
        return DirectionEnum.CW;
    } else {
        console.log("Collinear or Straight Line");
    }
}

export function quadraticBezierOrientation(P0, P1, P2): DirectionEnum {
    // Calculate direction vectors
    const v1 = { x: P1.x - P0.x, y: P1.y - P0.y };
    const v2 = { x: P2.x - P1.x, y: P2.y - P1.y };
    
    // Calculate the cross product of v1 and v2
    const crossProduct = v1.x * v2.y - v1.y * v2.x;

    // Determine orientation
    if (crossProduct > 0) {
        return DirectionEnum.CCW;
    } else if (crossProduct < 0) {
        return DirectionEnum.CW;
    } else {
        console.log("Collinear or Straight Line");
    }
}