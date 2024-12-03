import type { PointProperties } from '../point/point.interface';
import { joinBoundaries } from './boundary.function';

export interface BoundaryProperties {
	// Bottom left point
	startPoint: PointProperties;
	// Top right point
	endPoint: PointProperties;
}

/**
 * A bounding box.
 *
 * Different from a Rectangle is that it is not a Geometry,
 * and has a join() method.
 */
export class Boundary implements BoundaryProperties {
	startPoint: PointProperties;
	endPoint: PointProperties;

	constructor({startPoint, endPoint}: BoundaryProperties) {
		this.startPoint = startPoint;
		this.endPoint = endPoint;
	}

	join(boundary: Boundary): Boundary {
		const newBoundary = joinBoundaries(this, boundary);
		this.startPoint.x = newBoundary.startPoint.x;
		this.startPoint.y = newBoundary.startPoint.y;
		this.endPoint.x = newBoundary.endPoint.x;
		this.endPoint.y = newBoundary.endPoint.y;
		return this;
	}
}
