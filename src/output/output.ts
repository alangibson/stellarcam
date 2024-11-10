import * as fs from "fs";
import { Drawing } from "../domain/drawing"
import { GeometryTypeEnum } from "../geometry/geometry.enum"
import { Program, ProgramProperties } from "../domain/program";
import { Operation } from "../domain/operation";

export interface OutputApply {
    drawing?: {
        begin?,
        end?,
    };
    layer?: {
        begin?,
        end?
    };
    part?: {
        begin?,
        end?
    };
    cut?: {
        begin?,
        rapidTo?,
        rapidAway?,
        end?
    };
    chain?: {
        begin?,
        startPoint?,
        endPoint?,
        end?
    };
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
    };
    program?: {
        begin?,
        end?
    };
    machine?: {
        begin?,
        end?
    };
    operation?: {
        begin?,
        end?
    };
}

export class Output {

    drawing: Drawing;
    config: OutputApply;
    program: Program;

    constructor(drawing: Drawing, config: OutputApply, program: Program) {
        this.drawing = drawing;
        this.config = config;
        this.program = program;
    }

    save(path: string) {
        const output: string = this.render();
        fs.writeFileSync(path, output);
    }

    render(): string {
        return this.apply()
            // removed null and undefined values
            .filter((value) => !! value)
            // concatenate strings to handle multiline strings
            .reduce((prev: string, curr: string) => prev += "\n" + curr)
            // split strings into single lines
            .split("\n")
            // trim whitespace
            .map((line: string) => line.trim())
            // concatenate strings again
            .reduce((prev: string, curr: string) => prev += "\n" + curr)
            ;
    }

    apply(): string[] {
        // Initialize output collector
        const output: string[] = [];

        // Program begin
        output.push(this.config.program?.begin?.(this.program));
        // Drawing begin
        output.push(this.config.drawing?.begin?.(this.drawing));
        // Machine begin
        output.push(this.config.machine?.begin?.(this.program.machine));

        // Switch to driving loop with Operations, not Layers
        // Note that Layers without operations will not be rendered
        const operations: Operation[] = this.program.machine.operations;
        for (const operation of operations) {
            // Operation begin
            output.push(this.config.operation?.begin?.(operation));
            // Loop over layers that Operation links to
            for (const layer of operation.layers) {
                // Layer begin
                output.push(this.config.layer?.begin?.(layer));
                for (const part of layer.children) {
                    // Part begin
                    output.push(this.config.part?.begin?.(part));
                    for (const cut of part.children) {
                        // Rapid to Cut
                        output.push(this.config.cut?.rapidTo?.(cut));
                        // Cut begin
                        output.push(this.config.cut?.begin?.(cut));
                        for (const chain of cut.children) {
                            // Chain begin
                            output.push(this.config.chain?.begin?.(chain));
                            output.push(this.config.chain?.startPoint?.(chain));
                            for (const shape of chain.children) {
                                // Shape begin
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
                                // Shape end
                                output.push(this.config.shape?.end?.(shape));
                            }
                            // Chain end
                            output.push(this.config.chain?.endPoint?.(chain));
                            output.push(this.config.chain?.end?.(chain));
                        }
                        // Cut end
                        output.push(this.config.cut?.end?.(cut));
                    }
                    // Part end
                    output.push(this.config.part?.end?.(part));
                }
                // Layer end
                output.push(this.config.layer?.end?.(layer));
            }
            // Operation end
            output.push(this.config.operation?.end?.(operation));
        }

        /**
        for (const layer of this.drawing.children) {
            // Layer begin
            output.push(this.config.layer?.begin?.(layer));
            for (const cut of layer.children) {
                // Cut begin
                output.push(this.config.cut?.begin?.(cut));
                // Chain
                for (const chain of cut.children) {
                    for (const shape of chain.shapes) {
                        // Shape begin
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
                        // Shape end
                        output.push(this.config.shape?.end?.(shape));
                    }
                }
                // Cut end
                output.push(this.config.cut?.end?.(cut));
            }
            // Layer end
            output.push(this.config.layer?.end?.(layer));
        }
        */

        // Machine end
        output.push(this.config.machine?.end?.(this.program.machine));
        // Drawing end
        output.push(this.config.drawing?.end?.(this.drawing));
        // Program end
        output.push(this.config.program?.end?.(this.program));

        return output;
    }

}