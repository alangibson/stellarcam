import { CubicCurve, CubicCurveProperties } from "../cubic-curve/cubic-curve";
import { ellipseToCubicCurves } from "./ellipse.function";

export interface EllipseProperties {
  // Center
  x: number;
  y: number;
  // Focus
  majorX: number;
  majorY: number;
  axisRatio: number;
  startAngle: number;
  endAngle: number;
}

export class Ellipse implements EllipseProperties {
  x: number;
  y: number;
  majorX: number;
  majorY: number;
  axisRatio: number;
  startAngle: number;
  endAngle: number;

  rotationAngle: number;

  constructor({
    x,
    y,
    majorX,
    majorY,
    axisRatio,
    startAngle,
    endAngle,
  }: EllipseProperties) {
    this.x = x;
    this.y = y;
    this.majorX = majorX;
    this.majorY = majorY;
    this.axisRatio = axisRatio;
    this.startAngle = startAngle;
    this.endAngle = endAngle;
    // Calculate rotationAngle
    // see: https://github.com/skymakerolof/dxf/blob/e4dbde6bcb0c3f0ce8423622cd53f3d03171281b/src/toSVG.js#L74
    this.rotationAngle = -Math.atan2(-majorY, majorX);
  }

  toCurves(): CubicCurve[] {
    const curvedefs: CubicCurveProperties[] = ellipseToCubicCurves(
      this.x,
      this.y,
      this.majorX,
      this.majorY,
      this.axisRatio,
      this.startAngle,
      this.endAngle,
    );
    return curvedefs.map((def) => new CubicCurve(def));
  }
}
