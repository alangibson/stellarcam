import { MirrorEnum } from './geometry.enum';
import { Point } from './point/point';
import { Shape } from './shape';

/** A bounded plane */
export class Area {
	shapes: Shape[] = [];
	origin: Point = new Point({ x: 0, y: 0 });

	get width(): number {
		return Math.abs(this.max.x - this.min.x);
	}

	get height(): number {
		return Math.abs(this.max.y - this.min.y);
	}

	get min(): Point {
		let min_x: number = Number.MAX_SAFE_INTEGER;
		let min_y: number = Number.MAX_SAFE_INTEGER;
		for (let geo of this.shapes) {
			min_x = Math.min(min_x, geo.boundary.startPoint.x);
			min_y = Math.min(min_y, geo.boundary.startPoint.y);
		}
		return new Point({ x: min_x, y: min_y });
	}

	get max(): Point {
		let max_x: number = 0;
		let max_y: number = 0;
		for (let geo of this.shapes) {
			max_x = Math.max(max_x, geo.boundary.endPoint.x);
			max_y = Math.max(max_y, geo.boundary.endPoint.y);
		}
		return new Point({ x: max_x, y: max_y });
	}

	add(shape: Shape) {
		this.shapes.push(shape);
	}

	/** Flip horizontally or vertically along center of Area */
	flip(mirror: MirrorEnum) {
		let axisValue: number;
		if (mirror == MirrorEnum.HORIZONTAL) axisValue = this.height / 2;
		else axisValue = this.width / 2;
		for (let shape of this.shapes) {
			shape.mirror(mirror, axisValue);
		}
	}

	translate(dx: number, dy: number) {
		for (let shape of this.shapes) {
			shape.translate(dx, dy);
		}
	}
}
