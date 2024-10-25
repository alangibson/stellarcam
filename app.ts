import { Area } from './src/geometry/area';
import { OriginEnum } from './src/geometry/origin.enum';
import { Grapher } from './src/geometry/graph/grapher';
import { DxfFile } from './src/file/dxf';
import { Geometry } from './src/geometry/geometry';
import { Multishape } from './src/entity/multishape';
import { SvgFile } from './src/file/svg';

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
const area: Area = dxf.load('./test/dxf/Tractor Light Mount - Left.dxf');
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
const origin = area.origin;
const translateX = -origin.x;
const translateY = -origin.y;
area.translate(translateX, translateY);

// Project into Canvas coordinates (ie 0,0 at top-left)
area.project(OriginEnum.TOP_LEFT);

//
// Render DXF
//

const svg_file = new SvgFile();
svg_file.save(area, multishapes, 'test.html');

