import { Area } from "./src/geometry/area";
import { Grapher } from "./src/geometry/graph/grapher";
import { DxfFile } from "./src/input/dxf/dxf";
import { Multishape } from "./src/domain/multishape";
import { Shape } from "./src/geometry/shape";
import { MirrorEnum } from "./src/geometry/geometry.enum";
import { reorientShapes } from "./src/geometry/graph/grapher.function";
import { Drawing } from "./src/domain/drawing";
import { Cut } from "./src/domain/cut";
import { Part } from "./src/domain/part";
import { Layer } from "./src/domain/layer";
import { DXFDrawing } from "./src/input/dxf/dxf-drawing";
import { HtmlFile } from "./src/output/html/html";
import { Output } from "./src/output/output";
import GcodeConfig from './src/output/gcode/gcode';
import { Program } from "./src/domain/program";
import { UnitEnum } from "./src/domain/machine";

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
const dxfDrawing: DXFDrawing = dxf.load(
  "/home/alangibson/Documents/JAG eU/Plasma Cutter/Marketing/Content/2024-11-04/lines.dxf",
);

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
  // HACK
  const part: Part = new Part(cuts);
  const parts: Part[] = [part];

  layers.push(new Layer(layerName, parts));
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

new HtmlFile().save(drawing, "test.html");

// TODO pass in OutputApply from gcode
const program: Program = new Program({
  machine: {
    cutterCompensation: undefined,
    units: UnitEnum.METRIC,
    distanceMode: undefined,
    operations: [
      {
        layers: layers,
        feedRate: 999,
        pierceDelay: 999,
        pierceHeight: 999,
        cutHeight: 999
      }
    ]
  }
});

new Output(drawing, GcodeConfig, program).save("test.gcode");
