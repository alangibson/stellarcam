import { PointProperties } from './point/point.interface';

// Utility functions for vector operations
export function distance(a: PointProperties, b: PointProperties) {
	return Math.hypot(b.x - a.x, b.y - a.y);
}

export function lerp(a: PointProperties, b: PointProperties, t) {
	return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
}
