import { Drawing } from "../../domain/drawing";
import { GeometryTypeEnum } from "../../geometry/geometry.enum";

export class Gcode {

    gcode(drawing: Drawing): string[] {
        const lines: string[] = [];
        // TODO write beginProgram
        for (const layer of drawing.children) {
            // TODO rapidTo G0
            for (const cut of layer.children) {
                // TODO write beginCut
                for (const multishape of cut.children) {
                    for (const shape of multishape.shapes) {
                        switch (shape.type) {
                            case(GeometryTypeEnum.ARC): {
                                // TODO G2 or G3
                                break;
                            }
                            case(GeometryTypeEnum.CIRCLE): {
                                // TODO G2 or G3
                                // TODO or hole?
                            }
                            case(GeometryTypeEnum.CUBIC_CURVE): {
                                // TODO G5
                            }
                            case(GeometryTypeEnum.ELLIPSE): {
                                // TODO convert to segments or arcs
                            }
                            case(GeometryTypeEnum.POINT): {
                                // TODO dimple
                            }
                            case(GeometryTypeEnum.QUADRATIC_CURVE): {
                                // TODO G5.1
                            }
                            case(GeometryTypeEnum.SEGMENT): {
                                // TODO G1
                            }
                        }
                    }
                }
                // TODO write endCut
            }
            // TODO rapidAway G0
        }
        // TODO write endProgram
        return lines;
    }

}