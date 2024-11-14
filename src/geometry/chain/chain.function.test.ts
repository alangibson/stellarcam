import { Arc } from "../arc/arc";
import { chainContains } from "./chain.function";
import { Segment } from "../segment/segment";
import { Circle } from "../circle/circle";
import { CubicCurve } from "../cubic-curve/cubic-curve";
import { Chain } from "./chain";

const LARGE_SQUARE = new Chain([
    new Segment({ startPoint: { x: 1, y: 1 }, endPoint: { x: 7, y: 1 } }),
    new Segment({
        startPoint: { x: 7, y: 1 },
        endPoint: { x: 7, y: 7 },
    }),
    new Segment({
        startPoint: { x: 7, y: 7 },
        endPoint: { x: 1, y: 7 },
    }),
    new Segment({
        startPoint: { x: 1, y: 7 },
        endPoint: { x: 1, y: 1 },
    })
]);

test('chainContains: simple polygon containment', () => {
    // Given
    // Chain A: Small square
    const inner: Chain = new Chain([
        new Segment({ startPoint: { x: 3, y: 3 }, endPoint: { x: 5, y: 3 } }),
        new Segment({
            startPoint: { x: 5, y: 3 },
            endPoint: { x: 5, y: 5 }
        }),
        new Segment({
            startPoint: { x: 5, y: 5 },
            endPoint: { x: 3, y: 5 },
        }),
        new Segment({
            startPoint: { x: 3, y: 5 },
            endPoint: { x: 3, y: 3 }
        })
    ]);
    // Chain B: Large square
    const outer: Chain = LARGE_SQUARE;
    // When
    const isEnclosed = chainContains(outer, inner);
    // Then
    expect(isEnclosed).toBe(true);
});

test('chainContains: squares touching', () => {
    // Given
    // Chain A: Square touching Chain B at edge x=5
    const inner: Chain = new Chain([
        new Segment({ startPoint: { x: 5, y: 3 }, endPoint: { x: 7, y: 3 } }),
        new Segment({
            startPoint: { x: 7, y: 3 },
            endPoint: { x: 7, y: 5 }
        }),
        new Segment({
            startPoint: { x: 7, y: 5 },
            endPoint: { x: 5, y: 5 },
        }),
        new Segment({
            startPoint: { x: 5, y: 5 },
            endPoint: { x: 5, y: 3 }
        })
    ]);
    // Chain B: Large square
    const outer: Chain = LARGE_SQUARE;
    // When
    const isEnclosed = chainContains(outer, inner);
    // Then
    expect(isEnclosed).toBe(false);
});

test('chainContains: line intersects', () => {
    // Given
    // Chain A: Square touching Chain B at edge x=5
    const inner: Chain = new Chain([
        new Segment({ startPoint: { x: 0, y: 0 }, endPoint: { x: 8, y: 8 } })
    ]);
    // Chain B: Large square
    const outer: Chain = LARGE_SQUARE;
    // When
    const isEnclosed = chainContains(outer, inner);
    // Then
    expect(isEnclosed).toBe(false);
});

test('chainContains: separate polygons', () => {
    // Given
    // Chain A: Small square
    const inner: Chain = new Chain([
        new Segment({ startPoint: { x: 8, y: 8 }, endPoint: { x: 10, y: 8 } }),
        new Segment({
            startPoint: { x: 10, y: 8 },
            endPoint: { x: 10, y: 10 }
        }),
        new Segment({
            startPoint: { x: 10, y: 10 },
            endPoint: { x: 8, y: 10 },
        }),
        new Segment({
            startPoint: { x: 8, y: 10 },
            endPoint: { x: 8, y: 8 }
        })
    ]);
    // Chain B: Large square
    const outer: Chain = LARGE_SQUARE;
    // When
    const isEnclosed = chainContains(outer, inner);
    // Then
    expect(isEnclosed).toBe(false);
});

test('chainContains: enclosed arc', () => {
    // Given
    // Chain A: an arc
    const inner: Chain = new Chain([
        new Arc({
            center: { x: 4, y: 4 },
            radius: 1,
            startAngle: 0,
            endAngle: Math.PI,
        })
    ]);
    // Chain B: Large square
    const outer: Chain = LARGE_SQUARE;
    // When
    const isEnclosed = chainContains(outer, inner);
    // Then
    expect(isEnclosed).toBe(true);
});

test('chainContains: partially enclosed circle', () => {
    // Given
    // Chain A: an arc
    const inner: Chain = new Chain([
        new Circle({
            center: { x: 4, y: 4 },
            radius: 10
        })
    ]);
    // Chain B: Large square
    const outer: Chain = LARGE_SQUARE;
    // When
    const isEnclosed = chainContains(outer, inner);
    // Then
    expect(isEnclosed).toBe(false);
});

test('chainContains: enclosed, self-intersecting polygon', () => {
    // Given
    // Chain A: an arc
    const inner: Chain = new Chain([
        new Segment({ startPoint: { x: 3, y: 3 }, endPoint: { x: 5, y: 5 } }),
        new Segment({
            startPoint: { x: 5, y: 5 },
            endPoint: { x: 3, y: 5 },
        }),
        new Segment({
            startPoint: { x: 3, y: 5 },
            endPoint: { x: 5, y: 3 },
        }),
        new Segment({
            startPoint: { x: 5, y: 3 },
            endPoint: { x: 3, y: 3 },
        })
    ]);
    // Chain B: Large square
    const outer: Chain = LARGE_SQUARE;
    // When
    const isEnclosed = chainContains(outer, inner);
    // Then
    expect(isEnclosed).toBe(true);
});

test('chainContains: enclosed cubic curve', () => {
    // Given
    // Chain A: Closed cubic Bezier curve
    const inner: Chain = new Chain([
        new CubicCurve({
            startPoint: { x: 3, y: 4 },
            control1: { x: 4, y: 6 },
            control2: { x: 5, y: 2 },
            endPoint: { x: 6, y: 4 },
        }),
        new Segment({
            startPoint: { x: 6, y: 4 },
            endPoint: { x: 3, y: 4 },
        })
    ]);
    // Chain B: Large square
    const outer: Chain = LARGE_SQUARE;
    // When
    const isEnclosed = chainContains(outer, inner);
    // Then
    expect(isEnclosed).toBe(true);
});

test('chainContains: enclosed open polyline', () => {
    // Given
    // Chain A: Closed cubic Bezier curve
    const inner: Chain = new Chain([
        new Segment({
            startPoint: { x: 2, y: 2 },
            endPoint: { x: 2, y: 5 },
        }),
        new Segment({
            startPoint: { x: 2, y: 5 },
            endPoint: { x: 5, y: 5 },
        })
    ]);
    // Chain B: Large square
    const outer: Chain = LARGE_SQUARE;
    // When
    const isEnclosed = chainContains(outer, inner);
    // Then
    expect(isEnclosed).toBe(true);
});

test('chainContains: same chains', () => {
    // Given
    // Chain A: same chain
    const inner: Chain = new Chain([
        ...LARGE_SQUARE.children
    ]);
    // Chain B: Large square
    const outer: Chain = LARGE_SQUARE;
    // When
    const isEnclosed = chainContains(outer, inner);
    // Then
    expect(isEnclosed).toBe(false);
});