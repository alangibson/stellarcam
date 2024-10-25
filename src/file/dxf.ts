import * as fs from 'fs';
import { parseString } from 'dxf';
import { Arc } from "../geometry/arc";
import { Area } from "../geometry/area";
import { Circle } from "../geometry/circle";
import { Curve } from "../geometry/curve";
import { Point } from "../geometry/point";
import { Segment } from "../geometry/segment";
import { Shape } from "../geometry/shape";

/**
 * Converts a DXF LWPOLYLINE bulge to an arc (center, radius, start angle, end angle).
 *
 * @param {number[]} startPoint - [x1, y1] coordinates of the start point of the segment.
 * @param {number[]} endPoint - [x2, y2] coordinates of the end point of the segment.
 * @param {number} bulge - The bulge value of the polyline segment.
 * @returns {object} Arc information with center, radius, start angle, end angle (in radians).
 */
export function dxfBulgeToArc(startPoint: Point, endPoint: Point, bulge: number): Arc {
    const [x1, y1] = [startPoint.x, startPoint.y];
    const [x2, y2] = [endPoint.x, endPoint.y];

    // console.log(`bulgeToArc. ${bulge} ${startPoint.x},${startPoint.y} ${endPoint.x},${endPoint.y}`);
    // Calculate the distance between start and end points (chord length)
    const chordLength = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    // console.log(`  chordLength: ${chordLength}`);
    // Calculate the included angle (in radians) from the bulge
    const includedAngle = 4 * Math.atan(Math.abs(bulge));
    // console.log(`  includedAngle: ${includedAngle}`);
    // Calculate the radius of the arc (radius is always positive)
    const radius = chordLength / (2 * Math.sin(includedAngle / 2));
    // console.log(`  radius: ${radius}`);
    // Midpoint of the chord
    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;
    // console.log(`  mid: ${midX},${midY}`);
    // Perpendicular distance from the midpoint to the arc center
    const perpendicularDistance = radius * Math.cos(includedAngle / 2);
    // console.log(`  perpendicularDistance: ${perpendicularDistance}`);
    // Calculate the direction of the bulge (positive or negative determines arc direction)
    const dirX = -(y2 - y1) / chordLength; // Perpendicular direction X
    const dirY = (x2 - x1) / chordLength; // Perpendicular direction Y

    // console.log(`  dir: ${dirX},${dirY}`);
    // Calculate the center of the arc (bulge sign affects direction)
    const centerX = midX + dirX * perpendicularDistance * Math.sign(bulge);
    const centerY = midY + dirY * perpendicularDistance * Math.sign(bulge);
    // console.log(`  center: ${centerX},${centerY}`);
    // Calculate the start and end angles relative to the arc's center
    let startAngle = Math.atan2(y1 - centerY, x1 - centerX);
    let endAngle = Math.atan2(y2 - centerY, x2 - centerX);
    // For negative bulges, the arc is drawn clockwise, so we swap start and end angles
    if (bulge < 0) {
        [startAngle, endAngle] = [endAngle, startAngle];
    }
    // console.log(`  startAngle: ${startAngle}, endAngle: ${endAngle}`);
    return new Arc({
        center: new Point({ x: centerX, y: centerY }),
        radius: radius,
        start_angle: startAngle,
        end_angle: endAngle
    });
}


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
                            let arc: Arc = dxfBulgeToArc(last_point, this_point, last_vertex.bulge);
                            area.add(arc);
                        } else {
                            let segment: Segment = new Segment(last_point, this_point);
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