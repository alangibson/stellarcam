import { InputDrawing } from "./drawing";
import { DxfFile } from "./dxf/dxf";
import { SvgFile } from "./svg/svg";

export class InputFile {
    load(path: string): InputDrawing {
        if (path.endsWith('.svg')) {
            return new SvgFile().load(path);
        } else if (path.endsWith('.dxf')) {
            return new DxfFile().load(path);
        } else {
            throw new Error(`File type not supported: ${path}`);
        }
    }
}