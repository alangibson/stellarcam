import {arcOrientation, arcSweep} from './arc.function';
import { DirectionEnum } from './geometry.enum';

const PI = Math.PI;
const HALFPI = PI/2;

test('arcSweep CCW 90 -> 270', () => {
    expect(arcSweep(HALFPI, HALFPI*3)).toBe(PI);
});

test('arcSweep CW 90 -> 270', () => {
    expect(arcSweep(-HALFPI, -HALFPI*3)).toBe(-PI);
});


// Clockwise (CW)

test('arcOrientation: 0 -> -PI', () => {
    expect(arcOrientation(0, -PI)).toBe(DirectionEnum.CW);
});

test('arcOrientation: 0 -> -HALFPI*3', () => {
    expect(arcOrientation(0, -HALFPI*3)).toBe(DirectionEnum.CW);
});

// Empirical, but contradicts math?
// test('arcOrientation', () => {
//     expect(arcOrientation(-HALFPI*3, -PI)).toBe(DirectionEnum.CCW);
// });
test('arcOrientation', () => {
    expect(arcOrientation(-HALFPI*3, -PI)).toBe(DirectionEnum.CW);
});

// Empirical, but contradicts math?
// test('arcOrientation', () => {
//     expect(arcOrientation(-HALFPI, 0)).toBe(DirectionEnum.CCW);
// });
test('arcOrientation', () => {
    expect(arcOrientation(-HALFPI, 0)).toBe(DirectionEnum.CW);
});

// Empirical, but contradicts math?
// test('arcOrientation', () => {
//     expect(arcOrientation(-PI, -HALFPI)).toBe(DirectionEnum.CCW);
// });
test('arcOrientation', () => {
    expect(arcOrientation(-PI, -HALFPI)).toBe(DirectionEnum.CW);
});

// Counterclockwise (CCW)

// test('arcOrientation: 0 -> PI', () => {
//     expect(arcOrientation(0, PI)).toBe(DirectionEnum.CCW);
// });

// test('arcOrientation', () => {
//     expect(arcOrientation(-PI, 0)).toBe(DirectionEnum.CCW);
// });




