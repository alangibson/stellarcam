import {
	quadraticBezierBoundingBox,
	quadraticBezierMidpoint,
	quadraticBezierOrientation,
	transformQuadraticCurve
} from './quadratic-curve.function';
import { DirectionEnum, GeometryTypeEnum, MirrorEnum } from '../geometry.enum';
import { Point } from '../point/point';
import { type PointProperties } from '../point/point.interface';
import { Shape } from '../shape';
import { Boundary } from '../boundary/boundary';

export interface QuadraticCurveProperties {
	startPoint: PointProperties;
	control1: PointProperties;
	endPoint: PointProperties;
}

export class QuadraticCurve extends Shape {
	type: GeometryTypeEnum = GeometryTypeEnum.QUADRATIC_CURVE;

	startPoint: Point;
	control1: Point;
	endPoint: Point;

	constructor({ startPoint, control1, endPoint }: QuadraticCurveProperties) {
		super();
		this.startPoint = new Point(startPoint);
		this.control1 = new Point(control1);
		this.endPoint = new Point(endPoint);
	}

	get middle_point(): Point {
		return quadraticBezierMidpoint(this.startPoint, this.control1, this.endPoint);
	}

	get boundary(): Boundary {
		const { minX, minY, maxX, maxY } = quadraticBezierBoundingBox(
			this.startPoint,
			this.control1,
			this.endPoint
		);
		return new Boundary({
			startPoint: { x: minX, y: minY },
			endPoint: { x: maxX, y: maxY }
		});
	}

	get direction(): DirectionEnum {
		return quadraticBezierOrientation(this.startPoint, this.control1, this.endPoint);
	}

	set direction(direction: DirectionEnum) {
		if (direction == this.direction) return;
		this.reverse();
	}

	get command(): string {
		return `M ${this.startPoint.x},${this.startPoint.y} Q ${this.control1.x},${this.control1.y} ${this.endPoint.x},${this.endPoint.y}`;
	}

	transform(matrix: number[]) {
		const transformed = transformQuadraticCurve(this, matrix);
		this.startPoint = new Point(transformed.startPoint);
		this.control1 = new Point(transformed.control1);
		this.endPoint = new Point(transformed.endPoint);
	}

	reverse() {
		const endPoint = this.endPoint;
		this.endPoint = this.startPoint;
		this.startPoint = endPoint;
	}

	mirror(mirror: MirrorEnum, axisValue: number = 0) {
		this.startPoint.mirror(mirror, axisValue);
		this.control1.mirror(mirror, axisValue);
		this.endPoint.mirror(mirror, axisValue);
	}

	translate(dx: number, dy: number) {
		this.startPoint.translate(dx, dy);
		this.control1.translate(dx, dy);
		this.endPoint.translate(dx, dy);
	}

	rotate(center: PointProperties, angle: number) {
		throw new Error('Method not implemented.');
	}
}
