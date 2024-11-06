import { Rectangle } from "../geometry/rectangle/rectangle";

export interface Entity {

    get boundary(): Rectangle;
    
}
