import { Drawing } from "../../domain/drawing";
import { Layer } from "../../domain/layer";
import { Arc } from "../../geometry/arc/arc";
import { Circle } from "../../geometry/circle/circle";
import { CubicCurve } from "../../geometry/cubic-curve/cubic-curve";
import { Ellipse } from "../../geometry/ellipse/ellipse";
import { DirectionEnum, GeometryTypeEnum } from "../../geometry/geometry.enum";
import { QuadraticCurve } from "../../geometry/quadratic-curve/quadratic-curve";
import { Segment } from "../../geometry/segment/segment";
import { OutputApply } from "../output";

const apply: OutputApply = {
    drawing: {
        begin: (drawing: Drawing) => `<svg id="drawing" class="drawing" width="100%" height="100vh" preserveAspectRatio="none">`,
        end: () => '</svg>'
    },
    layer: {
        begin: (layer: Layer) => `<g class="layer">`,
        end: () => `</g>`
    },
    shape: {
        [GeometryTypeEnum.ARC]: (a: Arc) => `<path d="M ${a.startPoint.x},${a.startPoint.y} A ${a.radius} ${a.radius} ${a.angle_degrees} 0 ${a.direction == DirectionEnum.CW ? 1 : 0} ${a.endPoint.x},${a.endPoint.y}"/>`,
        [GeometryTypeEnum.CIRCLE]: (c: Circle) => `<circle cx="${c.center.x}" cy="${c.center.y}" r="${c.radius}" />`,
        [GeometryTypeEnum.CUBIC_CURVE]: (c: CubicCurve) => `<path d="M ${c.startPoint.x},${c.startPoint.y} C ${c.control1.x} ${c.control1.y}, ${c.control2.x} ${c.control2.y}, ${c.endPoint.x} ${c.endPoint.y}" />`,
        // TODO handle rotation of Ellipse with transform: https://developer.mozilla.org/en-US/docs/Web/SVG/Element/ellipse
        [GeometryTypeEnum.ELLIPSE]: (e: Ellipse) => `<ellipse cx="${e.x}" cy="${e.y}" rx="${e.majorX}" ry="${e.majorY}" />`,
        [GeometryTypeEnum.QUADRATIC_CURVE]: (c: QuadraticCurve) => `<path d="M ${c.startPoint.x},${c.startPoint.y} Q ${c.control1.x},${c.control1.y} ${c.endPoint.x},${c.endPoint.y}"/>`,
        [GeometryTypeEnum.SEGMENT]: (s: Segment) => `<line x1="${s.startPoint.x}" y1="${s.startPoint.y}" x2="${s.endPoint.x}" y2="${s.endPoint.y}"/>`,
        // TODO [GeometryTypeEnum.POINT]: (circle: Circle) => `<ellipse/>`,
        // TODO [GeometryTypeEnum.RECTANGLE]: (curve: QuadraticCurve) => `<rect/>`,
    }
}

export default apply;
