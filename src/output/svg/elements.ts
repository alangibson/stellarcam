import { Chain } from "../../domain/chain";
import { Cut } from "../../domain/cut";
import { Drawing } from "../../domain/drawing";
import { Layer } from "../../domain/layer";
import { Rapid } from "../../domain/rapid";
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
        begin: (drawing: Drawing) => `<svg id="drawing" width="100%" height="100vh" preserveAspectRatio="none">`,
        end: () => '</svg>'
    },
    layer: {
        begin: (layer: Layer) => `<g class="layer" layer-name="${layer.name}">`,
        end: () => '</g>'
    },
    part: {
        begin: () => '<g class="part">',
        end: () => '</g>'
    },
    cut: {
        begin: () => '<g class="cut">',
        rapidTo: (cut: Cut) => `<line class="rapid" x1="${cut.rapidTo.startPoint.x}" y1="${cut.rapidTo.startPoint.y}" x2="${cut.rapidTo.endPoint.x}" y2="${cut.rapidTo.endPoint.y}" />`,
        end: () => '</g>'
    },
    chain: {
        begin: () => '<g class="chain">',
        startPoint: (chain: Chain) => `<circle class="chain start point" cx="${chain.startPoint.x}" cy="${chain.startPoint.y}"/>`,
        endPoint: (chain: Chain) => `<circle class="chain end point" cx="${chain.endPoint.x}" cy="${chain.endPoint.y}"/>`,
        end: () => '</g>'
    },
    shape: {
        [GeometryTypeEnum.ARC]: (arc: Arc) => `
            <path class="arc" d="M ${arc.startPoint.x},${arc.startPoint.y} A ${arc.radius} ${arc.radius} ${arc.angle_degrees} 0 ${arc.direction == DirectionEnum.CW ? 1 : 0} ${arc.endPoint.x},${arc.endPoint.y}"/>
            <line class="radius" x1="${arc.center.x}" y1="${arc.center.y}" x2="${arc.middle_point.x}" y2="${arc.middle_point.y}"/>
            <circle class="middle point" cx="${arc.center.x}" cy="${arc.center.y}"/>
        `,
        [GeometryTypeEnum.CIRCLE]: (c: Circle) => `
            <circle class="circle" cx="${c.center.x}" cy="${c.center.y}" r="${c.radius}" />
        `,
        [GeometryTypeEnum.CUBIC_CURVE]: (c: CubicCurve) => `
            <path class="cubic curve" d="M ${c.startPoint.x},${c.startPoint.y} C ${c.control1.x} ${c.control1.y}, ${c.control2.x} ${c.control2.y}, ${c.endPoint.x} ${c.endPoint.y}" />
        `,
        // TODO handle rotation of Ellipse with transform: https://developer.mozilla.org/en-US/docs/Web/SVG/Element/ellipse
        [GeometryTypeEnum.ELLIPSE]: (e: Ellipse) => `
            <ellipse class="ellipse" cx="${e.x}" cy="${e.y}" rx="${e.majorX}" ry="${e.majorY}" />
        `,
        [GeometryTypeEnum.QUADRATIC_CURVE]: (curve: QuadraticCurve) => `
            <path class="quadratic curve" d="M ${curve.startPoint.x},${curve.startPoint.y} Q ${curve.control1.x},${curve.control1.y} ${curve.endPoint.x},${curve.endPoint.y}"/>    
            <circle class="start point" r=0.01 cx="${curve.startPoint.x}" cy="${curve.startPoint.y}"/>
            <line class="control line" x1="${curve.startPoint.x}" y1="${curve.startPoint.y}" x2="${curve.control1.x}" y2="${curve.control1.y}"/>
            <circle class="control point" r=0.01 cx="${curve.control1.x}" cy="${curve.control1.y}" />
            <circle class="end point" r=0.01 cx="${curve.endPoint.x}" cy="${curve.endPoint.y}"/>
            <line class="control line" x1="${curve.endPoint.x}" y1="${curve.endPoint.y}" x2="${curve.control1.x}" y2="${curve.control1.y}"/>
        `,
        [GeometryTypeEnum.SEGMENT]: (s: Segment) => `
            <line x1="${s.startPoint.x}" y1="${s.startPoint.y}" x2="${s.endPoint.x}" y2="${s.endPoint.y}"/>
            <circle class="middle point" cx="${s.middlePoint.x}" cy="${s.middlePoint.y}"/>
        `,
        // TODO [GeometryTypeEnum.POINT]: (circle: Circle) => `<ellipse/>`,
        // TODO [GeometryTypeEnum.RECTANGLE]: (curve: QuadraticCurve) => `<rect/>`,
    },
    operation: {
        begin: () => '',
        end: () => ''
    },
}

export default apply;
