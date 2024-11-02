import { rectangleCentroid } from "./rectangle.function";
import { Point, PointProperties } from "../point/point";
import { Shape } from "../shape";
import { GeometryTypeEnum, MirrorEnum, DirectionEnum } from "../geometry.enum";

export interface RectangleProperties {
  startPoint: PointProperties; // min
  endPoint: PointProperties; // max
}

export class Rectangle extends Shape {

  type: GeometryTypeEnum = GeometryTypeEnum.RECTANGLE;

  startPoint: Point;
  endPoint: Point;

  constructor({startPoint, endPoint}: RectangleProperties) {
    super();
    this.startPoint = new Point(startPoint);
    this.endPoint = new Point(endPoint);
  }

  get centroid(): Point {
    const pointdef: PointProperties = rectangleCentroid(
      this.startPoint.x,
      this.startPoint.y,
      this.endPoint.x,
      this.endPoint.y,
    );
    return new Point(pointdef);
  }

  get boundary(): Rectangle {
    return this;
  }

  get direction(): DirectionEnum {
    // TODO is it OK to assume this?
    return DirectionEnum.CW;
  }

  get command(): string {
    // We don't use this shape for rendering
    throw new Error("Method not implemented.");
  }

  join(boundary: Rectangle) {
    this.startPoint.x = Math.min(
      this.startPoint.x,
      this.endPoint.x,
      boundary.startPoint.x,
      boundary.endPoint.x,
    );
    this.startPoint.y = Math.min(
      this.startPoint.y,
      this.endPoint.y,
      boundary.startPoint.y,
      boundary.endPoint.y,
    );
    this.endPoint.x = Math.min(
      this.startPoint.x,
      this.endPoint.x,
      boundary.startPoint.x,
      boundary.endPoint.x,
    );
    this.endPoint.y = Math.min(
      this.startPoint.y,
      this.endPoint.y,
      boundary.startPoint.y,
      boundary.endPoint.y,
    );
  }

  mirror(mirror: MirrorEnum, axisValue: number) {
    throw new Error("Method not implemented.");
  }

  translate(dx: number, dy: number) {
    throw new Error("Method not implemented.");
  }

  rotate(center: PointProperties, angle: number) {
    throw new Error("Method not implemented.");
  }

  reverse() {
    throw new Error("Method not implemented.");
  }
}