import type { BoundaryProperties } from './boundary';

export function joinBoundaries(
	rect1: BoundaryProperties,
	rect2: BoundaryProperties
): BoundaryProperties {
	// Find the minimum and maximum x and y coordinates
	const startPointX = Math.min(
		rect1.startPoint.x,
		rect1.endPoint.x,
		rect2.startPoint.x,
		rect2.endPoint.x
	);
	const startPointY = Math.min(
		rect1.startPoint.y,
		rect1.endPoint.y,
		rect2.startPoint.y,
		rect2.endPoint.y
	);
	const endPointX = Math.max(
		rect1.startPoint.x,
		rect1.endPoint.x,
		rect2.startPoint.x,
		rect2.endPoint.x
	);
	const endPointY = Math.max(
		rect1.startPoint.y,
		rect1.endPoint.y,
		rect2.startPoint.y,
		rect2.endPoint.y
	);

	// Return the new rectangle that includes both rectangles
	return {
		startPoint: {
			x: startPointX,
			y: startPointY
		},
		endPoint: {
			x: endPointX,
			y: endPointY
		}
	};
}
