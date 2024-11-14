import { Part } from "./part";

export interface StockProperties {
    width: number;
    length: number;
}

export interface IStock extends StockProperties {
    parts: Part[];
}

export class Stock implements IStock {

    // Properties
    width: number;
    length: number;
    // Children
    parts: Part[];

    constructor({ length, width, parts }: IStock) {
        this.length = length;
        this.width = width;
        this.parts = parts;
    }
    
}