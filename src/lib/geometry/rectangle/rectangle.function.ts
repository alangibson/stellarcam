import { type PointProperties } from '../point/point.interface';
import { transformPoint } from '../point/point.function';
import { type RectangleProperties } from './rectangle.interface';

export function rectangleCentroid(x1, y1, x2, y2): PointProperties {
	const xCentroid = (x1 + x2) / 2;
	const yCentroid = (y1 + y2) / 2;
	return { x: xCentroid, y: yCentroid };
}

export function transformRectangle(
	rect: RectangleProperties,
	matrix: number[]
): RectangleProperties {
	return {
		startPoint: transformPoint(rect.startPoint, matrix),
		endPoint: transformPoint(rect.endPoint, matrix)
	};
}
