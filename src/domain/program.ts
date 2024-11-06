import { Machine, MachineProperties } from "./machine";

export interface ProgramProperties {
    
    machine: MachineProperties;
    
}

export class Program implements ProgramProperties {

    machine: MachineProperties;

    constructor(props: ProgramProperties) {
        this.machine = new Machine(props.machine);
    }

}