// import { Rectangle } from "./rectangle/rectangle";
import { GeometryTypeEnum, MirrorEnum } from './geometry.enum';
import { Point } from './point/point';
import { type PointProperties } from './point/point.interface';
// import type { RectangleProperties } from "./rectangle/rectangle.interface";

export interface Geometry {
	type: GeometryTypeEnum;
	startPoint: Point;
	endPoint: Point;
	command: string;

	mirror(mirror: MirrorEnum, axisValue: number): void;
	translate(dx: number, dy: number): void;
	rotate(center: PointProperties, angle: number): void;
	transform(matrix: number[]): void;
}
