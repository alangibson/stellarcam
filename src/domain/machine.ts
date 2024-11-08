import { Operation, OperationProperties } from "./operation";

export enum UnitEnum {
    METRIC = 'metric',
    IMPERIAL = 'imperial'
}

export enum CutterCompensationEnum {
    // TODO
}

export enum DistanceModeEnum {
    // TODO
}


export interface MachineProperties {
    // G21 (units: metric)
    units: UnitEnum
    // G40 (cutter compensation: off)
    cutterCompensation: CutterCompensationEnum;
    // G90 (distance mode: absolute)
    distanceMode: DistanceModeEnum;

    // TODO support these codes:
    // M52 P1 (adaptive feed: on)
    // M65 P2 (enable THC)
    // M65 P3 (enable torch)
    // M68 E3 Q0 (velocity 100%)
    // G64 P0.254 Q0.025 (tracking tolerances: 0.254mm)

    operations: OperationProperties[];
}

export class Machine implements MachineProperties {
    
    units: UnitEnum;
    cutterCompensation: CutterCompensationEnum;
    distanceMode: DistanceModeEnum;
    operations: Operation[];
    
    constructor(props: MachineProperties) {
        this.units = props.units;
        this.cutterCompensation = props.cutterCompensation;
        this.distanceMode = props.distanceMode;
        this.operations = props.operations.map((operationDef) => new Operation(operationDef));
    }

}