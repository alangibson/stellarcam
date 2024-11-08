import { Area } from "./src/geometry/area";
import { Grapher } from "./src/service/graph/grapher";
import { DxfFile } from "./src/input/dxf/dxf";
import { Chain } from "./src/domain/chain";
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
import { Operation, OperationProperties } from "./src/domain/operation";

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

const filePath = process.argv[2];
const dxfDrawing: DXFDrawing = new DxfFile().load(filePath);

//
// Create Drawing
//

// TODO get from configuration file
const TOLERANCE = 0.5;

// Loop over DXF layers. One graph per layer
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

    const multishape = new Chain();
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
// Create Program
//

const operation1: OperationProperties = {
  // TODO Need to set different operation per layer for 5 lines svg
  // Maybe add id to Entity and link by entity id
  feedRate: 2200,
  pierceDelay: 0,
  pierceHeight: 1.5,
  cutHeight: 0.5
};

const operationToKey = {
  'operation-1': operation1
};

const operationLinks = [
  {
    operationKey: 'operation-1',
    layerName: ['Layer 1', 'Layer 2', 'Layer 3', 'Layer 4', 'Layer 5'],
  }
];

// TODO map operation to layer(s) using keys and names
const operations: Operation[] = operationLinks.map((operationLink) => {
  const operation: Operation = operationToKey[operationLink.operationKey];
  // TODO look up layer
  return operation;
});


const program: Program = new Program({
  machine: {
    cutterCompensation: undefined,
    units: UnitEnum.METRIC,
    distanceMode: undefined,
    operations: operations
  }
});

// console.log(JSON.stringify(program));
// console.log(drawing.children);

//
// Render DXF
//

// to HTML
new HtmlFile().save(drawing, "test.html");
// and to Gcode
new Output(drawing, GcodeConfig, program).save("test.gcode");
