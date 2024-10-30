import * as fs from 'fs';
import { parseString } from 'dxf';
import { Arc } from "../geometry/arc";
import { Area } from "../geometry/area";
import { Circle } from "../geometry/circle";
import { QuadraticCurve } from "../geometry/quadratic-curve";
import { Point, PointProperties } from "../geometry/point";
import { Segment } from "../geometry/segment";
import { dxfBulgeToArc } from './dxf.function';
import { Ellipse } from './dxf/ellipse';
import { CubicCurve } from '../geometry/cubic-curve';

function dxfToArea(parsed): Area {

    // Make map of blocks to use with insert elements later
    const blocks: {} = {};
    for (let block of parsed.blocks) {
        blocks[block.name] = block;
    }

    const area: Area = new Area();
    const entities = [...parsed.entities];
    while (entities.length > 0) {
        let entity = entities.shift();
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
            case 'ELLIPSE': {
                const ellipse = new Ellipse(entity);
                ellipse.toCurves().forEach((curve: CubicCurve) => area.add(curve));
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
                area.add(new QuadraticCurve({ control_points, knots: entity.knots }));
                break;
            }
            case 'INSERT': {
                // const block = blocks[entity.block];
                // for (let block_entity of block.entities) {

                //     // console.log(`INSERT x=${entity.x},y=${entity.y}`);
                //     // console.log(`  BLOCK x=${block_entity.x},y=${block_entity.y}`);
                //     // console.log(block_entity);

                //     // TODO modify blocks?
                //     //
                //     // if ('vertices' in block_entity) {
                //     //     // TODO if block_entity.vertices, then offset each point?
                //     //     for (let vertex of block_entity.vertices) {
                //     //         vertex.x += entity.x;
                //     //         vertex.y += entity.y;
                //     //     }
                //     // } else {
                //     //     block_entity.x += entity.x;
                //     //     block_entity.y += entity.y;
                //     // }

                //     entities.push(block_entity);
                // }
                console.log('INSERT not supported');
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

}