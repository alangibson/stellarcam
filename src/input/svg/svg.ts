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
import SvgFlatten from "svg-flatten";

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

function parseChildren(layerChildren): Shape[] {
    const shapes: Shape[] = [];
    for (const element of layerChildren) {
        if (element.tagName == 'g') {
            // Found a <g> element, so recurse
            // HACK Apply transform from group to all children
            // SVGO does not support this natively
            //  transform="matrix(0.78524526,0.14476901,-0.16548466,0.89760962,-65.496387,-115.39898)"
            // if (element.properties.hasOwnProperty('transform')) {
            //     // Copy transform to all children
            // }
            const elementShapes: Shape[] = parseChildren(element.children);
            shapes.push(...elementShapes);
        } else if (element.tagName == 'path') {
            const elementShapes: Shape[] = parsePathElement(element);
            shapes.push(...elementShapes);
        }
    }
    return shapes;
}

// import * as applyTransforms from 'svgo/plugins/applyTransforms';
// console.log(applyTransforms.applyTransforms);

export class SvgFile {
    load(path: string): InputDrawing {
        let content: string = fs.readFileSync(path, "utf-8");
        // content = new SvgFlatten(content).transform().value()
        // const optimized = optimize(content, {
        //     plugins: [
        //       {
        //         name: 'convertPathData',
        //         params: {
        //             // If to apply transforms to paths
        //             applyTransforms: true,
        //             // If to apply transforms to paths with a stroke.
        //             applyTransformsStroked: true,
        //             // If to convert from curves to arcs when possible.
        //             // makeArcs: {
        //             //     threshold,
        //             //     tolerance
        //             // },
        //             straightCurves: false,
        //             // If to convert cubic beziers to quadratic beziers when they effectively are.
        //             convertToQ: false,
        //             // If to convert regular lines to an explicit horizontal or vertical line where possible.
        //             lineShorthands: false,
        //             // If to convert lines that go to the start to a `z` command.
        //             convertToZ: false,
        //             // If to convert curves to smooth curves where possible.
        //             curveSmoothShorthands: false,
        //             // Number of decimal places to round to, using conventional rounding rules.
        //             floatPrecision: 3,
        //             // Number of decimal places to round to, using conventional rounding rules.
        //             transformPrecision: 5,
        //             // Round the radius of circular arcs when the effective change is under the error. 
        //             smartArcRounding: false,
        //             // Remove redundant path commands that don't draw anything.
        //             removeUseless: false,
        //             // Collapse repeated commands when they can be merged into one.
        //             collapseRepeated: false,
        //             // If to convert between absolute or relative coordinates, whichever is shortest.
        //             utilizeAbsolute: false,
        //             negativeExtraSpace: false,
        //             // If to always convert to absolute coordinates, even if it adds more bytes.
        //             forceAbsolutePath: true
        //         }
        //       },
        //       {
        //         name: 'convertTransform',
        //         params: {
        //             // Convert transforms to their shorthand alternatives.
        //             convertToShorts: false,
        //             // Number of decimal places to round degrees values to, using conventional rounding rules. Used for `rotate` and `skew`.
        //             degPrecision: 4,
        //             // Number of decimal places to round to, using conventional rounding rules.
        //             floatPrecision: 3,
        //             // Number of decimal places to round to, using conventional rounding rules.
        //             transformPrecision: 5,
        //             // If decompose matrices into simple transforms. See [Decomposition of 2D-transform matrices](https://frederic-wang.fr/decomposition-of-2d-transform-matrices.html) for more context.
        //             matrixToTransform: false,
        //             // shortTranslate?: boolean;
        //             // shortScale?: boolean;
        //             // shortRotate?: boolean;
        //             // removeUseless?: boolean;
        //             // collapseIntoOne?: boolean;
        //             // leadingZero?: boolean;
        //             // negativeExtraSpace?: boolean;
        //         }
        //       }
        //     ],
        //   });
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
