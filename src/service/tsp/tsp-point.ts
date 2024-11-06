import { Cut } from "../../domain/cut";

export class TspPoint {
    x: number;
    y: number;
    cut: Cut;
    constructor(cut: Cut) {
      this.cut = cut;
      this.x = cut.startPoint.x;
      this.y = cut.startPoint.y;
    }
  }