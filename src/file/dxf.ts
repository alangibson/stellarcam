import * as fs from 'fs';
import { parseString } from 'dxf';
import { Arc, dxfBulgeToArc } from "../geometry/arc";
import { Area } from "../geometry/area";
import { Circle } from "../geometry/circle";
import { Curve } from "../geometry/curve";
import { Point } from "../geometry/point";
import { Segment } from "../geometry/segment";
import { Shape } from "../geometry/shape";

function dxfToArea(parsed): Area {
    const area: Area = new Area();
    // const shapes: Shape[] = [];
    for (let entity of parsed.entities) {
        switch (entity.type) {
            case 'LINE': {
                let segment = new Segment(
                    new Point({ x: entity.start.x, y: entity.start.y }),
                    new Point({ x: entity.end.x, y: entity.end.y }));
                // shapes.push(segment);
                area.add(segment);
                break;
            }
            case 'ARC': {
                console.log(entity);
                let arc = new Arc({
                    center: new Point({ x: entity.x, y: entity.y }),
                    radius: entity.r,
                    start_angle: entity.startAngle,
                    end_angle: entity.endAngle
                });
                // shapes.push(arc);
                area.add(arc);
                break;
            }
            case 'CIRCLE': {
                let circle = new Circle({
                    center: new Point({ x: entity.x, y: entity.y }),
                    radius: entity.r
                });
                // shapes.push(circle);
                area.add(circle);
                break;
            }
            case 'LWPOLYLINE': {
                let last_point: Point;
                let last_vertex;
                for (let vertex of entity.vertices) {
                    let this_point: Point = new Point({ x: vertex.x, y: vertex.y });
                    if (last_point) {
                        if ('bulge' in last_vertex) {
                            let arc: Arc = dxfBulgeToArc(last_point, this_point, last_vertex.bulge);
                            // shapes.push(arc);
                            area.add(arc);
                        } else {
                            let segment: Segment = new Segment(last_point, this_point);
                            // shapes.push(segment);
                            area.add(segment);
                        }
                    }
                    last_point = this_point;
                    last_vertex = vertex;
                }
                break;
            }
            case 'SPLINE': {
                // {
                //     type: 'SPLINE',
                //     controlPoints: [
                //       { x: -40.30576587070473, y: 27.24345637206587, z: 0 },
                //       { x: -40.66977285963891, y: 26.31451053630582, z: 0 },
                //       { x: -41.21723937099593, y: 25.62144122937513, z: 0 }
                //     ],
                //     knots: [ 0, 0, 0, 1, 1, 1 ],
                //     flag: 8,
                //     closed: false,
                //     degree: 2,
                //     numberOfFitPoints: 0,
                //     knotTolerance: 1e-9,
                //     controlPointTolerance: 1e-8
                //   }
                const control_points = [];
                for (let cp of entity.controlPoints) {
                    control_points.push(new Point(cp));
                }
                let spline = new Curve({ control_points, knots: entity.knots });
                // shapes.push(spline);
                area.add(spline);
                break;
            }
            case 'VIEWPORT': {
                break;
            }
            default: {
                console.log("Unknown:");
                console.log(entity);
                break;
            }
        }
    }
    return area;
}

export class DxfFile {

    load(path: string): Area {
        const parsed = parseString(fs.readFileSync(path, 'utf-8'));
        return dxfToArea(parsed);
    }

    // console.log('Dump:');
    // console.log(parsed);

    // console.log("Header:");
    // console.log(parsed.header);

    // console.log('Layers:');
    // console.log(parsed.tables.layers);

    // console.log('Viewports:');
    // console.log(parsed.tables.vports)

    // console.log('Entities:');


}