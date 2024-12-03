import { DirectionEnum, GeometryTypeEnum, MirrorEnum } from '../geometry.enum';
import { Point } from '../point/point';
import { type PointProperties } from '../point/point.interface';
import {
	rotateSegment,
	segmentDirection,
	segmentMiddlePoint,
	transformSegment
} from './segment.function';
import { Shape } from '../shape';
import { Boundary } from '../boundary/boundary';

export interface SegmentProperties {
	startPoint: PointProperties;
	endPoint: PointProperties;
}

/**
 * A line anchored at two points
 */
export class Segment extends Shape implements SegmentProperties {
	type: GeometryTypeEnum = GeometryTypeEnum.SEGMENT;

	startPoint: Point;
	endPoint: Point;

	constructor({ startPoint, endPoint }: SegmentProperties) {
		super();
		this.startPoint = new Point(startPoint);
		this.endPoint = new Point(endPoint);
	}

	get middlePoint(): Point {
		return new Point(segmentMiddlePoint(this));
	}

	get boundary(): Boundary {
		return new Boundary({ startPoint: this.startPoint, endPoint: this.endPoint });
	}

	get direction(): DirectionEnum {
		return segmentDirection(this.startPoint, this.endPoint);
	}

	set direction(direction: DirectionEnum) {
		if (direction == this.direction) return;
		// Change direction
		this.reverse();
	}

	get command(): string {
		return `M ${this.startPoint.x},${this.startPoint.y} L ${this.endPoint.x},${this.endPoint.y}`;
	}

	transform(matrix: number[]) {
		const transformed = transformSegment(this, matrix);
		this.startPoint = new Point(transformed.startPoint);
		this.endPoint = new Point(transformed.endPoint);
	}

	reverse() {
		const startPoint = this.startPoint;
		this.startPoint = this.endPoint;
		this.endPoint = startPoint;
	}

	mirror(mirror: MirrorEnum, axisValue: number = 0) {
		this.startPoint.mirror(mirror, axisValue);
		this.endPoint.mirror(mirror, axisValue);
	}

	translate(dx: number, dy: number) {
		this.startPoint.translate(dx, dy);
		this.endPoint.translate(dx, dy);
	}

	rotate(center: PointProperties, angle: number) {
		const segmentDef: SegmentProperties = rotateSegment(
			this.startPoint.x,
			this.startPoint.y,
			this.endPoint.x,
			this.endPoint.y,
			center.x,
			center.y,
			angle
		);
		this.startPoint = new Point(segmentDef.startPoint);
		this.endPoint = new Point(segmentDef.endPoint);
	}

	// Unique identifier for each segment (handles both directions)
	toString() {
		return `${this.startPoint.toString()}-${this.endPoint.toString()}`;
	}

	// Reverse identifier to handle bidirectional check
	reverseToString() {
		return `${this.endPoint.toString()}-${this.startPoint.toString()}`;
	}
}
