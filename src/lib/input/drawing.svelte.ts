import { InputLayer } from './layer.svelte';

export class InputDrawing {
	layers: { [name: string]: InputLayer } = $state({});

	constructor(layers: { [key: string]: InputLayer }) {
		this.layers = layers;
	}
}
