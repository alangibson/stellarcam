import * as fs from 'fs';

import Konva from 'konva';

import { parseString } from 'dxf';
import { Segment } from './src/geometry/segment';
import { Point } from './src/geometry/point';
import { Arc, bulgeToArc } from './src/geometry/arc';
import { Circle } from './src/geometry/circle';
import { Shape } from './src/geometry/shape';
import { Graphic } from './src/graphic/graphic';
import { ShapeConfig } from 'konva/lib/Shape';
import { GeometryTypeEnum } from './src/geometry/geometry.enum';
import { Area } from './src/geometry/area';
import { OriginEnum } from './src/geometry/origin.enum';
import { SegmentGraphic } from './src/graphic/segment';
import { ArcGraphic } from './src/graphic/arc';
import { Spline } from './src/geometry/spline';
import { Multishape } from './src/geometry/multishape';

//
// Parse DXF file
//

// Contains LINE: ./test/dxf/1.dxf
// Contains LWPOLYLINE with bulge: './test/dxf/AFluegel Rippen b2 0201.dxf'
// Contains SPLINE: './test/dxf/Tractor Light Mount - Left.dxf'
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
            let arc = new Arc({ 
                center: new Point({ x: entity.x, y: entity.y }), 
                radius: entity.r, 
                start_angle: entity.startAngle, 
                end_angle: entity.endAngle });
            shapes.push(arc);
            area.add(arc);
            break;
        }
        case 'CIRCLE': {
            let circle = new Circle({ 
                center: new Point({ x: entity.x, y: entity.y }), 
                radius: entity.r });
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
                        let arc: Arc = bulgeToArc(last_point, this_point, last_vertex.bulge);
                        // arc.type = 'bulge' as any;
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
                // TODO are we missing the last segment?
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
            let spline = new Spline({control_points, knots: entity.knots});
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
//
// Create matrix of distance between all start and end points
// Geometry is identified by index in `shapes` array
const links_matrix = [];
const TOLERANCE = 0.1;
for (let ir in shapes) {
    links_matrix[ir] = [];
    for (let ic in shapes) {
        const distance = shapes[ir].end_point.distance(shapes[ic].start_point)
        if (ir == ic) {
            links_matrix[ir][ic] = null;
        } else if (distance <= TOLERANCE) {
            links_matrix[ir][ic] = true;
        } else {
            links_matrix[ir][ic] = false;
        }
    }
}

// Seach backward to head of shape
function search_reverse(col_i) {
    let found = [];
    for (let row_i in links_matrix) {
        if (links_matrix[row_i][col_i] === true) {
            // Avoid infinite loops
            links_matrix[row_i][col_i] = null;
            found.push([row_i, col_i]);
            const r = search_reverse(row_i);
            found.push(...r);
            // FIXME dont return. we can miss true cells this way
            // return found;
        }
    }   
    // No true value in column if we got here
    return found;
}

// Search forward to end of shape
function search_forward(row_i) {
    // Iterate through all column cells in row
    let found = [];
    for (let col_i in links_matrix[row_i]) {
        if (links_matrix[row_i][col_i] === true) {
            // Avoid infinite loops
            links_matrix[row_i][col_i] = null;
            // We found a match, record it and recurse
            found.push([row_i, col_i]);
            const r = search_forward(col_i);
            found.push(...r);
            // return found;
        } // else just go on to next cell
    }
    return found;
}
const linkages = [];
for (let shape_i in shapes) {
    const reverse = search_reverse(shape_i).reverse();
    const forward = search_forward(shape_i);
    const complete = [...reverse, ...forward];
    if (complete.length > 0)
        linkages.push(complete);
}
console.log(links_matrix);

const multishapes: Multishape[] = [];
for (let linkage of linkages) {
    const s: Shape[] = [];
    for (let link of linkage) {
        s.push(shapes[link[0]]);
    }
    multishapes.push(new Multishape(s));
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
const svg_geo_types: string[] = [];
for (let multishape of multishapes) {
    let svg_path: string = "";
    let geo_types: string = "";
    // const graphics: Graphic[] = [];
    for (let shape of multishape.shapes) {
        // let graphic: Graphic;
        switch (shape.type) {
            case GeometryTypeEnum.SEGMENT: {
                // SVG path
                svg_path += shape.command;
                geo_types += `${shape.type},`;
                // Konva graphic
                // graphic = new SegmentGraphic(shape as Segment, config)
                // graphics.push(graphic);
                // let konvaShape = graphic.render(layer);
                // layer.add(konvaShape);
                break;
            }
            case GeometryTypeEnum.ARC: {
                // SVG path
                svg_path += shape.command;
                geo_types += `${shape.type},`;
                // Konva graphic
                // graphic = new ArcGraphic(shape as Arc, config)
                // graphics.push(graphic);
                // let konvaShape = graphic.render(layer);
                // layer.add(konvaShape);
                break;
            }
            case GeometryTypeEnum.CIRCLE: {
                // SVG path
                svg_path += shape.command;
                geo_types += `${shape.type},`;
                // Konva graphic
                // graphic = new ArcGraphic(shape as Arc, config)
                // graphics.push(graphic);
                // let konvaShape = graphic.render(layer);
                // layer.add(konvaShape);
                break;
            }
            case GeometryTypeEnum.SPLINE: {
                // SVG path
                svg_path += shape.command;
                geo_types += `${shape.type},`;
                break;
            }
            default: {
                console.log("Unknown shape type: %s", shape.type);
                break;
            }
        }
    }
    svg_paths.push(svg_path);
    svg_geo_types.push(geo_types);
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
<svg width="${area.width+100}" height="${area.height+100}">
`;
for (let i in svg_paths) {
    const svg_path = svg_paths[i];
    const geo_type = svg_geo_types[i];
    const stroke: string = getRandomColor();
    html+= `<path fill="none" stroke="${stroke}" stroke-width="0.2" d-geo-types="${geo_type}" d="${svg_path}" />`;
}
html += `</svg>
<img width="${area.width}" height="${area.height}" src="${dataURL}"/>
</body>
</html>
`
fs.writeFile('test.html', html, (e)=>{});
