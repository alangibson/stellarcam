import { Boundary } from '$lib/geometry/boundary/boundary';
import { type Entity } from './entity';

export class Parent<C extends Entity> implements Entity {
	children: C[];

	constructor(children: C[] = []) {
		this.children = children;
	}

	get boundary(): Boundary {
		const boundary = new Boundary({ startPoint: { x: 0, y: 0 }, endPoint: { x: 0, y: 0 } });
		this.children.forEach((entity) => boundary.join(entity.boundary));
		return boundary;
	}
	
}
