import * as fs from 'fs';
import { InputDrawing } from './drawing.svelte';
import { DxfFile } from './dxf/dxf';
import { SvgFile } from './svg/svg';

export class InputFile {
	load(path: string): InputDrawing {
		const content: string = fs.readFileSync(path, 'utf-8');
		if (path.endsWith('.svg')) {
			return this.from('svg', content);
		} else if (path.endsWith('.dxf')) {
			return this.from('dxf', content);
		} else {
			throw new Error(`File type not supported: ${path}`);
		}
	}

	/**
	 * Load DXF or SVG based on string contents.
	 *
	 * @param contents File contents
	 */
	from(type: string, contents: string): InputDrawing {
		if (type.endsWith('svg')) {
			return new SvgFile().from(contents);
		} else if (type.endsWith('dxf')) {
			return new DxfFile().from(contents);
		} else {
			throw new Error(`File type not supported: ${type}`);
		}
	}
}
