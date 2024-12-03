import { DirectionEnum } from '../geometry.enum';
import { type PointProperties } from '../point/point.interface';
import { rotatePoint, transformPoint } from '../point/point.function';
import { Segment, type SegmentProperties } from './segment';

/**
 * Calculates a point at a specified distance along a line segment.
 *
 * @param {number} x0 - X-coordinate of the starting point.
 * @param {number} y0 - Y-coordinate of the starting point.
 * @param {number} x1 - X-coordinate of the ending point.
 * @param {number} y1 - Y-coordinate of the ending point.
 * @param {number} distance - Distance to travel along the line from the starting point.
 * @returns {{x: number, y: number}} Coordinates of the point after traveling distance.
 */
export function pointOnSegment(x0, y0, x1, y1, distance) {
	// Calculate the difference in coordinates
	var dx = x1 - x0;
	var dy = y1 - y0;
	// Calculate the length of the line segment
	var length = Math.sqrt(dx * dx + dy * dy);
	// Normalize the direction vector
	var dx_norm = dx / length;
	var dy_norm = dy / length;
	// Calculate the new point's coordinates
	var x = x0 + dx_norm * distance;
	var y = y0 + dy_norm * distance;
	return { x: x, y: y };
}

export function segmentDirection(start: PointProperties, end: PointProperties): DirectionEnum {
	const deltaX = end.x - start.x;
	const deltaY = end.y - start.y;
	const angle = Math.atan2(deltaY, deltaX); // Angle in radians between -π and π

	if (angle >= 0) {
		return DirectionEnum.CW;
	} else {
		return DirectionEnum.CCW;
	}
}

/**
 * Rotates a line segment around a center by a given angle.
 * @param {number} x1 - X-coordinate of the first endpoint.
 * @param {number} y1 - Y-coordinate of the first endpoint.
 * @param {number} x2 - X-coordinate of the second endpoint.
 * @param {number} y2 - Y-coordinate of the second endpoint.
 * @param {number} centerX - X-coordinate of the rotation center.
 * @param {number} centerY - Y-coordinate of the rotation center.
 * @param {number} angle - Rotation angle in radians.
 * @returns {Object} - Rotated line segment endpoints.
 */
export function rotateSegment(x1, y1, x2, y2, centerX, centerY, angle): SegmentProperties {
	const p1: PointProperties = rotatePoint(x1, y1, centerX, centerY, angle);
	const p2: PointProperties = rotatePoint(x2, y2, centerX, centerY, angle);
	return {
		startPoint: p1,
		endPoint: p2
	};
}

export function transformSegment(segment: SegmentProperties, matrix: number[]): SegmentProperties {
	return {
		startPoint: transformPoint(segment.startPoint, matrix),
		endPoint: transformPoint(segment.endPoint, matrix)
	};
}

export function segmentMiddlePoint(segment: SegmentProperties): PointProperties {
	// Calculate the midpoint coordinates
	const midX = (segment.startPoint.x + segment.endPoint.x) / 2;
	const midY = (segment.startPoint.y + segment.endPoint.y) / 2;
	// Return the midpoint as an object
	return { x: midX, y: midY };
}

// Transform two or more points into one or more segments
export function segmentsFromPoints(points: PointProperties[]): SegmentProperties[] {
	if (points.length < 2) throw new Error('Two or more points required');
	const segments: SegmentProperties[] = [];
	let lastPoint: PointProperties = points[0];
	for (let i = 1; i < points.length; i++) {
		const point = points[i];
		segments.push(new Segment({ startPoint: lastPoint, endPoint: point }));
		lastPoint = point;
	}
	return segments;
}

// Helper function to check if point q lies on segment pr
export function pointIsOnSegment(p: PointProperties, q: PointProperties, r: PointProperties) {
	return (
		q.x <= Math.max(p.x, r.x) &&
		q.x >= Math.min(p.x, r.x) &&
		q.y <= Math.max(p.y, r.y) &&
		q.y >= Math.min(p.y, r.y)
	);
}

// Helper function to calculate orientation
export function segmentOrientation(a, b, c) {
	const val = (b.y - a.y) * (c.x - b.x) - (b.x - a.x) * (c.y - b.y);
	if (val === 0) return 0; // Colinear
	return val > 0 ? 1 : 2; // Clockwise or Counterclockwise
}

// Function to check if two line segments intersect
export function segmentIntersects(
	p1: PointProperties,
	p2: PointProperties,
	p3: PointProperties,
	p4: PointProperties
) {
	const o1 = segmentOrientation(p1, p2, p3);
	const o2 = segmentOrientation(p1, p2, p4);
	const o3 = segmentOrientation(p3, p4, p1);
	const o4 = segmentOrientation(p3, p4, p2);

	// General case
	if (o1 !== o2 && o3 !== o4) {
		return true;
	}

	// Special Cases
	if (o1 === 0 && pointIsOnSegment(p1, p3, p2)) return true; // p3 lies on p1p2
	if (o2 === 0 && pointIsOnSegment(p1, p4, p2)) return true; // p4 lies on p1p2
	if (o3 === 0 && pointIsOnSegment(p3, p1, p4)) return true; // p1 lies on p3p4
	if (o4 === 0 && pointIsOnSegment(p3, p2, p4)) return true; // p2 lies on p3p4

	return false;
}
