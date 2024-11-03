import { Cut } from "../../domain/cut";
import { Drawing } from "../../domain/drawing";
import { Layer } from "../../domain/layer";
import { Part } from "../../domain/part";
import { Arc } from "../../geometry/arc/arc";
import { Circle } from "../../geometry/circle/circle";
import { CubicCurve } from "../../geometry/cubic-curve/cubic-curve";
import { Ellipse } from "../../geometry/ellipse/ellipse";
import { DirectionEnum, GeometryTypeEnum } from "../../geometry/geometry.enum";
import { Point } from "../../geometry/point/point";
import { QuadraticCurve } from "../../geometry/quadratic-curve/quadratic-curve";
import { Segment } from "../../geometry/segment/segment";
import { OutputApply } from "../output";

export interface GcodeConfig {
  programBegin: string;
  programEnd: string;

  cutBegin: string;
  cutEnd: string;

  // G0
  rapidTo: string;
  // G1
  lineTo: string;
  // G2
  arcCwTo: string;
  // G3
  arcCcwTo: string;
  // G5
  cubicCurveTo: string;
  // G5.1
  quadraticCurveTo: string;

  // TODO hole
  // TODO dimple
}

const apply: OutputApply = {
  drawing: {
      begin: (drawing: Drawing) => ``,
      end: () => ''
  },
  layer: {
      begin: (layer: Layer) => ``,
      end: () => ``
  },
  part: {
    begin: (part: Part) => ``,
    end: () => ``
  },
  cut: {
    // TODO a circle may optionally be treated as a hole (i.e. underspeed). Maybe only when no contained shapes?
    begin: (cut: Cut) => ``,
    end: () => ``
  },
  shape: {
      // Note: Any shape types not listed must have been decomposed into these shapes
      [GeometryTypeEnum.ARC]: (a: Arc) => `G2 or G3: <path d="M ${a.startPoint.x},${a.startPoint.y} A ${a.radius} ${a.radius} ${a.angle_degrees} 0 ${a.direction == DirectionEnum.CW ? 1 : 0} ${a.endPoint.x},${a.endPoint.y}"/>`,
      [GeometryTypeEnum.CIRCLE]: (c: Circle) => `G2 or G3: <circle cx="${c.center.x}" cy="${c.center.y}" r="${c.radius}" />`,
      [GeometryTypeEnum.CUBIC_CURVE]: (c: CubicCurve) => `G5: <path d="M ${c.startPoint.x},${c.startPoint.y} C ${c.control1.x} ${c.control1.y}, ${c.control2.x} ${c.control2.y}, ${c.endPoint.x} ${c.endPoint.y}" />`,
      [GeometryTypeEnum.QUADRATIC_CURVE]: (c: QuadraticCurve) => `G5.1: <path d="M ${c.startPoint.x},${c.startPoint.y} Q ${c.control1.x},${c.control1.y} ${c.endPoint.x},${c.endPoint.y}"/>`,
      [GeometryTypeEnum.SEGMENT]: (s: Segment) => `G1: <line x1="${s.startPoint.x}" y1="${s.startPoint.y}" x2="${s.endPoint.x}" y2="${s.endPoint.y}"/>`,
      [GeometryTypeEnum.POINT]: (point: Point) => `G4: dwell for T time`
  }
}

export default apply;
