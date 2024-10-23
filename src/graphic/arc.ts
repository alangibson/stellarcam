import { ShapeConfig } from "konva/lib/Shape";
import { Arc, WindEnum } from "../geometry/arc";
import { Graphic } from "./graphic";
import Konva from "konva";
import { OriginEnum } from "../geometry/origin.enum";

export class ArcGraphic implements Graphic {

    geometry: Arc;
    config: ShapeConfig;

    constructor(geometry: Arc, config: ShapeConfig) {
        this.geometry = geometry;
        this.config = config;
    }

    render(layer: Konva.Layer): Konva.Shape {

        // FIXME clone first
        // this.geometry.project(OriginEnum.TOP_LEFT, layer.width(), layer.height());
        const geometry = this.geometry;

        return new Konva.Arc({
            ...this.config,
            x: this.geometry.center.x,
            y: this.geometry.center.y,
            innerRadius: this.geometry.radius,
            outerRadius: this.geometry.radius,
            angle: this.geometry.angle_degrees,
            rotation: this.geometry.start_angle_degrees
        });

    }

}