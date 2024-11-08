import { parse } from 'svg-parser';
import {parseSVG, makeAbsolute} from "svg-path-parser";
import * as fs from "fs";
import { PointProperties } from '../../geometry/point/point';
import { InputLayer } from '../layer';
import { Segment } from '../../geometry/segment/segment';
import { InputDrawing } from '../drawing';

export class SvgFile {
    load(path: string): InputDrawing {
        const content: string = fs.readFileSync(path, "utf-8");
        const xml = parse(content);

        // if <svg xmlns:inkscape>, then treat as Inkscape SVG
        //  for each <g inkscape:groupmode>, make a Layer
        // else file has only 1 Layer

        // const layers: InputLayer[] = [];
        const layers: {[key:string]: InputLayer} = {};
        for (const maybeG of xml.children[0].children) {
            if (maybeG.tagName == 'g') {
                // Create a Layer object
                const layer: InputLayer = new InputLayer(maybeG.properties['inkscape:label']);
                for (const maybePath of maybeG.children) {
                    if (maybePath.tagName == 'path') {
                        const pathD = maybePath.properties.d;

                        // Parse <path d> into Shapes
                        const commands = makeAbsolute(parseSVG(pathD));
                        let lastPoint: PointProperties = null;
                        for (const command of commands) {
                            switch (command.code) {
                                case ('H'): { // horizontal line
                                    const point: PointProperties = { x: command.x, y:  lastPoint.y };
                                    layer.shapes.push(new Segment({startPoint: lastPoint, endPoint: point}));
                                    lastPoint = point;
                                    break;
                                }
                                case ('M'): { // move to
                                    lastPoint = command as PointProperties;
                                    break;
                                }
                                case ('L'): { // line to
                                    const point: PointProperties = { x: command.x, y:  command.y };
                                    layer.shapes.push(new Segment({startPoint: lastPoint, endPoint: point}));
                                    lastPoint = point;
                                    break;
                                }
                                case ('V'): { // vertical line
                                    // TODO Segment
                                    break;
                                }
                                default: {
                                    console.log('Unknown SVG path command', command);
                                }
                            }
                        }

                    }
                }
                layers[layer.name] = layer;
            }
        }

        return new InputDrawing(layers);
    }
}
