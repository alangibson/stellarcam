import { Shape } from "../../geometry/shape";
import { QuadraticCurve } from "../../geometry/quadratic-curve/quadratic-curve";
import { Segment } from "../../geometry/segment/segment";
import { graphShapes } from "./grapher.function";

test("graphChains", () => {
  // Given
  const shapes: Shape[] = [
    // polyline. closed. clockwise
    new Segment({ startPoint: { x: 0, y: 0 }, endPoint: { x: 1, y: 1 } }),
    new Segment({ startPoint: { x: 1, y: 1 }, endPoint: { x: 2, y: 2 } }),
    new Segment({ startPoint: { x: 2, y: 2 }, endPoint: { x: 0, y: 0 } }),
    // polyline 1. closed. counterclockwise
    new Segment({ startPoint: { x: 22, y: 22 }, endPoint: { x: 21, y: 21 } }),
    new Segment({ startPoint: { x: 21, y: 21 }, endPoint: { x: 20, y: 20 } }),
    new Segment({ startPoint: { x: 20, y: 20 }, endPoint: { x: 22, y: 22 } }),
    // single segment
    new Segment({ startPoint: { x: 3, y: 3 }, endPoint: { x: 4, y: 4 } }),
    // polyline. open. endPoint to endPoint join
    new Segment({ startPoint: { x: 5, y: 5 }, endPoint: { x: 6, y: 6 } }),
    new Segment({ startPoint: { x: 7, y: 7 }, endPoint: { x: 6, y: 6 } }),
    // polyline. open. startPoint to startPoint join
    new Segment({ startPoint: { x: 8, y: 8 }, endPoint: { x: 9, y: 9 } }),
    new Segment({ startPoint: { x: 8, y: 8 }, endPoint: { x: 10, y: 10 } }),
    // polycurve. open.
    new Segment({ startPoint: { x: 30, y: 30 }, endPoint: { x: 31, y: 31 } }),
    new QuadraticCurve({
      startPoint: { x: 33, y: 33 },
      control1: { x: 32, y: 32 },
      endPoint: { x: 31, y: 31 },
    }),
  ];
  // When
  const graph: Shape[][] = graphShapes(shapes);
  // Then
  expect(graph.length).toBe(6);

  expect(graph[0].length).toBe(3);
  expect(graph[0][0].startPoint).toBe(shapes[0].startPoint);
  expect(graph[0][2].endPoint).toBe(shapes[2].endPoint);

  expect(graph[1].length).toBe(3);

  expect(graph[2].length).toBe(1);

  expect(graph[3].length).toBe(2);

  expect(graph[4].length).toBe(2);

  expect(graph[5].length).toBe(2);
});
