import { Segment } from '../segment/segment';
import { Shape } from '../shape';
import { graphShapes } from './grapher.function';
import { QuadraticCurve } from '../quadratic-curve/quadratic-curve';

test('graphMultishapes', () => {
    // Given
    const shapes: Shape[] = [
        // polyline. closed. clockwise
        new Segment({start_point: {x: 0, y: 0}, end_point: {x: 1, y: 1}}),
        new Segment({start_point: {x: 1, y: 1}, end_point: {x: 2, y: 2}}),
        new Segment({start_point: {x: 2, y: 2}, end_point: {x: 0, y: 0}}),
        // polyline 1. closed. counterclockwise
        new Segment({start_point: {x: 22, y: 22}, end_point: {x: 21, y: 21}}),
        new Segment({start_point: {x: 21, y: 21}, end_point: {x: 20, y: 20}}),
        new Segment({start_point: {x: 20, y: 20}, end_point: {x: 22, y: 22}}),
        // single segment
        new Segment({start_point: {x: 3, y: 3}, end_point: {x: 4, y: 4}}),
        // polyline. open. end_point to end_point join
        new Segment({start_point: {x: 5, y: 5}, end_point: {x: 6, y: 6}}),
        new Segment({start_point: {x: 7, y: 7}, end_point: {x: 6, y: 6}}),
        // polyline. open. start_point to start_point join
        new Segment({start_point: {x: 8, y: 8}, end_point: {x: 9, y: 9}}),
        new Segment({start_point: {x: 8, y: 8}, end_point: {x: 10, y: 10}}),
        // polycurve. open. 
        new Segment({start_point: {x: 30, y: 30}, end_point: {x: 31, y: 31}}),
        new QuadraticCurve({control_points:[
            {x: 33, y: 33},
            {x: 32, y: 32},
            {x: 31, y: 31}
        ], knots: []})
    ];
    // When
    const graph: Shape[][] = graphShapes(shapes);
    // Then
    expect(graph.length).toBe(6);

    expect(graph[0].length).toBe(3);
    expect(graph[0][0].start_point).toBe(shapes[0].start_point);
    expect(graph[0][2].end_point).toBe(shapes[2].end_point);

    expect(graph[1].length).toBe(3);
    
    expect(graph[2].length).toBe(1);

    expect(graph[3].length).toBe(2);

    expect(graph[4].length).toBe(2);

    expect(graph[5].length).toBe(2);
});
