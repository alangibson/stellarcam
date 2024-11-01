import { PointProperties } from "../point/point";

export function rectangleCentroid(x1, y1, x2, y2): PointProperties {
    const xCentroid = (x1 + x2) / 2;
    const yCentroid = (y1 + y2) / 2;
    return { x: xCentroid, y: yCentroid };
}
