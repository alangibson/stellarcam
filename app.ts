import { Area } from './src/geometry/area';
import { Grapher } from './src/geometry/graph/grapher';
import { DxfFile } from './src/input/dxf/dxf';
import { Multishape } from './src/entity/multishape';
import { SvgFile } from './src/output/svg/svg';
import { Shape } from './src/geometry/shape';
import { MirrorEnum } from './src/geometry/geometry.enum';
import { reorientShapes } from './src/geometry/graph/grapher.function';
import { Drawing } from './src/entity/drawing';
import { Cut } from "./src/entity/cut";
import { Layer } from "./src/entity/layer";
import { DXFDrawing } from './src/input/dxf/dxf-drawing';
import { HtmlFile } from './src/output/html/html';

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
const dxfDrawing: DXFDrawing = dxf.load('./test/dxf/Tractor Seat Mount - Left.dxf');

//
// Derive and fix DXF data
//

// Loop over DXF layers. One graph per layer
const TOLERANCE = 0.5;
const layers: Layer[] = [];
const area = new Area();
for (const layerName in dxfDrawing.layers) {

    const shapes: Shape[] = dxfDrawing.layers[layerName].shapes;

    // Each Multishape is a Cut
    const cuts: Cut[] = [];

    // Generate Multishapes
    // Connect all points within given tolerance
    const grapher = new Grapher();
    const graphs: Shape[][] = grapher.graph(shapes, TOLERANCE);
    for (let graph of graphs) {
        const multishape = new Multishape();
        reorientShapes(graph, TOLERANCE);
        // Sort shapes by end_point -> start_point
        // graph = sortShapes(graph, TOLERANCE);
        let lastShape: Shape;
        for (let shape of graph) {
            multishape.add(shape);
            area.add(shape);
            lastShape = shape;
        }
        cuts.push(new Cut(multishape));
    }

    // TODO reorganize cuts into parts
    // const parts: Part[] = new Parter().part(cuts);

    layers.push(new Layer(layerName, cuts));
}

// Translate Area, and all Geometry in it, so that 0,0 is at bottom-left
// Add 5 to avoid cliping shapes on the edge of the boundary
area.translate(-area.min.x + 5, -area.min.y + 5);

// Flip coordinate origin from bottom-left to top-right
area.flip(MirrorEnum.HORIZONTAL);

const drawing: Drawing = new Drawing(layers, area);

//
// Render DXF
//

// new SvgFile().save(drawing, 'test.html');
new HtmlFile().save(drawing, 'test.html');
