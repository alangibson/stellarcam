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
            <line class="radius" x1="${arc.center.x}" y1="${arc.center.y}" x2="${arc.middlePoint.x}" y2="${arc.middlePoint.y}"/>
            <circle class="center point" r=0.0001 cx="${arc.center.x}" cy="${arc.center.y}"/>
            <circle class="middle point" r=0.0001 cx="${arc.middlePoint.x}" cy="${arc.middlePoint.y}"/>
        `,
        [GeometryTypeEnum.CIRCLE]: (c: Circle) => `
            <circle class="circle" cx="${c.center.x}" cy="${c.center.y}" r="${c.radius}" />
            <circle class="center point" r=0.0001 cx="${c.center.x}" cy="${c.center.y}"/>
            <circle class="middle point" r=0.0001 cx="${c.startPoint.x}" cy="${c.startPoint.y}"/>
        `,
        [GeometryTypeEnum.CUBIC_CURVE]: (c: CubicCurve) => `
            <path class="cubic curve" d="M ${c.startPoint.x},${c.startPoint.y} C ${c.control1.x} ${c.control1.y}, ${c.control2.x} ${c.control2.y}, ${c.endPoint.x} ${c.endPoint.y}" />
            <circle class="middle point" r=0.0001 cx="${c.middlePoint.x}" cy="${c.middlePoint.y}"/>
        `,
        [GeometryTypeEnum.ELLIPSE]: (e: Ellipse) => `
            <ellipse class="ellipse" cx="${e.center.x}" cy="${e.center.y}" rx="${e.focus.x}" ry="${e.focus.y}" />
            <circle class="middle point" r=0.0001 cx="${e.middlePoint.x}" cy="${e.middlePoint.y}"/>
        `,
        [GeometryTypeEnum.QUADRATIC_CURVE]: (curve: QuadraticCurve) => `
            <path class="quadratic curve" d="M ${curve.startPoint.x},${curve.startPoint.y} Q ${curve.control1.x},${curve.control1.y} ${curve.endPoint.x},${curve.endPoint.y}"/>    
            <line class="control line" x1="${curve.startPoint.x}" y1="${curve.startPoint.y}" x2="${curve.control1.x}" y2="${curve.control1.y}"/>
            <line class="control line" x1="${curve.endPoint.x}" y1="${curve.endPoint.y}" x2="${curve.control1.x}" y2="${curve.control1.y}"/>
            <circle class="start point" r=0.0001 cx="${curve.startPoint.x}" cy="${curve.startPoint.y}"/>
            <circle class="control point" r=0.0001 cx="${curve.control1.x}" cy="${curve.control1.y}" />
            <circle class="end point" r=0.0001 cx="${curve.endPoint.x}" cy="${curve.endPoint.y}"/>
        `,
        [GeometryTypeEnum.SEGMENT]: (s: Segment) => `
            <line x1="${s.startPoint.x}" y1="${s.startPoint.y}" x2="${s.endPoint.x}" y2="${s.endPoint.y}"/>
            <circle class="middle point" r=0.0001 cx="${s.middlePoint.x}" cy="${s.middlePoint.y}"/>
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
