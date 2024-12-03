// https://web.archive.org/web/20230201132228/https://brunoimbrizi.com/unbox/2015/03/offset-curve/

import { QuadraticCurveProperties } from './quadratic-curve';

// http://stackoverflow.com/questions/12810765/calculating-cubic-root-for-negative-number
export function cbrt(x) {
	var sign = x === 0 ? 0 : x > 0 ? 1 : -1;
	return sign * Math.pow(Math.abs(x), 1 / 3);
}

export function pointOnQuadraticCurve(t, p1, pc, p2) {
	var x = (1 - t) * (1 - t) * p1.x + 2 * (1 - t) * t * pc.x + t * t * p2.x;
	var y = (1 - t) * (1 - t) * p1.y + 2 * (1 - t) * t * pc.y + t * t * p2.y;
	return new Vector(x, y);
}

// http://microbians.com/math/Gabriel_Suchowolski_Quadratic_bezier_offsetting_with_selective_subdivision.pdf
// http://www.math.vanderbilt.edu/~schectex/courses/cubic/
export function getNearestPoint(p1, pc, p2) {
	var v0 = pc.sub(p1);
	var v1 = p2.sub(pc);

	var a = v1.sub(v0).dot(v1.sub(v0));
	var b = 3 * (v1.dot(v0) - v0.dot(v0));
	var c = 3 * v0.dot(v0) - v1.dot(v0);
	var d = -1 * v0.dot(v0);

	var p = -b / (3 * a);
	var q = p * p * p + (b * c - 3 * a * d) / (6 * a * a);
	var r = c / (3 * a);

	var s = Math.sqrt(q * q + Math.pow(r - p * p, 3));
	var t = cbrt(q + s) + cbrt(q - s) + p;

	return t;
}

// http://toxiclibs.org/docs/core/toxi/geom/Vec2D.html
class Vector {
	x: number;
	y: number;

	constructor(a: number, b: number) {
		this.x = a;
		this.y = b;
	}

	add(a: Vector): Vector {
		return new Vector(this.x + a.x, this.y + a.y);
	}

	angleBetween(v, faceNormalize): number {
		if (faceNormalize === undefined) {
			var dot = this.dot(v);
			return Math.acos(this.dot(v));
		}
		var theta = faceNormalize ? this.getNormalized().dot(v.getNormalized()) : this.dot(v);
		return Math.acos(theta);
	}

	distanceToSquared(v) {
		if (v !== undefined) {
			var dx = this.x - v.x;
			var dy = this.y - v.y;
			return dx * dx + dy * dy;
		} else {
			return NaN;
		}
	}

	dot(v) {
		return this.x * v.x + this.y * v.y;
	}

	getNormalized() {
		return new Vector(this.x, this.y).normalize();
	}

	getPerpendicular() {
		return new Vector(this.x, this.y).perpendicular();
	}

	interpolateTo(v, f) {
		return new Vector(this.x + (v.x - this.x) * f, this.y + (v.y - this.y) * f);
	}

	normalize() {
		var mag = this.x * this.x + this.y * this.y;
		if (mag > 0) {
			mag = 1.0 / Math.sqrt(mag);
			this.x *= mag;
			this.y *= mag;
		}
		return this;
	}

	normalizeTo(len) {
		var mag = Math.sqrt(this.x * this.x + this.y * this.y);
		if (mag > 0) {
			mag = len / mag;
			this.x *= mag;
			this.y *= mag;
		}
		return this;
	}

	perpendicular() {
		var t = this.x;
		this.x = -this.y;
		this.y = t;
		return this;
	}

	scale(a) {
		return new Vector(this.x * a, this.y * a);
	}

	sub(a) {
		return new Vector(this.x - a.x, this.y - a.y);
	}
}

enum SegmentIntersectionType {
	COINCIDENT = 0,
	PARALLEL = 1,
	NON_INTERSECTING = 2,
	INTERSECTING = 3
}

class SegmentIntersection {
	type: SegmentIntersectionType;
	pos: Vector;

	constructor(type: SegmentIntersectionType, pos: Vector) {
		this.type = type;
		this.pos = pos;
	}
}

// http://toxiclibs.org/docs/core/toxi/geom/Line2D.html
class Segment {
	a: Vector;
	b: Vector;

	constructor(a: Vector, b: Vector) {
		this.a = a;
		this.b = b;
	}

	intersectLine(l: Segment): SegmentIntersection {
		let isec: SegmentIntersection,
			denom = (l.b.y - l.a.y) * (this.b.x - this.a.x) - (l.b.x - l.a.x) * (this.b.y - this.a.y),
			na = (l.b.x - l.a.x) * (this.a.y - l.a.y) - (l.b.y - l.a.y) * (this.a.x - l.a.x),
			nb = (this.b.x - this.a.x) * (this.a.y - l.a.y) - (this.b.y - this.a.y) * (this.a.x - l.a.x);
		if (denom !== 0) {
			let ua = na / denom,
				ub = nb / denom;
			if (ua >= 0.0 && ua <= 1.0 && ub >= 0.0 && ub <= 1.0) {
				isec = new SegmentIntersection(
					SegmentIntersectionType.INTERSECTING,
					this.a.interpolateTo(this.b, ua)
				);
			} else {
				isec = new SegmentIntersection(
					SegmentIntersectionType.NON_INTERSECTING,
					this.a.interpolateTo(this.b, ua)
				);
			}
		} else {
			if (na === 0 && nb === 0) {
				isec = new SegmentIntersection(SegmentIntersectionType.COINCIDENT, undefined);
			} else {
				isec = new SegmentIntersection(SegmentIntersectionType.COINCIDENT, undefined);
			}
		}
		return isec;
	}
}

