import { Boundary } from "./boundary";
import { cubicCurveBoundingBox, cubicCurveDirection, mirrorCubicCurve, reverseCubicCurve, rotateCubicCurve, translateCubicCurve } from "./cubic-curve.function";
import { GeometryTypeEnum, MirrorEnum, DirectionEnum } from "./geometry.enum";
import { Point, PointProperties } from "./point";
import { Shape } from "./shape";

export interface CubicCurveProperties {
    start_point: PointProperties;
    control1: PointProperties
    control2: PointProperties;
    end_point: PointProperties;
}

export class CubicCurve extends Shape implements CubicCurveProperties {

    type: GeometryTypeEnum = GeometryTypeEnum.CUBIC_CURVE;

    start_point: Point;
    control1: Point;
    control2: Point;
    end_point: Point;

    constructor(props: CubicCurveProperties) {
        super();
        this.start_point = new Point(props.start_point);
        this.control1 = new Point(props.control1);
        this.control2 = new Point(props.control2);
        this.end_point = new Point(props.end_point);
    }

    get boundary(): Boundary {
        const cbbb = cubicCurveBoundingBox(this.start_point, this.control1, this.control2, this.end_point);
        const boundary = new Boundary(new Point({x:cbbb.minX, y:cbbb.minY}), new Point({x:cbbb.maxX, y:cbbb.maxY}));
        return boundary;
    }

    get direction(): DirectionEnum {
        return cubicCurveDirection(this.start_point, this.control1, this.control2, this.end_point);
    }

    get command(): string {
        return `M ${this.start_point.x},${this.start_point.y} C ${this.control1.x} ${this.control1.y}, ${this.control2.x} ${this.control2.y}, ${this.end_point.x} ${this.end_point.y}`;
    }

    mirror(mirror: MirrorEnum, axisValue: number) {
        const mirrored: CubicCurveProperties = mirrorCubicCurve(this, mirror, axisValue);
        this.start_point = new Point(mirrored.start_point);
        this.control1 = new Point(mirrored.control1);
        this.control2 = new Point(mirrored.control2);
        this.end_point = new Point(mirrored.end_point);
    }

    translate(dx: number, dy: number) {
        const translated: CubicCurveProperties = translateCubicCurve(this, dx, dy);
        this.start_point = new Point(translated.start_point);
        this.control1 = new Point(translated.control1);
        this.control2 = new Point(translated.control2);
        this.end_point = new Point(translated.end_point);
    }

    reverse() {
        const reversed: CubicCurveProperties = reverseCubicCurve(this);
        this.start_point = new Point(reversed.start_point);
        this.control1 = new Point(reversed.control1);
        this.control2 = new Point(reversed.control2);
        this.end_point = new Point(reversed.end_point);
    }

    rotate(center: PointProperties, angle: number) {
        const cubicCurveDef: CubicCurveProperties = rotateCubicCurve(
            this.start_point.x, this.start_point.y, 
            this.control1.x, this.control1.y, 
            this.control2.x, this.control2.y, 
            this.end_point.x, this.end_point.y,
            center.x, center.y,
            angle
        );
        this.start_point = new Point(cubicCurveDef.start_point);
        this.control1 = new Point(cubicCurveDef.control1);
        this.control2  = new Point(cubicCurveDef.control2);
        this.end_point = new Point(cubicCurveDef.end_point);
    }

}