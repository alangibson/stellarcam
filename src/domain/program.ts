import { Machine, MachineProperties } from "./machine";

export interface ProgramProperties {
}

export interface IProgram extends ProgramProperties {
    machine: Machine;
}

export class Program implements IProgram {

    machine: Machine;

    constructor(c: IProgram) {
        this.machine = c.machine;
    }

}