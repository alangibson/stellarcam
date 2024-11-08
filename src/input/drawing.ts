import { InputLayer } from "./layer";

export class InputDrawing {
  layers: { [name: string]: InputLayer };

  constructor(layers: { [key: string]: InputLayer }) {
    this.layers = layers;
  }
}
