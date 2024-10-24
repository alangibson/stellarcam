import * as fs from 'fs';

import Konva from 'konva';

import { parseString } from 'dxf';
import { Segment } from './src/geometry/segment';
import { Point } from './src/geometry/point';
import { Arc, dxfBulgeToArc } from './src/geometry/arc';
import { Circle } from './src/geometry/circle';
import { Shape } from './src/geometry/shape';
import { ShapeConfig } from 'konva/lib/Shape';
import { GeometryTypeEnum } from './src/geometry/geometry.enum';
import { Area } from './src/geometry/area';
import { OriginEnum } from './src/geometry/origin.enum';
import { Curve } from './src/geometry/curve';
import { Multishape } from './src/geometry/multishape';
import { Grapher } from './src/geometry/graph/grapher';

//
// Parse DXF file
//

// Contains LINE: ./test/dxf/1.dxf
// Contains LWPOLYLINE with bulge: './test/dxf/AFluegel Rippen b2 0201.dxf'
// Contains SPLINE: './test/dxf/Tractor Light Mount - Left.dxf'
// Contains INSERT: Bogen_Ellipsen_Polylinien_Block.dxf
// Contains POLYLINE: SchlittenBack.dxf
// Tractor Seat Mount - Left.dxf
const parsed = parseString(fs.readFileSync('./test/dxf/Tractor Light Mount - Left.dxf', 'utf-8'));

// console.log('Dump:');
// console.log(parsed);

// console.log("Header:");
// console.log(parsed.header);

// console.log('Layers:');
// console.log(parsed.tables.layers);

// console.log('Viewports:');
// console.log(parsed.tables.vports)

// console.log('Entities:');
const area: Area = new Area();
const shapes: Shape[] = [];
for (let entity of parsed.entities) {
    switch (entity.type) {
        case 'LINE': {
            let segment = new Segment(
                new Point({ x: entity.start.x, y: entity.start.y }),
                new Point({ x: entity.end.x, y: entity.end.y }));
            shapes.push(segment);
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
            shapes.push(arc);
            area.add(arc);
            break;
        }
        case 'CIRCLE': {
            let circle = new Circle({
                center: new Point({ x: entity.x, y: entity.y }),
                radius: entity.r
            });
            shapes.push(circle);
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
                        shapes.push(arc);
                        area.add(arc);
                    } else {
                        let segment: Segment = new Segment(last_point, this_point);
                        shapes.push(segment);
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
            shapes.push(spline);
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

//
// Derive and fix DXF data
//

// Connect all points within given tolerance
const grapher = new Grapher();
const adjacency_list: number[][] = grapher.adjacency_list(shapes);
const connections = grapher.connect(adjacency_list, shapes);

// Create Multishapes from connected shapes
const multishapes: Multishape[] = [];
for (let visited_set of connections) {
    const multishape = new Multishape();
    for (let shape_i of visited_set.values()) {
        const shape: Shape = shapes[shape_i];
        multishape.shapes.push(shape);
    }
    multishapes.push(multishape);
}

// Translate Area, and all Geometry in it, so that 0,0 is at bottom-left
const origin = area.origin;
const translateX = -origin.x;
const translateY = -origin.y;
area.translate(translateX, translateY);

// Project into Canvas coordinates (ie 0,0 at top-left)
area.project(OriginEnum.TOP_LEFT);

//
// Render DXF
//

const stage = new Konva.Stage({
    // Don't use with nodejs
    // container: 'container',
    // Coordinates start (ie. 0,0) in the top-left corner of the canvas 
    width: area.width,
    height: area.height,
});

// Add Layer(s)
// TODO make a Layer for each DXF layer
var layer = new Konva.Layer();
stage.add(layer);

const config: ShapeConfig = {
    fill: '#00D2FF',
    stroke: 'black',
    strokeWidth: 1,
};

const svg_paths: string[] = [];
for (let multishape of multishapes) {
    let svg_path: string = "";
    for (let shape of multishape.shapes) {
        switch (shape.type) {
            case GeometryTypeEnum.SEGMENT: {
                // SVG path
                svg_path += shape.command;
                break;
            }
            case GeometryTypeEnum.ARC: {
                // SVG path
                svg_path += shape.command;
                break;
            }
            case GeometryTypeEnum.CIRCLE: {
                // SVG path
                svg_path += shape.command;
                break;
            }
            case GeometryTypeEnum.CURVE: {
                // SVG path
                svg_path += shape.command;
                break;
            }
            default: {
                console.log("Unknown shape type: %s", shape.type);
                break;
            }
        }
    }
    svg_paths.push(svg_path);
}

function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

const dataURL = stage.toDataURL({ pixelRatio: 10 });
let html = `
<html>
<body>
<svg width="${area.width}" height="${area.height}">
`;
for (let i = 0; i < svg_paths.length; i++) {
    const svg_path = svg_paths[i];
    const stroke: string = getRandomColor();
    html += `<path fill="none" stroke="${stroke}" stroke-width="0.4" d="${svg_path}" />`;
}
html += `</svg>
<img width="${area.width}" height="${area.height}" src="${dataURL}"/>
</body>
</html>
`
fs.writeFile('test.html', html, (e) => { });
