import { type Geometry } from '$lib/geometry/geometry';
import { DirectionEnum, GeometryTypeEnum, MirrorEnum } from '$lib/geometry/geometry.enum';
import { Point } from '$lib/geometry/point/point';
import { type PointProperties } from './point/point.interface';
import type { Boundary } from './boundary/boundary';

export abstract class Shape implements Geometry {
	// From geometry
	abstract type: GeometryTypeEnum;
	abstract boundary: Boundary;
	abstract startPoint: Point;
	abstract endPoint: Point;
	abstract command: string;
	abstract mirror(mirror: MirrorEnum, axisValue: number): void;
	abstract translate(dx: number, dy: number): void;
	abstract rotate(center: PointProperties, angle: number): void;
	abstract transform(matrix: number[]): void;
	// Defined on Shape
	abstract direction: DirectionEnum;
	// abstract offset(distance: number): Shape[];

	// Swap start and end points, at a minimum.
	// Implementing classes must also take care of any points in between.
	abstract reverse(): void;

	isConnectedTo(shape: Shape, tolerance: number = 0.01) {
		return (
			this.endPoint.isEqual(shape.startPoint, tolerance) ||
			this.endPoint.isEqual(shape.endPoint, tolerance) ||
			this.startPoint.isEqual(shape.startPoint, tolerance) ||
			this.startPoint.isEqual(shape.endPoint, tolerance)
		);
	}
}
