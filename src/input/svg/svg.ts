import * as fs from "fs";
import { parse } from 'svg-parser';
import { parseSVG, makeAbsolute } from "svg-path-parser";
import { PointProperties } from '../../geometry/point/point';
import { InputLayer } from '../layer';
import { Segment } from '../../geometry/segment/segment';
import { InputDrawing } from '../drawing';
import { CubicCurve } from '../../geometry/cubic-curve/cubic-curve';
import { Shape } from '../../geometry/shape';
import { QuadraticCurve } from '../../geometry/quadratic-curve/quadratic-curve';
import { optimize } from 'svgo';
// import SvgFlatten from "svg-flatten";
import * as SvgTransformParser from 'svg-transform-parser';

function parsePathElement(element): Shape[] {
    const shapes: Shape[] = [];
    const pathD = element.properties.d;
    // Parse <path d> into Shapes
    const commands = makeAbsolute(parseSVG(pathD));
    let firstPoint: PointProperties;
    let lastPoint: PointProperties;
    for (const command of commands) {
        switch (command.code) {
            case ('C'): { // cubic curve
                const startPoint = { x: command.x0, y: command.y0 };
                const control1 = { x: command.x1, y: command.y1 };
                const control2 = { x: command.x2, y: command.y2 };
                const endPoint = { x: command.x, y: command.y };
                const curve = new CubicCurve({
                    startPoint, control1, control2, endPoint
                });
                shapes.push(curve);
                lastPoint = endPoint;
                break;
            }
            case ('H'): { // horizontal line
                const point: PointProperties = { x: command.x, y: lastPoint.y };
                shapes.push(new Segment({ startPoint: lastPoint, endPoint: point }));
                lastPoint = point;
                break;
            }
            case ('L'): { // line to
                const point: PointProperties = { x: command.x, y: command.y };
                shapes.push(new Segment({ startPoint: lastPoint, endPoint: point }));
                lastPoint = point;
                break;
            }
            case ('M'): { // move to
                firstPoint = command as PointProperties;
                lastPoint = command as PointProperties;
                break;
            }
            case ('Q'): { // quadratic curve
                const startPoint = { x: command.x0, y: command.y0 };
                const control1 = { x: command.x1, y: command.y1 };
                const endPoint = { x: command.x, y: command.y };
                const curve = new QuadraticCurve({
                    startPoint, control1, endPoint
                });
                shapes.push(curve);
                lastPoint = endPoint;
                break;
            }
            case ('V'): { // vertical line
                // TODO Segment
                break;
            }
            case ('Z'): { // close path
                shapes.push(new Segment({ startPoint: lastPoint, endPoint: firstPoint }));
                break;
            }
            default: {
                console.log('Unknown SVG path command', command);
            }
        }
    }
    return shapes;
}

function parseChildren(layerChildren, svgTransformMatrix?: number[]): Shape[] {
    const shapes: Shape[] = [];
    for (const element of layerChildren) {
        if (element.tagName == 'g') {
            // Found a <g> element, so recurse
            let matrix: number[];
            if (element.properties.hasOwnProperty('transform')) {
                // Copy transform to all children
                const svgTransform = SvgTransformParser.parse(element.properties.transform);
                // TODO there are other possible transform functions, like translate
                const m = svgTransform.matrix;
                matrix = [m.a, m.b, m.c, m.d, m.e, m.f];
            }
            const elementShapes: Shape[] = parseChildren(element.children, matrix);
            shapes.push(...elementShapes);
        } else if (element.tagName == 'path') {
            const elementShapes: Shape[] = parsePathElement(element);
            // Apply transform from group to all children
            // SVGO does not support this natively
            if (svgTransformMatrix){
                // HACK
                // Note: SVG 3x3 transform matrix is [a, c, e, b, d, f]
                const matrix: number[] = [
                    svgTransformMatrix[0],
                    svgTransformMatrix[2],
                    svgTransformMatrix[4],
                    svgTransformMatrix[1],
                    svgTransformMatrix[3],
                    svgTransformMatrix[5]
                ]
                for (const shape of elementShapes)
                    shape.transform(matrix);
            }
            shapes.push(...elementShapes);
        }
    }
    return shapes;
}

export class SvgFile {
    load(path: string): InputDrawing {
        let content: string = fs.readFileSync(path, "utf-8");
        // content = new SvgFlatten(content).transform().value()
        const optimized = optimize(content, {
            plugins: [
              {
                name: 'convertPathData',
                params: {
                    // If to apply transforms to paths
                    applyTransforms: false,
                    // If to apply transforms to paths with a stroke.
                    applyTransformsStroked: false,
                    // If to convert from curves to arcs when possible.
                    // makeArcs: {
                    //     threshold,
                    //     tolerance
                    // },
                    straightCurves: false,
                    // If to convert cubic beziers to quadratic beziers when they effectively are.
                    convertToQ: false,
                    // If to convert regular lines to an explicit horizontal or vertical line where possible.
                    lineShorthands: false,
                    // If to convert lines that go to the start to a `z` command.
                    convertToZ: false,
                    // If to convert curves to smooth curves where possible.
                    curveSmoothShorthands: false,
                    // Number of decimal places to round to, using conventional rounding rules.
                    floatPrecision: 3,
                    // Number of decimal places to round to, using conventional rounding rules.
                    transformPrecision: 5,
                    // Round the radius of circular arcs when the effective change is under the error. 
                    smartArcRounding: false,
                    // Remove redundant path commands that don't draw anything.
                    removeUseless: false,
                    // Collapse repeated commands when they can be merged into one.
                    collapseRepeated: false,
                    // If to convert between absolute or relative coordinates, whichever is shortest.
                    utilizeAbsolute: false,
                    negativeExtraSpace: false,
                    // If to always convert to absolute coordinates, even if it adds more bytes.
                    forceAbsolutePath: true
                }
              }
            ],
          });
        content = optimized.data;
        const xml = parse(content);

        // if <svg xmlns:inkscape>, then treat as Inkscape SVG
        //  for each <g inkscape:groupmode>, make a Layer
        // else file has only 1 Layer

        // const layers: InputLayer[] = [];
        const layers: { [key: string]: InputLayer } = {};
        const topLevelChildren = xml.children[0].children;

        // Loop over top level layers
        // We don't support nested layers
        for (const maybeG of topLevelChildren) {
            if (maybeG.tagName == 'g') {
                // Create a Layer object
                const layer: InputLayer = new InputLayer(maybeG.properties['inkscape:label']);
                const layerChildren = maybeG.children;
                layer.shapes = parseChildren(layerChildren);
                layers[layer.name] = layer;
            }
        }

        return new InputDrawing(layers);
    }
}
