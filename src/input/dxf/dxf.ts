import * as fs from 'fs';
import { parseString } from 'dxf';
import { Arc } from "../../geometry/arc/arc";
import { Circle } from "../../geometry/circle/circle";
import { QuadraticCurve } from "../../geometry/quadratic-curve/quadratic-curve";
import { Point, PointProperties } from "../../geometry/point/point";
import { Segment } from "../../geometry/segment/segment";
import { Ellipse } from '../../geometry/ellipse/ellipse';
import { Shape } from '../../geometry/shape';
import { dxfBulgeToArc } from '../../input/dxf/dxf.function';
import { degreesToRadians } from '../../geometry/arc/arc.function';
import { DXFDrawing } from '../../input/dxf/dxf-drawing';
import { DXFLayer } from '../../input/dxf/dxf-layer';

function dxfEntityToShapes(entity, blocks): Shape[] {
    switch (entity.type) {
        case 'LINE': {
            let segment = new Segment({
                startPoint: { x: entity.start.x, y: entity.start.y },
                endPoint: { x: entity.end.x, y: entity.end.y }
            });
            return [segment];
        }
        case 'ARC': {
            let arc = new Arc({
                center: { x: entity.x, y: entity.y },
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
                        const segment = new Segment({startPoint: last_point, endPoint: this_point});
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
                    const segment = new Segment({startPoint: last_point, endPoint: this_point});
                    // area.add();
                    out.push(segment);
                }
                last_vertex = vertex;
                last_point = this_point;
            }
            return out;
        }
        case 'SPLINE': { // Actually a Bezier curve
            const curve = new QuadraticCurve({ 
                startPoint: new Point(entity.controlPoints[0]),
                control1: new Point(entity.controlPoints[1]),
                endPoint: new Point(entity.controlPoints[2]),
             });
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

/** Convert DXF file contents into a Drawing */
function dxfToDrawing(dxfEntities: {}[], dxfBlocks: {}[], dxfLayers: {[key: string]: {}[]}): DXFDrawing {
    
    // Make map of blocks to use with insert elements later
    const dxfBlocksLookup: {} = {};
    for (let block of dxfBlocks) {
        dxfBlocksLookup[block['name']] = block;
    }

    // Build up list of Shape by layer name
    const layerNameToDxfLayerMap: {[key:string]: DXFLayer} = {};
    for (const dxfEntity of dxfEntities) {
        const layerName: string = dxfEntity['layer'];
        if (! layerNameToDxfLayerMap.hasOwnProperty(layerName))
            layerNameToDxfLayerMap[layerName] = new DXFLayer(layerName);
        const shapes: Shape[] = dxfEntityToShapes(dxfEntity, dxfBlocksLookup);
        layerNameToDxfLayerMap[layerName].shapes.push(...shapes);
    }

    return new DXFDrawing(layerNameToDxfLayerMap);
}

export class DxfFile {

    load(path: string): DXFDrawing {
        const parsed = parseString(fs.readFileSync(path, 'utf-8'));
        return dxfToDrawing(parsed.entities, parsed.blocks, parsed.tables.layers);;
    }

}