import { Area } from './src/geometry/area';
import { Grapher } from './src/geometry/graph/grapher';
import { DxfFile } from './src/file/dxf';
import { Geometry } from './src/geometry/geometry';
import { Multishape } from './src/entity/multishape';
import { SvgFile } from './src/file/svg';
import { OriginEnum } from './src/geometry/geometry.enum';
import { Point } from './src/geometry/point';

//
// Parse DXF file
//

// Contains LINE: ./test/dxf/1.dxf
// Contains LWPOLYLINE with bulge: './test/dxf/AFluegel Rippen b2 0201.dxf'
// Contains SPLINE: './test/dxf/Tractor Light Mount - Left.dxf'
// Contains INSERT: Bogen_Ellipsen_Polylinien_Block.dxf
// Contains POLYLINE: SchlittenBack.dxf
// Tractor Seat Mount - Left.dxf
const dxf = new DxfFile();
const area: Area = dxf.load('./test/dxf/1.dxf');
const geometries: Geometry[] = area.geometries;

//
// Derive and fix DXF data
//

// Connect all points within given tolerance
const grapher = new Grapher();
const contours: Array<Set<number>> = grapher.graph(geometries);

// Create Multishapes from connected shapes
const multishapes: Multishape[] = [];
for (let contour of contours) {
    const multishape = new Multishape();
    for (let shape_i of contour.values()) {
        const shape: Geometry = geometries[shape_i];
        multishape.shapes.push(shape);
    }
    multishapes.push(multishape);
}

// Translate Area, and all Geometry in it, so that 0,0 is at bottom-left
const origin: Point = area.min;
// Add 5 to avoid cliping shapes on the edge of the boundary
area.translate(-origin.x + 5, -origin.y + 5);

// TODO Flip coordinate origin from bottom-left to top-right
// area.mirror(MirrorEnum.HORIZONTAL);

//
// Render DXF
//

const svg_file = new SvgFile();
svg_file.save(area, multishapes, 'test.html');

