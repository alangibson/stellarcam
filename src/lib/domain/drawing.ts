import { Chain } from '$lib/geometry/chain/chain';
import type { Shape } from '$lib/geometry/shape';
import type { InputDrawing } from '$lib/input/drawing.svelte';
import { Grapher } from '$lib/service/graph/grapher';
import { reorientShapes } from '$lib/service/graph/grapher.function';
import { Parent } from '../entity/parent';
import { Area } from '../geometry/area';
import { Layer } from './layer';

export interface DrawingConfig {
	tolerance: number;
}

/** A DXF/SVG drawing. */
export class Drawing extends Parent<Layer> {
	// children: Layer[];
	area: Area;

	constructor(children: Layer[], area: Area) {
		super(children);
		this.area = area;
	}

	get width(): number {
		return this.boundary.width;
	}

	get height(): number {
		return this.boundary.height;
	}

	get units(): string {
		// TODO don't hard code mm
		return 'mm';
	}

	static from(config: DrawingConfig, inputDrawing: InputDrawing): Drawing {
		// Loop over DXF layers. One graph per layer
		const layers: Layer[] = [];
		const area = new Area();
		for (const layerName in inputDrawing.layers) {
			const shapes: Shape[] = inputDrawing.layers[layerName].shapes;
			// Generate Multishapes
			// Connect all points within given tolerance
			const graphs: Shape[][] = new Grapher().solve(shapes, config.tolerance);
			const chains: Chain[] = [];
			for (let graph of graphs) {
				// TODO do this in Grapher.solve()?
				reorientShapes(graph, config.tolerance);

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

		return drawing;
	}
}
