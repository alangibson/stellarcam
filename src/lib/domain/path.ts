import { Chain } from '../geometry/chain/chain';

export interface PathProperties {}

export interface IPath {
	chain: Chain;
}

export class Path implements IPath {
	// Children
	chain: Chain;

	constructor({ chain: chain }: IPath) {
		this.chain = chain;
	}
}
