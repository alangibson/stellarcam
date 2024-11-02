import { Multishape } from "../../../domain/multishape";
import { Arc } from "../../../geometry/arc/arc";
import { pointAlongArc } from "../../../geometry/arc/arc.function";
import { Circle } from "../../../geometry/circle/circle";
import { pointAlongCircle } from "../../../geometry/circle/circle.function";
import { QuadraticCurve } from "../../../geometry/quadratic-curve/quadratic-curve";
import { DirectionEnum, GeometryTypeEnum } from "../../../geometry/geometry.enum";
import { Point } from "../../../geometry/point/point";
import { Segment } from "../../../geometry/segment/segment";
import { pointOnSegment } from "../../../geometry/segment/segment.function";
import { Visualization } from "./visualization";
import { CubicCurve } from "../../../geometry/cubic-curve/cubic-curve";
import { Layer } from "../../../domain/layer";

function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

export class DebugVisualization implements Visualization {

    toSVG(layer: Layer): string[] {
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

        for (const cut of layer.children) {
            const multishapes: Multishape[] = cut.children;

            for (let multishape of multishapes) {
                let multishape_elements: string[] = [];
                let multishape_svg_path = "";
                const multishapeColor: string = getRandomColor();
    
                // TODO move to end
                // Multishape start point. This will also be cut start point.
                multishape_elements.push(`<circle r="1" cx="${multishape.startPoint.x}" cy="${multishape.startPoint.y}" class="debug" style="stroke: yellow;" onClick='console.log(${JSON.stringify(multishape.startPoint)})'/>`)
    
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
                            const {x, y} = pointAlongArc(arc.center.x, arc.center.y, arc.radius, arc.startAngle, arc.endAngle, length, direction)
                            const endPoint_on_arc: Point = new Point({x, y});
                            multishape_elements.push(`<line x1="${arc.startPoint.x}" y1="${arc.startPoint.y}" x2="${endPoint_on_arc.x}" y2="${endPoint_on_arc.y}" class="debug start" onClick='console.log(${JSON.stringify(arc.startPoint)})'/>`);
                            multishape_elements.push(`<circle r="0.4" cx="${arc.startPoint.x}" cy="${arc.startPoint.y}" class="debug start" onClick='console.log(${JSON.stringify(arc.startPoint)})'/>`)
                            multishape_elements.push(`<circle r="0.4" cx="${arc.endPoint.x}" cy="${arc.endPoint.y}" class="debug end" onClick='console.log(${JSON.stringify(arc.endPoint)})'/>`)
                            break;
                        }
                        case (GeometryTypeEnum.CIRCLE): {
                            const circle = shape as Circle;
                            const length: number = 2;
                            const direction: boolean = (circle.direction == DirectionEnum.CW);
                            const {x, y} = pointAlongCircle(circle.center.x, circle.center.y, circle.radius, circle.startPoint.x, circle.startPoint.y, length, direction);
                            multishape_elements.push(`<circle r="0.4" cx="${circle.startPoint.x}" cy="${circle.startPoint.y}" class="debug start" />`)
                            multishape_elements.push(`<line x1="${circle.startPoint.x}" y1="${circle.startPoint.y}" x2="${x}" y2="${y}" class="debug start" />`);
                            // Point for center
                            multishape_elements.push(`<circle r="0.4" cx="${circle.center.x}" cy="${circle.center.y}" class="debug middle" />`)
                            // Line to startPoint for radius
                            multishape_elements.push(`<line x1="${circle.center.x}" y1="${circle.center.y}" x2="${circle.startPoint.x}" y2="${circle.startPoint.y}" class="debug middle" />`);
                            break;
                        }
                        case (GeometryTypeEnum.QUADRATIC_CURVE): {
                            const curve = shape as QuadraticCurve;
                            // Dot or each point
                            multishape_elements.push(`<circle r="0.4" cx="${curve.startPoint.x}" cy="${curve.startPoint.y}" class="debug start" />`)
                            multishape_elements.push(`<line x1="${curve.startPoint.x}" y1="${curve.startPoint.y}" x2="${curve.control1.x}" y2="${curve.control1.y}" class="debug start" />`);
                            multishape_elements.push(`<circle r="0.4" cx="${curve.control1.x}" cy="${curve.control1.y}" class="debug" />`)
                            multishape_elements.push(`<circle r="0.4" cx="${curve.endPoint.x}" cy="${curve.endPoint.y}" class="debug end" />`)
                            multishape_elements.push(`<line x1="${curve.endPoint.x}" y1="${curve.endPoint.y}" x2="${curve.control1.x}" y2="${curve.control1.y}" class="debug end" />`);
                            break;
                        };
                        case (GeometryTypeEnum.CUBIC_CURVE): {
                            const curve = shape as CubicCurve;
                            // Dot or each point
                            multishape_elements.push(`<circle r="0.4" cx="${curve.startPoint.x}" cy="${curve.startPoint.y}" class="debug start" />`)
                            multishape_elements.push(`<circle r="0.4" cx="${curve.endPoint.x}" cy="${curve.endPoint.y}" class="debug end" />`)
                            // TODO bring back
                            // multishape_elements.push(`<line x1="${curve.startPoint.x}" y1="${curve.startPoint.y}" x2="${curve.control1.x}" y2="${curve.control1.y}" class="debug start" />`);
                            // multishape_elements.push(`<circle r="0.4" cx="${curve.control1.x}" cy="${curve.control1.y}" class="debug" />`)
                            // multishape_elements.push(`<line x1="${curve.endPoint.x}" y1="${curve.endPoint.y}" x2="${curve.control1.x}" y2="${curve.control1.y}" class="debug end" />`);
                            break;
                        };
                        case (GeometryTypeEnum.SEGMENT): {
                            const segment = shape as Segment;
                            const length: number = 2;
                            // Start and end line on segment
                            const {x, y} = pointOnSegment(segment.startPoint.x, segment.startPoint.y, segment.endPoint.x, segment.endPoint.y, length);
                            multishape_elements.push(`<line x1="${segment.startPoint.x}" y1="${segment.startPoint.y}" x2="${x}" y2="${y}" class="debug start" onClick='console.log(${JSON.stringify(segment.startPoint)})'/>`);
                            // Dot for each point
                            multishape_elements.push(`<circle r="0.4" cx="${segment.startPoint.x}" cy="${segment.startPoint.y}" class="debug start" onClick='console.log(${JSON.stringify(segment.startPoint)})' />`)
                            multishape_elements.push(`<circle r="0.4" cx="${segment.endPoint.x}" cy="${segment.endPoint.y}" class="debug end" onClick='console.log(${JSON.stringify(segment.endPoint)})' />`)
                            break;
                        }
                    }
                }
    
                // Draw path for multishape. stroke width is 2x shape width
                multishape_elements.unshift(`<path class="debug multishape" style="stroke:${multishapeColor}" d="${multishape_svg_path}" onClick='console.log(${JSON.stringify(multishape)})'/>`);
    
                // Append multishape_elements to elements
                elements.push(...multishape_elements);
            }
                        
        }

        return elements;
    }

}