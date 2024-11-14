import { Cut } from "../../domain/cut";
import { Drawing } from "../../domain/drawing";
import { Layer } from "../../domain/layer";
import { MachineProperties} from "../../domain/machine";
import { UnitEnum } from "../../domain/machine.enum";
import { Operation } from "../../domain/operation";
import { Part } from "../../domain/part";
import { Arc } from "../../geometry/arc/arc";
import { Circle } from "../../geometry/circle/circle";
import { CubicCurve } from "../../geometry/cubic-curve/cubic-curve";
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
      begin: (drawing: Drawing) => '(begin drawing)',
      end: () => '(end drawing)'
  },
  layer: {
      begin: (layer: Layer) => '(begin layer)',
      end: () => '(end layer)'
  },
  part: {
    begin: (part: Part) => '(begin part)',
    end: () => '(end part)'
  },
  cut: {
    // TODO a circle may optionally be treated as a hole (i.e. underspeed). Maybe only when no contained shapes?
    begin: (cut: Cut) => `
    (begin cut)
    M3 $0 S1 (plasma start)`,
    rapidTo: (cut: Cut) => `G0 X${cut.rapidTo.endPoint.x} Y${cut.rapidTo.endPoint.y} (rapid)`,
    end: () => `
    M5 $0 (plasma end)
    (end cut)`
  },
  shape: {
      // Note: Any shape types not listed must have been decomposed into these shapes
      [GeometryTypeEnum.ARC]: (a: Arc) => `${a.direction == DirectionEnum.CW ? 'G2' : 'G3'}: <path d="M ${a.startPoint.x},${a.startPoint.y} A ${a.radius} ${a.radius} ${a.angle_degrees} 0 ${a.direction == DirectionEnum.CW ? 1 : 0} ${a.endPoint.x},${a.endPoint.y}"/>`,
      // TODO need to know underspeed factor for hole
      [GeometryTypeEnum.CIRCLE]: (c: Circle) => `${c.direction == DirectionEnum.CW ? 'G2' : 'G3'}: <circle cx="${c.center.x}" cy="${c.center.y}" r="${c.radius}" />`,
      [GeometryTypeEnum.CUBIC_CURVE]: (c: CubicCurve) => `G5: <path d="M ${c.startPoint.x},${c.startPoint.y} C ${c.control1.x} ${c.control1.y}, ${c.control2.x} ${c.control2.y}, ${c.endPoint.x} ${c.endPoint.y}" />`,
      [GeometryTypeEnum.QUADRATIC_CURVE]: (c: QuadraticCurve) => `G5.1: <path d="M ${c.startPoint.x},${c.startPoint.y} Q ${c.control1.x},${c.control1.y} ${c.endPoint.x},${c.endPoint.y}"/>`,
      [GeometryTypeEnum.SEGMENT]: (s: Segment) => `G1 X${s.endPoint.x} Y${s.endPoint.y}`,
      // TODO need to know dwell time for dimple
      [GeometryTypeEnum.POINT]: (point: Point) => `; TODO G4: dwell for T time`
  },
  program: {
    begin: () => `(begin program)`,
    end: () => 'M30 (end program)'
  },
  machine: {
    begin: (machine: MachineProperties) => `
      (begin machine setup)
      ${machine.units == UnitEnum.IMPERIAL ? 'G20 (machine units = imperial) ' : 'G21 (machine units = metric)'}
      G40 (cutter compensation: off)
      G90 (distance mode: absolute)
      G17 (XY plane)
      M52 P1 (adaptive feed: on)
      M68 E3 Q0 (velocity 100%)
      G64 P0.254 Q0.025 (tracking tolerances: 0.254mm)
      ;#<holes>      = 2
      ;#<h_velocity> = 60
      ;#<h_diameter> = 32
      ;#<oclength>   = 4
      (end machine setup)`,
    end: () => `
      (begin machine shutdown)
      G40 (cutter compensation: off)
      G90 (distance mode: absolute)
      M68 E3 Q0 (velocity 100%)
      M5 $-1 (backup stop)
      (end machine shutdown)`
  },
  operation: {
    begin: (o: Operation) => (`
      (begin operation)
      (begin select tool)
      T0 M6 (select plasma tool)
      G43 H0 (apply tool offsets)
      (end select tool)
      (begin set material) \n`
      + `(o=0,ph=${o.pierceHeight},pd=${o.pierceDelay},ch=${o.cutHeight},fr=${o.feedRate}`
      + (o.kerfWidth ? `,kw=${o.kerfWidth}` : '')
      + (o.cutVolts ? `,cv=${o.cutVolts}` : '')
      + (o.pauseAtEndDelay ? `,pe=${o.pauseAtEndDelay}` : '')
      + (o.puddleJumpHeight ? `,jh=${o.puddleJumpHeight}` : '')
      + (o.puddleJumpDelay ? `,jd=${o.puddleJumpDelay}` : '')
      + `) (temporary default)\n` 
      + `F#<_hal[plasmac.cut-feed-rate]>
      (end set material)
      `),
    // TODO return to previous Operation state, if any
    end: () => '(end operation)'
  },
}

