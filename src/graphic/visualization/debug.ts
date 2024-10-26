import { Multishape } from "../../entity/multishape";
import { Arc } from "../../geometry/arc";
import { pointAlongArc } from "../../geometry/arc.function";
import { Circle } from "../../geometry/circle";
import { pointAlongCircle } from "../../geometry/circle.function";
import { Curve } from "../../geometry/curve";
import { DirectionEnum, GeometryTypeEnum } from "../../geometry/geometry.enum";
import { Point } from "../../geometry/point";
import { Segment } from "../../geometry/segment";
import { pointAlongSegment } from "../../geometry/segment.function";
import { Visualization } from "./visualization";

export class DebugVisualization implements Visualization {

    to_svg(multishapes: Multishape[]): string[] {
        const elements: string[] = [];
        elements.push("<style>");
        elements.push(".debug { stroke: gray; opacity: 0.5; stroke-width: 0.5; }");
        elements.push("line.debug.middle { stroke-dasharray: 0.5; }");
        elements.push(".debug.start { stroke: green; }");
        elements.push(".debug.middle { stroke: blue; }");
        elements.push(".debug.end { stroke: red; stroke-width: 0.3; }");
        elements.push("</style>");
        for (let multishape of multishapes) {
            for (let shape of multishape.shapes) {
                switch (shape.type) {
                    case (GeometryTypeEnum.ARC): {
                        const arc = shape as Arc;
                        // Point for center
                        elements.push(`<circle r="0.4" cx="${arc.center.x}" cy="${arc.center.y}" class="debug middle" />`)
                        // Line to midpoint for radius
                        elements.push(`<line x1="${arc.center.x}" y1="${arc.center.y}" x2="${arc.middle_point.x}" y2="${arc.middle_point.y}" class="debug middle" />`);
                        // Add direction arrows
                        const length: number = 2;
                        const direction: boolean = (arc.direction == DirectionEnum.CW);
                        const {x, y} = pointAlongArc(arc.center.x, arc.center.y, arc.radius, arc.start_angle, arc.end_angle, length, direction)
                        const end_point_on_arc: Point = new Point({x, y});
                        elements.push(`<circle r="0.4" cx="${arc.start_point.x}" cy="${arc.start_point.y}" class="debug start" />`)
                        elements.push(`<line x1="${arc.start_point.x}" y1="${arc.start_point.y}" x2="${end_point_on_arc.x}" y2="${end_point_on_arc.y}" class="debug start" />`);
                        elements.push(`<circle r="0.4" cx="${arc.end_point.x}" cy="${arc.end_point.y}" class="debug end"/>`)
                        break;
                    }
                    case (GeometryTypeEnum.CIRCLE): {
                        const circle = shape as Circle;
                        const length: number = 2;
                        const direction: boolean = (circle.direction == DirectionEnum.CW);
                        const {x, y} = pointAlongCircle(circle.center.x, circle.center.y, circle.radius, circle.start_point.x, circle.start_point.y, length, direction);
                        elements.push(`<circle r="0.4" cx="${circle.start_point.x}" cy="${circle.start_point.y}" class="debug start" />`)
                        elements.push(`<line x1="${circle.start_point.x}" y1="${circle.start_point.y}" x2="${x}" y2="${y}" class="debug start" />`);
                        // Point for center
                        elements.push(`<circle r="0.4" cx="${circle.center.x}" cy="${circle.center.y}" class="debug middle" />`)
                        // Line to start_point for radius
                        elements.push(`<line x1="${circle.center.x}" y1="${circle.center.y}" x2="${circle.start_point.x}" y2="${circle.start_point.y}" class="debug middle" />`);
                        break;
                    }
                    case (GeometryTypeEnum.CURVE): {
                        const curve = shape as Curve;
                        // Dot or each point
                        elements.push(`<circle r="0.4" cx="${curve.start_point.x}" cy="${curve.start_point.y}" class="debug start" />`)
                        elements.push(`<line x1="${curve.start_point.x}" y1="${curve.start_point.y}" x2="${curve.control_points[1].x}" y2="${curve.control_points[1].y}" class="debug start" />`);
                        elements.push(`<circle r="0.4" cx="${curve.control_points[1].x}" cy="${curve.control_points[1].y}" class="debug" />`)
                        elements.push(`<circle r="0.4" cx="${curve.end_point.x}" cy="${curve.end_point.y}" class="debug end" />`)
                        elements.push(`<line x1="${curve.end_point.x}" y1="${curve.end_point.y}" x2="${curve.control_points[1].x}" y2="${curve.control_points[1].y}" class="debug end" />`);
                        break;
                    };
                    case (GeometryTypeEnum.SEGMENT): {
                        const segment = shape as Segment;
                        const length: number = 2;
                        // Dot for each point
                        elements.push(`<circle r="0.4" cx="${segment.start_point.x}" cy="${segment.start_point.y}" class="debug start" />`)
                        // Start and end line on segment
                        const {x, y} = pointAlongSegment(segment.start_point.x, segment.start_point.y, segment.end_point.x, segment.end_point.y, length);
                        elements.push(`<line x1="${segment.start_point.x}" y1="${segment.start_point.y}" x2="${x}" y2="${y}" class="debug start" />`);
                        elements.push(`<circle r="0.4" cx="${segment.end_point.x}" cy="${segment.end_point.y}" class="debug end" />`)
                        break;
                    }
                }
            }
        }
        return elements;
    }

}