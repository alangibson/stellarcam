import * as fs from 'fs';
import { parseString } from 'dxf';
import { Arc } from "../geometry/arc";
import { Area } from "../geometry/area";
import { Circle } from "../geometry/circle";
import { Curve } from "../geometry/curve";
import { Point } from "../geometry/point";
import { Segment } from "../geometry/segment";
import { dxfBulgeToArc } from './dxf.function';
import { PointProperties } from 'svg-path-commander';

function dxfToArea(parsed): Area {
    const area: Area = new Area();
    for (let entity of parsed.entities) {
        switch (entity.type) {
            case 'LINE': {
                let segment = new Segment(
                    new Point({ x: entity.start.x, y: entity.start.y }),
                    new Point({ x: entity.end.x, y: entity.end.y }));
                area.add(segment);
                break;
            }
            case 'ARC': {
                let arc = new Arc({
                    center: new Point({ x: entity.x, y: entity.y }),
                    radius: entity.r,
                    start_angle: entity.startAngle,
                    end_angle: entity.endAngle
                });
                area.add(arc);
                break;
            }
            case 'CIRCLE': {
                let circle = new Circle({
                    center: new Point({ x: entity.x, y: entity.y }),
                    radius: entity.r
                });
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
                            area.add(dxfBulgeToArc(last_point, this_point, last_vertex.bulge));
                        } else {
                            area.add(new Segment(last_point, this_point));
                        }
                    }
                    last_point = this_point;
                    last_vertex = vertex;
                }
                break;
            }
            case 'POLYLINE': {
                let last_point: Point;
                let last_vertex: PointProperties;
                for (let vertex of entity.vertices) {
                    let this_point: Point = new Point(vertex);
                    if (last_point) {
                        area.add(new Segment(last_point, this_point));
                    }
                    last_vertex = vertex;
                    last_point = this_point;
                }
                break;
            }
            case 'SPLINE': { // Actually a Bezier curve
                const control_points = [];
                for (let cp of entity.controlPoints) {
                    control_points.push(new Point(cp));
                }
                area.add(new Curve({ control_points, knots: entity.knots }));
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