import * as fs from "fs";
import { Drawing } from "../domain/drawing"
import { GeometryTypeEnum } from "../geometry/geometry.enum"

export interface OutputApply {
    drawing?: {
        begin?,
        end?,
    },
    layer?: {
        begin?,
        end?
    },
    part?: {
        begin?,
        end?
    },
    cut?: {
        begin?,
        end?
    },
    shape?: {
        begin?,
        [GeometryTypeEnum.ARC]?,
        [GeometryTypeEnum.CIRCLE]?,
        [GeometryTypeEnum.CUBIC_CURVE]?,
        [GeometryTypeEnum.ELLIPSE]?,
        [GeometryTypeEnum.POINT]?,
        [GeometryTypeEnum.QUADRATIC_CURVE]?,
        [GeometryTypeEnum.RECTANGLE]?,
        [GeometryTypeEnum.SEGMENT]?,
        end?
    }
}

export class Output {

    drawing: Drawing;
    config: OutputApply;

    constructor(drawing: Drawing, config: OutputApply) {
        this.drawing = drawing;
        this.config = config;
    }

    save(path: string) {
        const output: string = this.render();
        fs.writeFileSync(path, output);
    }

    render(): string {
        return this.apply().reduce((prev: string, curr: string) => prev += curr + "\n") as string;
    }

    apply<T>(): T[] {
        const output: T[] = [];
        output.push(this.config.drawing?.begin?.(this.drawing));
        for (const layer of this.drawing.children) {
            output.push(this.config.layer?.begin?.(layer));
            for (const cut of layer.children) {
                output.push(this.config.cut?.begin?.(cut));
                for (const multishape of cut.children) {
                    for (const shape of multishape.shapes) {
                        output.push(this.config.shape?.begin?.(shape));
                        switch (shape.type) {
                            case GeometryTypeEnum.ARC: {
                                output.push(this.config.shape?.[GeometryTypeEnum.ARC]?.(shape));
                                break;
                            }
                            case GeometryTypeEnum.CIRCLE: {
                                output.push(this.config.shape?.[GeometryTypeEnum.CIRCLE]?.(shape));
                                break;
                            }
                            case GeometryTypeEnum.CUBIC_CURVE: {
                                output.push(this.config.shape?.[GeometryTypeEnum.CUBIC_CURVE]?.(shape));
                                break;
                            }
                            case GeometryTypeEnum.ELLIPSE: {
                                output.push(this.config.shape?.[GeometryTypeEnum.ELLIPSE]?.(shape));
                                break;
                            }
                            case GeometryTypeEnum.POINT: {
                                output.push(this.config.shape?.[GeometryTypeEnum.POINT]?.(shape));
                                break
                            }
                            case GeometryTypeEnum.QUADRATIC_CURVE: {
                                output.push(this.config.shape?.[GeometryTypeEnum.QUADRATIC_CURVE]?.(shape));
                                break
                            }
                            case GeometryTypeEnum.SEGMENT: {
                                output.push(this.config.shape?.[GeometryTypeEnum.SEGMENT]?.(shape));
                                break
                            }
                        }
                        output.push(this.config.shape?.end?.(shape));
                    }
                }
                output.push(this.config.cut?.end?.(cut));
            }
            output.push(this.config.layer?.end?.(layer));
        }
        output.push(this.config.drawing?.end?.(this.drawing));
        return output.filter((value) => !! value);
    }

}