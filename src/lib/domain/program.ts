import { Machine } from './machine';

export interface ProgramProperties {
	width: number;
	height: number;
	units: string;
}

export interface IProgram extends ProgramProperties {
	machine: Machine;
}

export class Program implements IProgram {
	// Properties
	width: number;
	height: number;
	units: string;
	// Children
	machine: Machine;

	constructor({ height, width, units, machine }: IProgram) {
		this.height = height;
		this.width = width;
		this.units = units;
		this.machine = machine;
	}
}
