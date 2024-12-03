import { Drawing } from '../domain/drawing';
import { GeometryTypeEnum } from '../geometry/geometry.enum';
import { Program } from '../domain/program';

export interface RenderDrawingConfig {
	drawing?: {
		begin?;
		end?;
	};
	layer?: {
		begin?;
		end?;
	};
	chain?: {
		begin?;
		startPoint?;
		endPoint?;
		end?;
	};
	shape?: {
		begin?;
		[GeometryTypeEnum.ARC]?;
		[GeometryTypeEnum.CIRCLE]?;
		[GeometryTypeEnum.CUBIC_CURVE]?;
		[GeometryTypeEnum.ELLIPSE]?;
		[GeometryTypeEnum.POINT]?;
		[GeometryTypeEnum.QUADRATIC_CURVE]?;
		[GeometryTypeEnum.RECTANGLE]?;
		[GeometryTypeEnum.SEGMENT]?;
		end?;
	};
}

export interface RenderProgramConfig {
	program?: {
		begin?;
		end?;
	};
	machine?: {
		begin?;
		end?;
	};
	operation?: {
		begin?;
		end?;
	};
	part?: {
		begin?;
		end?;
	};
	cut?: {
		begin?;
		rapidTo?;
		rapidAway?;
		end?;
	};
	chain?: {
		begin?;
		startPoint?;
		endPoint?;
		end?;
	};
	shape?: {
		begin?;
		[GeometryTypeEnum.ARC]?;
		[GeometryTypeEnum.CIRCLE]?;
		[GeometryTypeEnum.CUBIC_CURVE]?;
		[GeometryTypeEnum.ELLIPSE]?;
		[GeometryTypeEnum.POINT]?;
		[GeometryTypeEnum.QUADRATIC_CURVE]?;
		[GeometryTypeEnum.RECTANGLE]?;
		[GeometryTypeEnum.SEGMENT]?;
		end?;
	};
}

export function clean(content: string[]): string {
	return (
		content
			// removed null and undefined values
			.filter((value) => !!value)
			// concatenate strings to handle multiline strings
			.reduce((prev: string, curr: string) => (prev += '\n' + curr))
			// split strings into single lines
			.split('\n')
			// trim whitespace
			.map((line: string) => line.trim())
			// concatenate strings again
			.reduce((prev: string, curr: string) => (prev += '\n' + curr))
	);
}

export class Renderer {

	program(config: RenderProgramConfig, program: Program): string[] {
		// Initialize output collector
		const output: string[] = [];

		// Program begin
		output.push(config.program?.begin?.(program));
		// Drawing begin
		// output.push(config.drawing?.begin?.(this.drawing));
		// Machine begin
		output.push(config.machine?.begin?.(program.machine));
		// TODO Stock begin
		// output.push(config.stock?.begin?.(program.machine.stock));

		for (const part of program.machine.stock.parts) {
			// Part begin
			output.push(config.part?.begin?.(part));
			for (const cut of [...part.holes, part.shell]) {
				// Rapid to Cut
				output.push(config.cut?.rapidTo?.(cut));
				// Cut begin
				output.push(config.cut?.begin?.(cut));
				for (const chain of [cut.path.chain]) {
					// HACK
					// Chain begin
					output.push(config.chain?.begin?.(chain));
					output.push(config.chain?.startPoint?.(chain));
					for (const shape of chain.children) {
						// Shape begin
						output.push(config.shape?.begin?.(shape));
						switch (shape.type) {
							case GeometryTypeEnum.ARC: {
								output.push(config.shape?.[GeometryTypeEnum.ARC]?.(shape));
								break;
							}
							case GeometryTypeEnum.CIRCLE: {
								output.push(config.shape?.[GeometryTypeEnum.CIRCLE]?.(shape));
								break;
							}
							case GeometryTypeEnum.CUBIC_CURVE: {
								output.push(config.shape?.[GeometryTypeEnum.CUBIC_CURVE]?.(shape));
								break;
							}
							case GeometryTypeEnum.ELLIPSE: {
								output.push(config.shape?.[GeometryTypeEnum.ELLIPSE]?.(shape));
								break;
							}
							case GeometryTypeEnum.POINT: {
								output.push(config.shape?.[GeometryTypeEnum.POINT]?.(shape));
								break;
							}
							case GeometryTypeEnum.QUADRATIC_CURVE: {
								output.push(config.shape?.[GeometryTypeEnum.QUADRATIC_CURVE]?.(shape));
								break;
							}
							case GeometryTypeEnum.SEGMENT: {
								output.push(config.shape?.[GeometryTypeEnum.SEGMENT]?.(shape));
								break;
							}
						}
						// Shape end
						output.push(config.shape?.end?.(shape));
					}
					// Chain end
					output.push(config.chain?.endPoint?.(chain));
					output.push(config.chain?.end?.(chain));
				}
				// Cut end
				output.push(config.cut?.end?.(cut));
			}
			// Part end
			output.push(config.part?.end?.(part));
		}

		/** FIXME
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

		*/

		// Machine end
		output.push(config.machine?.end?.(program.machine));
		// Drawing end
		// output.push(this.config.drawing?.end?.(this.drawing));
		// Program end
		output.push(config.program?.end?.(program));

		return output;
	}

	drawing(config: RenderDrawingConfig, drawing: Drawing): string[] {
		// Initialize output collector
		const output: string[] = [];

		for (const layer of drawing.children) {
			// Layer begin
			output.push(config.layer?.begin?.(layer));
			for (const chain of layer.children) {
				for (const shape of chain.children) {
					// Shape begin
					output.push(config.shape?.begin?.(shape));
					switch (shape.type) {
						case GeometryTypeEnum.ARC: {
							output.push(config.shape?.[GeometryTypeEnum.ARC]?.(shape));
							break;
						}
						case GeometryTypeEnum.CIRCLE: {
							output.push(config.shape?.[GeometryTypeEnum.CIRCLE]?.(shape));
							break;
						}
						case GeometryTypeEnum.CUBIC_CURVE: {
							output.push(config.shape?.[GeometryTypeEnum.CUBIC_CURVE]?.(shape));
							break;
						}
						case GeometryTypeEnum.ELLIPSE: {
							output.push(config.shape?.[GeometryTypeEnum.ELLIPSE]?.(shape));
							break;
						}
						case GeometryTypeEnum.POINT: {
							output.push(config.shape?.[GeometryTypeEnum.POINT]?.(shape));
							break
						}
						case GeometryTypeEnum.QUADRATIC_CURVE: {
							output.push(config.shape?.[GeometryTypeEnum.QUADRATIC_CURVE]?.(shape));
							break
						}
						case GeometryTypeEnum.SEGMENT: {
							output.push(config.shape?.[GeometryTypeEnum.SEGMENT]?.(shape));
							break
						}
					}
					// Shape end
					output.push(config.shape?.end?.(shape));
				}
			}
			// Layer end
			output.push(config.layer?.end?.(layer));
		}

		return output;
	}

}
