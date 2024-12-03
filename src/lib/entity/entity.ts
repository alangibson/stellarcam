import type { Boundary } from "$lib/geometry/boundary/boundary";

export interface Entity {
	get boundary(): Boundary;
}