// https://web.archive.org/web/20230201132228/https://brunoimbrizi.com/unbox/2015/03/offset-curve/
function offsetQuadraticCurve(
	curve: QuadraticCurveProperties,
	distance: number = 30,
	useSplitCurve: boolean = true
): QuadraticCurveProperties[] {
	const result: QuadraticCurveProperties[] = [];

	// Start with 3 points.
	var p1 = new Vector(curve.startPoint.x, curve.startPoint.y);
	var c = new Vector(curve.control1.x, curve.control1.y);
	var p2 = new Vector(curve.endPoint.x, curve.endPoint.y);

	// Get the vectors between these points.
	var v1 = c.sub(p1);
	var v2 = p2.sub(c);
	var n1 = v1.normalizeTo(distance).getPerpendicular();
	var n2 = v2.normalizeTo(distance).getPerpendicular();

	// Find the vector perpendicular to v1 and scale it to the width (or thickness) of the new curve.
	// Add the new temporary vector to p1 to find p1a, then subtract from p1 it to find p1b.
	var p1a = p1.add(n1);
	var p1b = p1.sub(n1);

	// Do the same with c to find c1a and c1b.
	var c1a = c.add(n1);
	var c1b = c.sub(n1);

	// Repeat the same process with v2 to find the points on the other side.
	var p2a = p2.add(n2);
	var p2b = p2.sub(n2);

	// Find vectors between the new points. These are parallel to v1 and v2 and offset by the given thickness.
	var c2a = c.add(n2);
	var c2b = c.sub(n2);

	// Find vectors between the new points. These are parallel to v1 and v2 and offset by the given thickness.
	var line1a = new Segment(p1a, c1a);
	var line1b = new Segment(p1b, c1b);
	var line2a = new Segment(p2a, c2a);
	var line2b = new Segment(p2b, c2b);

	// For angles smaller than 90 degrees it is necessary to split the curve.
	var split: boolean = useSplitCurve && v1.angleBetween(v2, true) > Math.PI / 2;

	if (!split) {
		// Curve angle > 90 degrees
		// The intersection points of these vectors are the new control points ca and cb.
		var ca = line1a.intersectLine(line2a).pos;
		var cb = line1b.intersectLine(line2b).pos;
	} else {
		// Curve angle < 90 degrees
		// For angles smaller than 90 degrees it is necessary to split the curve.

		// The curve needs to be split at t, which is the closest point to c in the curve.
		var t = getNearestPoint(p1, c, p2);
		// The equation returns a number between 0 and 1 that can be plotted in the curve to find t.
		var pt = pointOnQuadraticCurve(t, p1, c, p2);

		// Find the tangent of t and the points t1 and t2 where it intersects v1 and v2.
		var t1 = p1.scale(1 - t).add(c.scale(t));
		var t2 = c.scale(1 - t).add(p2.scale(t));

		// Create a new vector perpendicular to the tangent of t
		// This vector splits the original curve at t.
		var vt = t2.sub(t1).normalizeTo(distance).getPerpendicular();
		// scale it to the given thickness and find qa and qb.
		var qa = pt.add(vt);
		var qb = pt.sub(vt);

		// Add the tangent of t to qa and qb.
		var lineqa = new Segment(qa, qa.add(vt.getPerpendicular()));
		var lineqb = new Segment(qb, qb.add(vt.getPerpendicular()));
		// Find the points where it intersects the offset vectors.
		var q1a = line1a.intersectLine(lineqa).pos;
		var q2a = line2a.intersectLine(lineqa).pos;
		var q1b = line1b.intersectLine(lineqb).pos;
		var q2b = line2b.intersectLine(lineqb).pos;
	}

	// offset curve inner
	if (!split) {
		// Draw a curve from p1a to p2a with control point at ca.
		result.push({
			startPoint: { x: p1a.x, y: p1a.y },
			control1: { x: ca.x, y: ca.y },
			endPoint: { x: p2a.x, y: p2a.y }
		});
	} else {
		// Draw a curve with anchors at p1a and qa with the control point at q1a.
		result.push({
			startPoint: { x: p1a.x, y: p1a.y },
			control1: { x: q1a.x, y: q1a.y },
			endPoint: { x: qa.x, y: qa.y }
		});
		// Repeat the process for all the new points to get the offset curve.
		result.push({
			startPoint: { x: qa.x, y: qa.y },
			control1: { x: q2a.x, y: q2a.y },
			endPoint: { x: p2a.x, y: p2a.y }
		});
	}

	// offset curve outer
	if (!split) {
		// Draw another curve from p1b to p2b with control point at cb.
		result.push({
			startPoint: { x: p1b.x, y: p1b.y },
			control1: { x: cb.x, y: cb.y },
			endPoint: { x: p2b.x, y: p2b.y }
		});
	} else {
		result.push({
			startPoint: { x: p1b.x, y: p1b.y },
			control1: { x: q1b.x, y: q1b.y },
			endPoint: { x: qb.x, y: qb.y }
		});
		result.push({
			startPoint: { x: qb.x, y: qb.y },
			control1: { x: q2b.x, y: q2b.y },
			endPoint: { x: p2b.x, y: p2b.y }
		});
	}

	return result;
}
