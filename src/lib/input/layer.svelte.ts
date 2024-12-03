import { Shape } from '../geometry/shape';

export class InputLayer {
	name: string = $state('Default');
	shapes: Shape[] = $state([]);

	constructor(name: string, shapes: Shape[] = []) {
		this.name = name;
		this.shapes = shapes;
	}
}
