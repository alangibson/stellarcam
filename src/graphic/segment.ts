import Konva from "konva";
import { Segment } from "../geometry/segment";
import { Graphic } from "./graphic";
import { ShapeConfig } from "konva/lib/Shape";

export class SegmentGraphic implements Graphic {

    geometry: Segment;
    config: ShapeConfig;

    constructor(geometry: Segment, config: ShapeConfig) {
        this.geometry = geometry;
        this.config = config;
    }

    render(layer: Konva.Layer): Konva.Shape {

        // FIXME clone first
        // this.geometry.project(OriginEnum.TOP_LEFT, layer.width(), layer.height());
        const geometry = this.geometry;

        return new Konva.Line({
            ...this.config,
            points: [geometry.start_point.x, geometry.start_point.y, geometry.end_point.x, this.geometry.end_point.y]
        });
    }

}