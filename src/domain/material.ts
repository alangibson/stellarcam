
export enum MaterialTypeEnum {
    MILD_STEEL = 'mild_steel',
    STAINLESS_STEEL = 'stainless_steel',
    ALUMINUM = 'aluminum'
}

export interface MaterialProperties {
    thickness: number; // in machine units
    type: MaterialTypeEnum;
}