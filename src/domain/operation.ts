import { Layer } from "./layer";

export interface OperationProperties {
    
    feedRate: number; // in machine units/min. magic param: fr, mandatory
    pierceDelay: number; // in seconds. magic param: pd, mandatory
    pierceHeight: number; // in machine units. magic param: ph, mandatory
    cutHeight: number; // in machine units. magic param: ch, mandatory
    thcState?: number; // 0,1. magic param: th, optional
    cutAmps?: number; // magic param: ca, optional
    cutVolts?: number; // magic param: cv, optional
    gasPressure?: number; // magic param: gp, optional
    cutMode?: number; // magic param: cm, optional
    puddleJumpHeight?: number; // in machine units. magic param: jh, optional
    puddleJumpDelay?: number; // in seconds. magic param: jd, optional
    pauseAtEndDelay?: number; // in seconds. magic param: pe, optional

    // plungeRate: number; // in machine units/min. 

    // From Tool
    kerfWidth?: number; // in machine units. magic param: kw, optional

}

export interface IOperation extends OperationProperties {
    layers: Layer[];
}

export class Operation implements IOperation {

    feedRate: number;
    pierceDelay: number;
    pierceHeight: number;
    cutHeight: number;
    thcState?: number;
    cutAmps?: number;
    cutVolts?: number;
    gasPressure?: number;
    cutMode?: number;
    puddleJumpHeight?: number;
    puddleJumpDelay?: number;
    pauseAtEndDelay?: number; // in seconds. magic param: pe, optional
    kerfWidth?: number;

    layers: Layer[];

    constructor(c: OperationProperties) {
        this.feedRate = c.feedRate;
        this.pierceDelay = c.pierceDelay;
        this.pierceHeight = c.pierceHeight;
        this.cutHeight = c.cutHeight;
        this.thcState = c.thcState;
        this.cutAmps = c.cutAmps;
        this.cutVolts = c.cutVolts;
        this.gasPressure = c.gasPressure;
        this.cutMode = c.cutMode;
        this.puddleJumpHeight = c.puddleJumpHeight;
        this.puddleJumpDelay = c.puddleJumpDelay;
        this.pauseAtEndDelay = c.pauseAtEndDelay;
        this.kerfWidth = c.kerfWidth;
        this.layers = [];
    }

}