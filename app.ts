import { Area } from './src/geometry/area';
import { Grapher } from './src/geometry/graph/grapher';
import { DxfFile } from './src/file/dxf';
import { Multishape } from './src/entity/multishape';
import { SvgFile } from './src/file/svg';
import { Point } from './src/geometry/point';
import { Shape } from './src/geometry/shape';
import { MirrorEnum } from './src/geometry/geometry.enum';
import { reorientShapes, sortShapes } from './src/geometry/graph/grapher.function';

//
// Parse DXF file
//

// Contains LINE: ./test/dxf/1.dxf
// Contains LWPOLYLINE with bulge: './test/dxf/AFluegel Rippen b2 0201.dxf'
// Contains SPLINE: './test/dxf/Tractor Light Mount - Left.dxf'
// Contains INSERT: Bogen_Ellipsen_Polylinien_Block.dxf
// Contains POLYLINE: SchlittenBack.dxf; ADLER.dxf
// Contains ELLIPS: ./test/dxf/test.dxf
// Contains broken links: Tractor Seat Mount - Left.dxf
const dxf = new DxfFile();
const area: Area = dxf.load('./test/dxf/ADLER.dxf');

//
// Derive and fix DXF data
//

// Connect all points within given tolerance
const TOLERANCE = 0.5;
const grapher = new Grapher();
const graphs: Shape[][] = grapher.graph(area.shapes, TOLERANCE);
const multishapes: Multishape[] = [];
for (let graph of graphs) {
    const multishape = new Multishape();
    reorientShapes(graph, TOLERANCE);
    // Sort shapes by end_point -> start_point
    // graph = sortShapes(graph, TOLERANCE);
    let lastShape: Shape;
    for (let shape of graph) {
        multishape.add(shape);
        lastShape = shape;
    }
    multishapes.push(multishape);
}

// Translate Area, and all Geometry in it, so that 0,0 is at bottom-left
const origin: Point = area.min;
// Add 5 to avoid cliping shapes on the edge of the boundary
area.translate(-origin.x + 5, -origin.y + 5);

// Flip coordinate origin from bottom-left to top-right
area.flip(MirrorEnum.HORIZONTAL);

//
// Render DXF
//

const svg_file = new SvgFile();
svg_file.save(area, multishapes, 'test.html');

