import { Rectangle } from "./rectangle/rectangle";
import { GeometryTypeEnum, MirrorEnum } from "./geometry.enum";
import { Point, PointProperties } from "./point/point";

export interface Geometry {
  type: GeometryTypeEnum;
  // Bounding box for this shape
  boundary: Rectangle;
  startPoint: Point;
  endPoint: Point;
  command: string;

  mirror(mirror: MirrorEnum, axisValue: number);
  translate(dx: number, dy: number);
  rotate(center: PointProperties, angle: number);
}
