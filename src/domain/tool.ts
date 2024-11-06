export enum ToolTypeEnum {
    PLASMA = 'plasma'
}

export interface ToolProperties {
    type: ToolTypeEnum;
    kerfWidth?: number; // in machine units. magic param: kw, optional

}