export default apply;



/** arc implementation:
 
# Arc Clockwise Move (G2)
arc_xy_cw: str = ""  # G2 X${end_point.x} Y${end_point.y} I${IJ.x} J${IJ.y*fac}
# Arc Counter-clockwise Move (G3)
arc_xy_ccw: str = ""  # G3 X${end_point.x} Y${end_point.y} I${IJ.x} J${IJ.y*fac}



self.ext = self.dif_ang(self._start_point, self._end_point, direction)



def dif_ang(self, Ps, Pe, direction):
    """
    Calculated the angle between Pe and Ps with respect to the origin
    @param Ps: the start Point of the arc
    @param Pe: the end Point of the arc
    @param direction: the direction of the arc
    @return: Returns the angle between -2*pi and 2*pi for the arc,
    0 excluded - we got a complete circle
    """
    dif_ang = (self.origin.norm_angle(Pe) - self.origin.norm_angle(Ps)) % (-2 * pi)

    if direction > 0:
        dif_ang += 2 * pi
    elif dif_ang == 0:
        dif_ang = -2 * pi

    return dif_ang



Ps, s_ang = arc.get_start_end_points(True, True)
Pe, e_ang = arc.get_start_end_points(False, True)
O = arc.origin
r = arc.radius
IJ = O - Ps
gcode = ""
if arc.ext > 0:
    gcode = self.machine.arc_at_xy(
        "ccw", Ps, Pe, s_ang, e_ang, r, O, IJ, arc.ext
    )
elif (
    arc.ext < 0
    and self.machine.config.postprocessor.settings.export_ccw_arcs_only
):
    gcode = self.machine.arc_at_xy(
        "ccw", Pe, Ps, e_ang, s_ang, r, O, O - Pe, arc.ext
    )
else:
    gcode = self.machine.arc_at_xy(
        "cw", Ps, Pe, s_ang, e_ang, r, O, IJ, arc.ext
    )



def get_start_end_points(self, start_point: bool, angles=None, **kwargs):
    if start_point:  # Return a start point
        if angles is None:
            return self._start_point
        elif angles:
            return self._start_point, self.start_radians + pi / 2 * self.ext / abs(
                self.ext
            )
        else:
            direction = (self.origin - self._start_point).unit_vector()
            direction = -direction if self.ext >= 0 else direction
            return self._start_point, PointGeo(-direction.y, direction.x)
    else:  # Return an end point
        if angles is None:
            return self._end_point
        elif angles:
            return self._end_point, self.end_radians - pi / 2 * self.ext / abs(
                self.ext
            )
        else:
            direction = (self.origin - self._end_point).unit_vector()
            direction = -direction if self.ext >= 0 else direction
            return self._end_point, PointGeo(-direction.y, direction.x)



def arc_at_xy(
    self,
    direction,
    start_point: PointGeo,
    end_point: PointGeo,
    start_angle,
    end_angle,
    radius,
    origin: PointGeo,
    IJ,
    ext,
):
    """
    This function is called if an arc shall be cut.
    @param dir: The direction of the arc to cut, can be cw or ccw
    @param Ps: The Start Point of the the Arc
    @param Pe: The End Point of the Arc
    @param s_ang: The angle at which the Startpoint Starts
    @param e_ang: The angle at which the Endpoint Ends
    @param R: The Radius of the Arc
    @param O: The Center (Origin) of the Arc
    @param IJ: The distance from Center to Start Point.
    """
    self.origin = origin
    self.IJ = IJ
    self.start_angle = start_angle
    self.end_angle = end_angle
    self.start_point = start_point
    self.radius = radius
    self.ext = ext

    if self.machine_type == "lathe":
        fac = 2
    else:
        fac = 1
    IJ_y_fac = IJ.y * fac

    if not self.abs_export:
        self.end_point = end_point - self.last_end_point
        self.last_end_point = end_point
    else:
        self.end_point = end_point

    vars = {
        "O": self.origin,
        "IJ": self.IJ,
        "s_ang": self.start_angle,
        "e_ang": self.end_angle,
        "start_point": self.start_point,
        "end_point": self.end_point,
        "IJ_y_fac": IJ_y_fac,
    }
    if direction == "cw":
        return self.gcode.append(self.commands.arc_xy_cw, vars=vars)
    else:
        return self.gcode.append(self.commands.arc_xy_ccw, vars=vars)

*/