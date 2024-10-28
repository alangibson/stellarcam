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

function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

export class DebugVisualization implements Visualization {

    to_svg(multishapes: Multishape[]): string[] {
        const elements: string[] = [];
        elements.push("<style>");
        elements.push(".debug { fill:none; stroke: gray; opacity: 1; stroke-width: 0.2; }");
        elements.push("path.debug.multishape { stroke-width: 1; opacity: 1; }");
        elements.push("path.debug.shape { stroke-width: 0.5; opacity: 1; }");
        elements.push("line.debug.middle { stroke-dasharray: 0.5; }");
        elements.push(".debug.start { stroke: green; opacity: 1;}");
        elements.push(".debug.middle { stroke: blue; }");
        elements.push(".debug.end { stroke: red; stroke-width: 0.5; opacity: 1; }");
        elements.push("</style>");
        for (let multishape of multishapes) {
            let multishape_elements: string[] = [];
            let multishape_svg_path = "";
            const multishapeColor: string = getRandomColor();

            // TODO move to end
            // Multishape start point. This will also be cut start point.
            multishape_elements.push(`<circle r="1" cx="${multishape.start_point.x}" cy="${multishape.start_point.y}" class="debug" style="stroke: yellow;" onClick='console.log(${JSON.stringify(multishape.start_point)})'/>`)

            for (let shape of multishape.shapes) {
                const shapeColor: string = getRandomColor();
                multishape_svg_path += shape.command;

                multishape_elements.push(`<path class="debug shape" style="stroke:${shapeColor}" d="${shape.command}" onClick='console.log(${JSON.stringify(shape)})' />`);

                switch (shape.type) {
                    case (GeometryTypeEnum.ARC): {
                        const arc = shape as Arc;
                        // Line to midpoint for radius
                        multishape_elements.push(`<line x1="${arc.center.x}" y1="${arc.center.y}" x2="${arc.middle_point.x}" y2="${arc.middle_point.y}" class="debug middle" onClick='console.log(${JSON.stringify(arc.center)}, ${JSON.stringify(arc.middle_point)})' />`);
                        // Point for center
                        multishape_elements.push(`<circle r="0.4" cx="${arc.center.x}" cy="${arc.center.y}" class="debug middle" onClick='console.log(${JSON.stringify(arc.center)})'/>`)
                        // Add direction arrows
                        const length: number = 2;
                        // FIXME why does direction need to be negated to be correct?
                        const direction: boolean = !(arc.direction == DirectionEnum.CW);
                        const {x, y} = pointAlongArc(arc.center.x, arc.center.y, arc.radius, arc.start_angle, arc.end_angle, length, direction)
                        const end_point_on_arc: Point = new Point({x, y});
                        multishape_elements.push(`<line x1="${arc.start_point.x}" y1="${arc.start_point.y}" x2="${end_point_on_arc.x}" y2="${end_point_on_arc.y}" class="debug start" onClick='console.log(${JSON.stringify(arc.start_point)})'/>`);
                        multishape_elements.push(`<circle r="0.4" cx="${arc.start_point.x}" cy="${arc.start_point.y}" class="debug start" onClick='console.log(${JSON.stringify(arc.start_point)})'/>`)
                        multishape_elements.push(`<circle r="0.4" cx="${arc.end_point.x}" cy="${arc.end_point.y}" class="debug end" onClick='console.log(${JSON.stringify(arc.end_point)})'/>`)
                        break;
                    }
                    case (GeometryTypeEnum.CIRCLE): {
                        const circle = shape as Circle;
                        const length: number = 2;
                        const direction: boolean = (circle.direction == DirectionEnum.CW);
                        const {x, y} = pointAlongCircle(circle.center.x, circle.center.y, circle.radius, circle.start_point.x, circle.start_point.y, length, direction);
                        multishape_elements.push(`<circle r="0.4" cx="${circle.start_point.x}" cy="${circle.start_point.y}" class="debug start" />`)
                        multishape_elements.push(`<line x1="${circle.start_point.x}" y1="${circle.start_point.y}" x2="${x}" y2="${y}" class="debug start" />`);
                        // Point for center
                        multishape_elements.push(`<circle r="0.4" cx="${circle.center.x}" cy="${circle.center.y}" class="debug middle" />`)
                        // Line to start_point for radius
                        multishape_elements.push(`<line x1="${circle.center.x}" y1="${circle.center.y}" x2="${circle.start_point.x}" y2="${circle.start_point.y}" class="debug middle" />`);
                        break;
                    }
                    case (GeometryTypeEnum.CURVE): {
                        const curve = shape as Curve;
                        // Dot or each point
                        multishape_elements.push(`<circle r="0.4" cx="${curve.start_point.x}" cy="${curve.start_point.y}" class="debug start" />`)
                        multishape_elements.push(`<line x1="${curve.start_point.x}" y1="${curve.start_point.y}" x2="${curve.control_points[1].x}" y2="${curve.control_points[1].y}" class="debug start" />`);
                        multishape_elements.push(`<circle r="0.4" cx="${curve.control_points[1].x}" cy="${curve.control_points[1].y}" class="debug" />`)
                        multishape_elements.push(`<circle r="0.4" cx="${curve.end_point.x}" cy="${curve.end_point.y}" class="debug end" />`)
                        multishape_elements.push(`<line x1="${curve.end_point.x}" y1="${curve.end_point.y}" x2="${curve.control_points[1].x}" y2="${curve.control_points[1].y}" class="debug end" />`);
                        break;
                    };
                    case (GeometryTypeEnum.SEGMENT): {
                        const segment = shape as Segment;
                        const length: number = 2;
                        // Start and end line on segment
                        const {x, y} = pointAlongSegment(segment.start_point.x, segment.start_point.y, segment.end_point.x, segment.end_point.y, length);
                        multishape_elements.push(`<line x1="${segment.start_point.x}" y1="${segment.start_point.y}" x2="${x}" y2="${y}" class="debug start" onClick='console.log(${JSON.stringify(segment.start_point)})'/>`);
                        // Dot for each point
                        multishape_elements.push(`<circle r="0.4" cx="${segment.start_point.x}" cy="${segment.start_point.y}" class="debug start" onClick='console.log(${JSON.stringify(segment.start_point)})' />`)
                        multishape_elements.push(`<circle r="0.4" cx="${segment.end_point.x}" cy="${segment.end_point.y}" class="debug end" onClick='console.log(${JSON.stringify(segment.end_point)})' />`)
                        break;
                    }
                }
            }

            // Draw path for multishape. stroke width is 2x shape width
            multishape_elements.unshift(`<path class="debug multishape" style="stroke:${multishapeColor}" d="${multishape_svg_path}" onClick='console.log(${JSON.stringify(multishape)})'/>`);

            // Append multishape_elements to elements
            elements.push(...multishape_elements);
        }
        
        return elements;
    }

}