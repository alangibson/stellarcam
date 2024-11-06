import { Area } from "./src/geometry/area";
import { Grapher } from "./src/service/graph/grapher";
import { DxfFile } from "./src/input/dxf/dxf";
import { Multishape } from "./src/domain/multishape";
import { Shape } from "./src/geometry/shape";
import { MirrorEnum } from "./src/geometry/geometry.enum";
import { reorientShapes } from "./src/service/graph/grapher.function";
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
import { TspPoint } from "./src/service/tsp/tsp-point";
import { TravellingSalesman } from "./src/service/tsp/tsp";

//
// Parse DXF file
//

const filePath = process.argv[2];

// Contains LINE: ./test/dxf/1.dxf
// Contains LWPOLYLINE with bulge: './test/dxf/AFluegel Rippen b2 0201.dxf'
// Contains SPLINE: './test/dxf/Tractor Light Mount - Left.dxf'
// Contains INSERT: Bogen_Ellipsen_Polylinien_Block.dxf
// Contains POLYLINE: SchlittenBack.dxf; ADLER.dxf
// Contains ELLIPS: ./test/dxf/test.dxf
// Contains broken links: Tractor Seat Mount - Left.dxf
const dxf = new DxfFile();
const dxfDrawing: DXFDrawing = dxf.load(filePath);

//
// Derive and fix DXF data
//

// Loop over DXF layers. One graph per layer
const TOLERANCE = 0.5;
const layers: Layer[] = [];
const area = new Area();
const tspPoints: TspPoint[] = [];
for (const layerName in dxfDrawing.layers) {
  const shapes: Shape[] = dxfDrawing.layers[layerName].shapes;

  // Each Multishape is a Cut
  const cuts: Cut[] = [];

  // Generate Multishapes
  // Connect all points within given tolerance
  const graphs: Shape[][] = new Grapher().solve(shapes, TOLERANCE);
  for (let graph of graphs) {
    // TODO do this in Grapher.solve()?
    reorientShapes(graph, TOLERANCE);

    const multishape = new Multishape();
    let lastShape: Shape;
    for (let shape of graph) {
      multishape.add(shape);
      area.add(shape);
      lastShape = shape;
    }
    const cut: Cut = new Cut(multishape);
    cuts.push(cut);

    // Save point for TSP Rapid optimization later
    tspPoints.push(new TspPoint(cut));
  }

  // TODO reorganize cuts into parts
  // const parts: Part[] = new Parter().part(cuts);
  // HACK
  const part: Part = new Part(cuts);
  const parts: Part[] = [part];

  layers.push(new Layer(layerName, parts));
}

// Translate Area, and all Geometry in it, so that 0,0 is at bottom-left
area.translate(-area.min.x, -area.min.y);

// Flip coordinate origin from bottom-left to top-right
area.flip(MirrorEnum.HORIZONTAL);

// Use TSP to build rapids between cuts
// Rapids get added to Cut in the apply() method
new TravellingSalesman().solve(tspPoints);

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
