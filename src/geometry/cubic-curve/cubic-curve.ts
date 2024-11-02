import { Rectangle } from "../rectangle/rectangle";
import { cubicCurveBoundingBox, cubicCurveDirection, mirrorCubicCurve, reverseCubicCurve, rotateCubicCurve, translateCubicCurve } from "./cubic-curve.function";
import { GeometryTypeEnum, MirrorEnum, DirectionEnum } from "../geometry.enum";
import { Point, PointProperties } from "../point/point";
import { Shape } from "../shape";

export interface CubicCurveProperties {
    startPoint: PointProperties;
    control1: PointProperties
    control2: PointProperties;
    endPoint: PointProperties;
}

export class CubicCurve extends Shape implements CubicCurveProperties {

    type: GeometryTypeEnum = GeometryTypeEnum.CUBIC_CURVE;

    startPoint: Point;
    control1: Point;
    control2: Point;
    endPoint: Point;

    constructor({startPoint, control1, control2, endPoint}: CubicCurveProperties) {
        super();
        this.startPoint = new Point(startPoint);
        this.control1 = new Point(control1);
        this.control2 = new Point(control2);
        this.endPoint = new Point(endPoint);
    }

    get boundary(): Rectangle {
        const cbbb = cubicCurveBoundingBox(this.startPoint, this.control1, this.control2, this.endPoint);
        const boundary = new Rectangle(new Point({x:cbbb.minX, y:cbbb.minY}), new Point({x:cbbb.maxX, y:cbbb.maxY}));
        return boundary;
    }

    get direction(): DirectionEnum {
        return cubicCurveDirection(this.startPoint, this.control1, this.control2, this.endPoint);
    }

    get command(): string {
        return `M ${this.startPoint.x},${this.startPoint.y} C ${this.control1.x} ${this.control1.y}, ${this.control2.x} ${this.control2.y}, ${this.endPoint.x} ${this.endPoint.y}`;
    }

    mirror(mirror: MirrorEnum, axisValue: number) {
        const mirrored: CubicCurveProperties = mirrorCubicCurve(this, mirror, axisValue);
        this.startPoint = new Point(mirrored.startPoint);
        this.control1 = new Point(mirrored.control1);
        this.control2 = new Point(mirrored.control2);
        this.endPoint = new Point(mirrored.endPoint);
    }

    translate(dx: number, dy: number) {
        const translated: CubicCurveProperties = translateCubicCurve(this, dx, dy);
        this.startPoint = new Point(translated.startPoint);
        this.control1 = new Point(translated.control1);
        this.control2 = new Point(translated.control2);
        this.endPoint = new Point(translated.endPoint);
    }

    reverse() {
        const reversed: CubicCurveProperties = reverseCubicCurve(this);
        this.startPoint = new Point(reversed.startPoint);
        this.control1 = new Point(reversed.control1);
        this.control2 = new Point(reversed.control2);
        this.endPoint = new Point(reversed.endPoint);
    }

    rotate(center: PointProperties, angle: number) {
        const cubicCurveDef: CubicCurveProperties = rotateCubicCurve(
            this.startPoint.x, this.startPoint.y, 
            this.control1.x, this.control1.y, 
            this.control2.x, this.control2.y, 
            this.endPoint.x, this.endPoint.y,
            center.x, center.y,
            angle
        );
        this.startPoint = new Point(cubicCurveDef.startPoint);
        this.control1 = new Point(cubicCurveDef.control1);
        this.control2  = new Point(cubicCurveDef.control2);
        this.endPoint = new Point(cubicCurveDef.endPoint);
    }

}