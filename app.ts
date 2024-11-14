import { Area } from "./src/geometry/area";
import { Grapher } from "./src/service/graph/grapher";
import { Chain } from "./src/geometry/chain/chain";
import { Shape } from "./src/geometry/shape";
import { reorientShapes } from "./src/service/graph/grapher.function";
import { Drawing } from "./src/domain/drawing";
import { Cut } from "./src/domain/cut";
import { Part } from "./src/domain/part";
import { Layer } from "./src/domain/layer";
import { InputDrawing } from "./src/input/drawing";
import { HtmlFile } from "./src/output/html/html";
import { Output } from "./src/output/output";
import GcodeConfig from './src/output/gcode/gcode';
import { Program } from "./src/domain/program";
import { Machine } from "./src/domain/machine";
import { TspPoint } from "./src/service/tsp/tsp-point";
import { TravellingSalesman } from "./src/service/tsp/tsp";
import { Operation, OperationProperties } from "./src/domain/operation";
import { InputFile } from "./src/input/input";
import { Stock } from "./src/domain/stock";
import { Parter } from "./src/service/part/parter";
import { Path } from "./src/domain/path";
import { UnitEnum } from "./src/domain/machine.enum";

function dump(o) {
    console.log(JSON.stringify(o, null, 4));
}

//
// Parse DXF file
//

// TODO Arcs arc in wrong direction:
// 1.dxf, 2.dxf, 132_2000.dxf

// Contains LINE: ./test/dxf/1.dxf
// Contains LWPOLYLINE with bulge: './test/dxf/AFluegel Rippen b2 0201.dxf'
// Contains SPLINE: './test/dxf/Tractor Light Mount - Left.dxf'
// Contains INSERT: Bogen_Ellipsen_Polylinien_Block.dxf
// Contains POLYLINE: SchlittenBack.dxf; ADLER.dxf
// Contains ELLIPS: ./test/dxf/test.dxf
// Contains broken links: Tractor Seat Mount - Left.dxf

const filePath = process.argv[2];
const inputDrawing: InputDrawing = new InputFile().load(filePath);

//
// Create Drawing from input
//

// TODO get from configuration file
const TOLERANCE = 0.5;

// Loop over DXF layers. One graph per layer
const layers: Layer[] = [];
const area = new Area();
for (const layerName in inputDrawing.layers) {
    const shapes: Shape[] = inputDrawing.layers[layerName].shapes;
    // Generate Multishapes
    // Connect all points within given tolerance
    const graphs: Shape[][] = new Grapher().solve(shapes, TOLERANCE);
    const chains: Chain[] = [];
    for (let graph of graphs) {
        // TODO do this in Grapher.solve()?
        reorientShapes(graph, TOLERANCE);

        const shapes: Shape[] = [];
        let lastShape: Shape;
        for (let shape of graph) {
            shapes.push(shape);
            area.add(shape);
            lastShape = shape;
        }
        chains.push(new Chain(shapes));
    }
    layers.push(new Layer(layerName, chains));
}

// Translate Area, and all Geometry in it, so that 0,0 is at bottom-left
area.translate(-area.min.x, -area.min.y);

// FIXME flip dxf, don't flip SVG
// Flip coordinate origin from bottom-left to top-right
// area.flip(MirrorEnum.HORIZONTAL);

const drawing: Drawing = new Drawing(layers, area);

//
// Load settings
//

// These are our saved Operation settings
// Map operation to layer(s) using keys and names
const operationLookup: { [key: string]: OperationProperties } = {
    'default': {
        feedRate: 3000,
        pierceDelay: 0,
        pierceHeight: 2.5,
        cutHeight: 0.5,
        cutVolts: 148,
        kerfWidth: 1
    },
    // TODO use [operation1.key] instead
    'operation-3200': {
        feedRate: 3200,
        pierceDelay: 0,
        pierceHeight: 2.5,
        cutHeight: 0.5,
        cutVolts: 148,
        kerfWidth: 1
    },
    'operation-3000': {
        feedRate: 3000,
        pierceDelay: 0,
        pierceHeight: 2.5,
        cutHeight: 0.5,
        cutVolts: 148,
        kerfWidth: 1
    },
    'operation-2800': {
        feedRate: 2800,
        pierceDelay: 0,
        pierceHeight: 2.5,
        cutHeight: 0.5,
        cutVolts: 148,
        kerfWidth: 1
    },
    'operation-2600': {
        feedRate: 2600,
        pierceDelay: 0,
        pierceHeight: 2.5,
        cutHeight: 0.5,
        cutVolts: 148,
        kerfWidth: 1
    },
    'operation-2400': {
        feedRate: 2400,
        pierceDelay: 0,
        pierceHeight: 2.5,
        cutHeight: 0.5,
        cutVolts: 148,
        kerfWidth: 1
    },
};

// These links automatically apply Operations to Layers
const operationLinks = [
    {
        operationKey: 'operation-3200',
        layerNames: ['Layer 5'],
    },
    {
        operationKey: 'operation-3000',
        layerNames: ['Layer 4'],
    },
    {
        operationKey: 'operation-2800',
        layerNames: ['Layer 3'],
    },
    {
        operationKey: 'operation-2600',
        layerNames: ['Layer 2'],
    },
    {
        operationKey: 'operation-2400',
        layerNames: ['Layer 1', 'suhe', 'muhe', 'fly', 'outline'],
    }
];

//
// Create Program
//

// TODO move to object or function
//
// Use operationLinks to link operations via layer name
// const operations: Operation[] = operationLinks.map((operationLink) => {
//   const operation: Operation = new Operation(operationLookup[operationLink.operationKey]);
//   const layers: Layer[] = drawing.children.filter((layer: Layer) => operationLink.layerNames.includes(layer.name));
//   operation.layers = layers;
//   return operation;
// });
// 
// Link all layers to default operation
const operation: Operation = drawing.children.reduce<Operation>((operation: Operation, layer: Layer) => {
    operation.layers.push(layer);
    return operation;
}, new Operation(operationLookup['default']));

// Transform Drawing to Program
const tspPoints: TspPoint[] = [];
const cuts: Cut[] = [];
for (const layer of drawing.children) {
    for (const chain of layer.children) {
        // Each Chain is a Cut
        const path: Path = new Path({chain});
        const cut: Cut = new Cut({path});
        cuts.push(cut);
        // Save point for TSP Rapid optimization later
        tspPoints.push(new TspPoint(cut));
    }
}
// Use TSP to build rapids between cuts
// Rapids get added to Cut in the apply() method
new TravellingSalesman().solve(tspPoints);
// Reorganize Cuts into Parts
const parts: Part[] = new Parter().process(cuts);

const stock = new Stock({ width: 69, length: 69, parts });

const machine: Machine = new Machine({
    units: UnitEnum.METRIC,
    // TODO cutterCompensation
    cutterCompensation: undefined,
    // TODO distanceMode
    distanceMode: undefined,
    stock
});

const program: Program = new Program({ height: drawing.height, width: drawing.width, units: drawing.units, machine});

//
// Render DXF
//

// to HTML
new HtmlFile().save(drawing, "test.html", program);
// and to Gcode
new Output(drawing, GcodeConfig, program).save("test.gcode");
