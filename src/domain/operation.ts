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

    layers: Layer[];

}

export class Operation implements OperationProperties {

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
    kerfWidth?: number;

    layers: Layer[];

    constructor(def: OperationProperties) {
        this.feedRate = def.feedRate;
        this.pierceDelay = def.pierceDelay;
        this.pierceHeight = def.pierceHeight;
        this.cutHeight = def.cutHeight;
        this.thcState = def.thcState;
        this.cutAmps = def.cutAmps;
        this.cutVolts = def.cutVolts;
        this.gasPressure = def.gasPressure;
        this.cutMode = def.cutMode;
        this.puddleJumpHeight = def.puddleJumpHeight;
        this.puddleJumpDelay = def.puddleJumpDelay;
        this.kerfWidth = def.kerfWidth;
        this.layers = def.layers;
    }

}