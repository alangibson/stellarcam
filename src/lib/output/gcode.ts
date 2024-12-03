import { Cut } from '../domain/cut';
import { type MachineProperties } from '../domain/machine';
import { UnitEnum } from '../domain/machine.enum';
import { Operation } from '../domain/operation';
import { Part } from '../domain/part';
import { Arc } from '../geometry/arc/arc';
import { Circle } from '../geometry/circle/circle';
import { CubicCurve } from '../geometry/cubic-curve/cubic-curve';
import { DirectionEnum, GeometryTypeEnum } from '../geometry/geometry.enum';
import { Point } from '../geometry/point/point';
import { QuadraticCurve } from '../geometry/quadratic-curve/quadratic-curve';
import { Segment } from '../geometry/segment/segment';
import type { RenderProgramConfig } from './render';

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

export const GcodeRenderProgramConfig: RenderProgramConfig = {
	part: {
		begin: (part: Part) => '(begin part)',
		end: () => '(end part)'
	},
	cut: {
		// TODO a circle may optionally be treated as a hole (i.e. underspeed). Maybe only when no contained shapes?
		begin: (cut: Cut) => `
    (begin cut)
    M3 $0 S1 (plasma start)`,
		rapidTo: (cut: Cut) => `G0 X${cut.rapidTo?.endPoint.x} Y${cut.rapidTo?.endPoint.y} (rapid)`,
		end: () => `
    M5 $0 (plasma end)
    (end cut)`
	},
	shape: {
		// Note: Any shape types not listed must have been decomposed into these shapes
		[GeometryTypeEnum.ARC]: (a: Arc) =>
			`${a.direction == DirectionEnum.CW ? 'G2' : 'G3'}: <path d="M ${a.startPoint.x},${a.startPoint.y} A ${a.radius} ${a.radius} ${a.angle_degrees} 0 ${a.direction == DirectionEnum.CW ? 1 : 0} ${a.endPoint.x},${a.endPoint.y}"/>`,
		// TODO need to know underspeed factor for hole
		[GeometryTypeEnum.CIRCLE]: (c: Circle) =>
			`${c.direction == DirectionEnum.CW ? 'G2' : 'G3'}: <circle cx="${c.center.x}" cy="${c.center.y}" r="${c.radius}" />`,
		[GeometryTypeEnum.CUBIC_CURVE]: (c: CubicCurve) =>
			`G5: <path d="M ${c.startPoint.x},${c.startPoint.y} C ${c.control1.x} ${c.control1.y}, ${c.control2.x} ${c.control2.y}, ${c.endPoint.x} ${c.endPoint.y}" />`,
		[GeometryTypeEnum.QUADRATIC_CURVE]: (c: QuadraticCurve) =>
			`G5.1: <path d="M ${c.startPoint.x},${c.startPoint.y} Q ${c.control1.x},${c.control1.y} ${c.endPoint.x},${c.endPoint.y}"/>`,
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
		begin: (o: Operation) =>
			`
      (begin operation)
      (begin select tool)
      T0 M6 (select plasma tool)
      G43 H0 (apply tool offsets)
      (end select tool)
      (begin set material) \n` +
			`(o=0,ph=${o.pierceHeight},pd=${o.pierceDelay},ch=${o.cutHeight},fr=${o.feedRate}` +
			(o.kerfWidth ? `,kw=${o.kerfWidth}` : '') +
			(o.cutVolts ? `,cv=${o.cutVolts}` : '') +
			(o.pauseAtEndDelay ? `,pe=${o.pauseAtEndDelay}` : '') +
			(o.puddleJumpHeight ? `,jh=${o.puddleJumpHeight}` : '') +
			(o.puddleJumpDelay ? `,jd=${o.puddleJumpDelay}` : '') +
			`) (temporary default)\n` +
			`F#<_hal[plasmac.cut-feed-rate]>
      (end set material)
      `,
		// TODO return to previous Operation state, if any
		end: () => '(end operation)'
	}
};
