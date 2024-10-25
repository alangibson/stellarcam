import { angleBetweenPoints } from "./point.function";

test('angleBetweenPoints north', () => {
    expect(angleBetweenPoints(1, 1, 1, 10)).toBe(0);
});

test('angleBetweenPoints east', () => {
    expect(angleBetweenPoints(1, 1, 10, 1)).toBe(90);
});

test('angleBetweenPoints south', () => {
    expect(angleBetweenPoints(1,10, 1,1)).toBe(180);
});

test('angleBetweenPoints west', () => {
    expect(angleBetweenPoints(10,1, 1,1)).toBe(270);
});