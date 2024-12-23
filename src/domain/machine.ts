import { CutterCompensationEnum, DistanceModeEnum, UnitEnum } from "./machine.enum";
import { Stock } from "./stock";

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

    // Properties
    units: UnitEnum;
    cutterCompensation: CutterCompensationEnum;
    distanceMode: DistanceModeEnum;
    // Children
    stock: Stock;
    
    constructor({units, cutterCompensation, distanceMode, stock}: IMachine) {
        this.units = units;
        this.cutterCompensation = cutterCompensation;
        this.distanceMode = distanceMode;
        this.stock = stock;
    }

}