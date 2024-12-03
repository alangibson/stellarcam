import { Point } from '../geometry/point/point';
import { Lead } from './lead';
import { Path } from './path';
import { Rapid } from './rapid';

export interface CutProperties {}

export interface ICut extends CutProperties {
	rapidTo?: Rapid;
	leadIn?: Lead;
	path: Path;
	leadOut?: Lead;
}

export class Cut implements ICut {
	// Children
	rapidTo?: Rapid;
	leadIn?: Lead;
	path: Path;
	leadOut?: Lead;

	constructor({ path, leadIn, leadOut, rapidTo }: ICut) {
		this.path = path;
		this.leadIn = leadIn;
		this.leadOut = leadOut;
		this.rapidTo = rapidTo;
	}

	get startPoint(): Point {
		return this.path.chain.startPoint;
	}

	get endPoint(): Point {
		return this.path.chain.endPoint;
	}
}
