import { Operation, OperationProperties } from "./operation";
import { Stock } from "./stock";

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

}

export interface IMachine extends MachineProperties {
    stock: Stock;
}

export class Machine implements IMachine {
    
    units: UnitEnum;
    cutterCompensation: CutterCompensationEnum;
    distanceMode: DistanceModeEnum;
    stock: Stock;
    
    constructor(c: IMachine) {
        this.units = c.units;
        this.cutterCompensation = c.cutterCompensation;
        this.distanceMode = c.distanceMode;
        this.stock = c.stock;
    }

}