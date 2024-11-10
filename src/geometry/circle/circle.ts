import { DirectionEnum, MirrorEnum } from "../geometry.enum";
import { Rectangle } from "../rectangle/rectangle";
import { circleBoundingBox, circlePath, rotateCircle, transformCircle } from "./circle.function";
import { GeometryTypeEnum, OriginEnum } from "../geometry.enum";
import { Point, PointProperties } from "../point/point";
import { Shape } from "../shape";

export interface CircleProperties {
  center: PointProperties;
  radius: number;
}

export class Circle extends Shape implements CircleProperties {

  type: GeometryTypeEnum = GeometryTypeEnum.CIRCLE;

  center: Point;
  radius: number;
  private _direction: DirectionEnum = DirectionEnum.CW;

  constructor({ center, radius }: CircleProperties) {
    super();
    this.center = new Point(center);
    this.radius = radius;
  }

  get boundary(): Rectangle {
    const { bottomLeft, topRight } = circleBoundingBox(
      this.center,
      this.radius,
    );
    return new Rectangle({ startPoint: bottomLeft, endPoint: topRight });
  }

  // Start point is always top center (ie 0 degrees).
  get startPoint(): Point {
    return new Point({
      x: this.center.x,
      y: this.center.y + this.radius,
    });
  }

  set startPoint(endPoint: Point) {
    // Noop because start point is always top center (ie 0 degrees).
    // TODO implement this because we need it to set optimal start point
  }

  // End point is always top center (ie 0 degrees).
  get endPoint(): Point {
    return this.startPoint;
  }

  set endPoint(endPoint: Point) {
    // Noop because end point is always top center (ie 0 degrees).
    // TODO implement this because we need it to set optimal start point
  }

  get angle_degrees(): number {
    return 360;
  }

  get direction(): DirectionEnum {
    return this._direction;
  }

  set direction(direction: DirectionEnum) {
    this._direction = direction;
  }

  get command(): string {
    let sweep_flag: number;
    if (this.direction == DirectionEnum.CW) sweep_flag = 1;
    else sweep_flag = 0;
    const large_arc_flag = 0; // large=1, small=0
    return circlePath(this.center, this.radius);
  }

  transform(matrix: number[]) {
    const transformed = transformCircle(this, matrix);
    this.center = new Point(transformed.center);
    this.radius = transformed.radius;
  }

  reverse() {
    // Noop
  }

  rotate(center: PointProperties, angle: number) {
    const circledef: CircleProperties = rotateCircle(
      this.center.x,
      this.center.y,
      this.radius,
      center.x,
      center.y,
      angle,
    );
    this.center = new Point(circledef.center);
  }

  mirror(mirror: MirrorEnum, axisValue: number = 0) {
    // TODO mirror center point
    this.center.mirror(mirror, axisValue);
  }

  translate(dx: number, dy: number) {
    this.center.translate(dx, dy);
  }
}
