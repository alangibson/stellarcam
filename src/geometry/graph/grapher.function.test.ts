import { Segment } from '../segment';
import { Point } from '../point';
import { Shape } from '../shape';
import { graphShapes } from './grapher.function';
import { Curve } from '../curve';

test('graphMultishapes', () => {
    // Given
    const shapes: Shape[] = [
        // polyline. closed. clockwise
        new Segment(new Point({x: 0, y: 0}), new Point({x: 1, y: 1})),
        new Segment(new Point({x: 1, y: 1}), new Point({x: 2, y: 2})),
        new Segment(new Point({x: 2, y: 2}), new Point({x: 0, y: 0})),
        // polyline 1. closed. counterclockwise
        new Segment(new Point({x: 22, y: 22}), new Point({x: 21, y: 21})),
        new Segment(new Point({x: 21, y: 21}), new Point({x: 20, y: 20})),
        new Segment(new Point({x: 20, y: 20}), new Point({x: 22, y: 22})),
        // single segment
        new Segment(new Point({x: 3, y: 3}), new Point({x: 4, y: 4})),
        // polyline. open. end_point to end_point join
        new Segment(new Point({x: 5, y: 5}), new Point({x: 6, y: 6})),
        new Segment(new Point({x: 7, y: 7}), new Point({x: 6, y: 6})),
        // polyline. open. start_point to start_point join
        new Segment(new Point({x: 8, y: 8}), new Point({x: 9, y: 9})),
        new Segment(new Point({x: 8, y: 8}), new Point({x: 10, y: 10})),
        // polycurve. open. 
        new Segment(new Point({x: 30, y: 30}), new Point({x: 31, y: 31})),
        new Curve({control_points:[
            new Point({x: 33, y: 33}),
            new Point({x: 32, y: 32}),
            new Point({x: 31, y: 31})
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
