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
import { Shape } from '../geometry/shape';
import { degreesToRadians, radiansToDegrees } from '../geometry/arc.function';

function dxfEntityToShapes(entity, blocks): Shape[] {
    switch (entity.type) {
        case 'LINE': {
            let segment = new Segment(
                new Point({ x: entity.start.x, y: entity.start.y }),
                new Point({ x: entity.end.x, y: entity.end.y }));
            return [segment];
        }
        case 'ARC': {
            let arc = new Arc({
                center: new Point({ x: entity.x, y: entity.y }),
                radius: entity.r,
                startAngle: entity.startAngle,
                endAngle: entity.endAngle
            });
            return [arc];
        }
        case 'CIRCLE': {
            let circle = new Circle({
                center: new Point({ x: entity.x, y: entity.y }),
                radius: entity.r
            });
            return [circle];
        }
        case 'ELLIPSE': {
            const ellipse = new Ellipse(entity);
            return ellipse.toCurves();
        }
        case 'LWPOLYLINE': {
            let last_point: Point;
            let last_vertex;
            const out: Shape[] = [];
            for (let vertex of entity.vertices) {
                let this_point: Point = new Point({ x: vertex.x, y: vertex.y });
                if (last_point) {
                    if ('bulge' in last_vertex) {
                        const arc = dxfBulgeToArc(last_point, this_point, last_vertex.bulge);
                        out.push(arc);
                    } else {
                        const segment = new Segment(last_point, this_point);
                        out.push(segment);
                    }
                }
                last_point = this_point;
                last_vertex = vertex;
            }
            return out;
        }
        case 'POLYLINE': {
            let last_point: Point;
            let last_vertex: PointProperties;
            const out: Shape[] = [];
            for (let vertex of entity.vertices) {
                let this_point: Point = new Point(vertex);
                if (last_point) {
                    const segment = new Segment(last_point, this_point);
                    // area.add();
                    out.push(segment);
                }
                last_vertex = vertex;
                last_point = this_point;
            }
            return out;
        }
        case 'SPLINE': { // Actually a Bezier curve
            const control_points = [];
            for (let cp of entity.controlPoints) {
                control_points.push(new Point(cp));
            }
            const curve = new QuadraticCurve({ control_points, knots: entity.knots });
            return [curve];
        }
        case 'INSERT': {
            const block = blocks[entity.block];
            const out: Shape[] = [];
            for (let block_entity of block.entities) {
                // Immediately recurse to get a Shape so we can tranform it
                const shapes: Shape[] = dxfEntityToShapes(block_entity, blocks);
                for (const shape of shapes) {
                    // Apply offset of entity.x, entity.y
                    shape.translate(entity.x, entity.y);
                    // Apply rotation of entity.rotation (in degrees)
                    // Centroid doesn't work here when we have a single shape 
                    // split into multiple shapes. The shape needs to be 
                    // rotated as-is.
                    if (entity.rotation) {
                        const centroid: Point = shape.boundary.centroid;
                        shape.rotate(centroid, degreesToRadians(entity.rotation));
                    }
                    // TODO Apply scale of entity.scaleX, entity.scaleY
                    // shape.scale(entity.scaleX, entity.scaleY);
                }
                out.push(...shapes);
            }
            return out;
        }
        case 'VIEWPORT': {
            return [];
        }
        default: {
            console.log("Unknown DXF entity:");
            console.log(entity);
            return [];
        }
    }
}

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
        const shapes: Shape[] = dxfEntityToShapes(entity, blocks);
        shapes.forEach((shape: Shape) => area.add(shape));
    }
    return area;
}

export class DxfFile {

    load(path: string): Area {
        const parsed = parseString(fs.readFileSync(path, 'utf-8'));
        return dxfToArea(parsed);
    }

}