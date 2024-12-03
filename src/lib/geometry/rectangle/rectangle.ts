import { rectangleCentroid, transformRectangle } from '$lib/geometry/rectangle/rectangle.function';
import { Point } from '$lib/geometry/point/point';
import { type PointProperties } from '$lib/geometry/point/point.interface';
import { Shape } from '$lib/geometry/shape';
import { GeometryTypeEnum, MirrorEnum, DirectionEnum } from '$lib/geometry/geometry.enum';
import type { RectangleProperties } from '$lib/geometry/rectangle/rectangle.interface';
import { Boundary } from '../boundary/boundary';

export class Rectangle extends Shape {
	type: GeometryTypeEnum = GeometryTypeEnum.RECTANGLE;

	startPoint: Point;
	endPoint: Point;

	constructor({ startPoint, endPoint }: RectangleProperties) {
		super();
		this.startPoint = new Point(startPoint);
		this.endPoint = new Point(endPoint);
	}

	get centroid(): Point {
		const pointdef: PointProperties = rectangleCentroid(
			this.startPoint.x,
			this.startPoint.y,
			this.endPoint.x,
			this.endPoint.y
		);
		return new Point(pointdef);
	}

	get width(): number {
		return this.endPoint.x - this.startPoint.x;
	}

	get height(): number {
		return this.endPoint.y - this.startPoint.y;
	}

	get boundary(): Boundary {
		return new Boundary(this);
	}

	get direction(): DirectionEnum {
		// TODO is it OK to assume this?
		return DirectionEnum.CW;
	}

	get command(): string {
		// We don't use this shape for rendering
		throw new Error('Method not implemented.');
	}

	transform(matrix: number[]) {
		const transformed = transformRectangle(this, matrix);
		this.startPoint = new Point(transformed.startPoint);
		this.endPoint = new Point(transformed.endPoint);
	}

	mirror(mirror: MirrorEnum, axisValue: number) {
		throw new Error('Method not implemented.');
	}

	translate(dx: number, dy: number) {
		throw new Error('Method not implemented.');
	}

	rotate(center: PointProperties, angle: number) {
		throw new Error('Method not implemented.');
	}

	reverse() {
		throw new Error('Method not implemented.');
	}
}
