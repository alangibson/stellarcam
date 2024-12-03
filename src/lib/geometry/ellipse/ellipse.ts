import { CubicCurve, type CubicCurveProperties } from '../cubic-curve/cubic-curve';
import { Point } from '../point/point';
import { type PointProperties } from '../point/point.interface';
import { ellipseMiddlePoint, ellipseToCubicCurves } from './ellipse.function';

export interface EllipseProperties {
	center: PointProperties;
	focus: PointProperties;
	axisRatio: number;
	startAngle: number;
	endAngle: number;
}

export class Ellipse implements EllipseProperties {
	center: Point;
	focus: Point;
	axisRatio: number;
	startAngle: number;
	endAngle: number;

	rotationAngle: number;

	constructor({ center, focus, axisRatio, startAngle, endAngle }: EllipseProperties) {
		this.center = new Point(center);
		this.focus = new Point(focus);
		this.axisRatio = axisRatio;
		this.startAngle = startAngle;
		this.endAngle = endAngle;
		// Calculate rotationAngle
		// see: https://github.com/skymakerolof/dxf/blob/e4dbde6bcb0c3f0ce8423622cd53f3d03171281b/src/toSVG.js#L74
		this.rotationAngle = -Math.atan2(-focus.y, focus.x);
	}

	get middlePoint(): Point {
		return new Point(ellipseMiddlePoint(this));
	}

	toCurves(): CubicCurve[] {
		const curvedefs: CubicCurveProperties[] = ellipseToCubicCurves(this);
		return curvedefs.map((def) => new CubicCurve(def));
	}
}
