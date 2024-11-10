import { PointProperties } from "../point/point";
import { transformPoint } from "../point/point.function";
import { RectangleProperties } from "./rectangle";

export function rectangleCentroid(x1, y1, x2, y2): PointProperties {
  const xCentroid = (x1 + x2) / 2;
  const yCentroid = (y1 + y2) / 2;
  return { x: xCentroid, y: yCentroid };
}

export function joinRectangles(rect1: RectangleProperties, rect2: RectangleProperties): RectangleProperties {
  // Find the minimum and maximum x and y coordinates
  const startPointX = Math.min(rect1.startPoint.x, rect1.endPoint.x, rect2.startPoint.x, rect2.endPoint.x);
  const startPointY = Math.min(rect1.startPoint.y, rect1.endPoint.y, rect2.startPoint.y, rect2.endPoint.y);
  const endPointX = Math.max(rect1.startPoint.x, rect1.endPoint.x, rect2.startPoint.x, rect2.endPoint.x);
  const endPointY = Math.max(rect1.startPoint.y, rect1.endPoint.y, rect2.startPoint.y, rect2.endPoint.y);

  // Return the new rectangle that includes both rectangles
  return {
    startPoint: {
      x: startPointX,
      y: startPointY
    },
    endPoint: {
      x: endPointX,
      y: endPointY
    }
  }
}

export function transformRectangle(rect: RectangleProperties, matrix: number[]): RectangleProperties {
  return {
    startPoint: transformPoint(rect.startPoint, matrix),
    endPoint: transformPoint(rect.endPoint, matrix),
  };
}