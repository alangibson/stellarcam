import { DirectionEnum, MirrorEnum } from '../geometry.enum';
import {
	circleBoundary,
	circlePath,
	circlePointToAngle,
	offsetCircle,
	rotateCircle,
	transformCircle
} from './circle.function';
import { GeometryTypeEnum } from '../geometry.enum';
import { Point } from '../point/point';
import { type PointProperties } from '../point/point.interface';
import { Shape } from '../shape';
import { Boundary } from '../boundary/boundary';

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

	get boundary(): Boundary {
		const { bottomLeft, topRight } = circleBoundary(this.center, this.radius);
		return new Boundary({ startPoint: bottomLeft, endPoint: topRight });
	}

	// Start point is always top center (ie 0 degrees).
	get startPoint(): Point {
		return new Point({
			x: this.center.x,
			y: this.center.y + this.radius
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

	get startAngle(): number {
		return circlePointToAngle(this, this.startPoint);
	}

	get endAngle(): number {
		return circlePointToAngle(this, this.endPoint);
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

	/**
	 * Produce new offset shapes. Does not modify this object.
	 */
	offset(distance: number): Circle[] {
		const [inner, outer] = offsetCircle(this, distance);
		return [new Circle(inner), new Circle(outer)];
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
			angle
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
