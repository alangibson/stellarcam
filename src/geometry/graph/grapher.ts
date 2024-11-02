import { Geometry } from "../geometry";
import { Point } from "../point/point";
import { Shape } from "../shape";
import { graphShapes } from "./grapher.function";

export enum ConnectionEnum {
  START_END = "start_end",
  END_START = "end_start",
  END_END = "end_end",
  START_START = "start_start",
}

const setsAreEqual = (xs: Set<number>, ys: Set<number>) =>
  xs.size === ys.size && [...xs].every((x) => ys.has(x));

// https://experiencestack.co/graph-implementation-in-python-916fc3b6a8a
export function dfs(graph: number[][], start: number) {
  const visited: Set<number> = new Set();
  const stack: number[] = [start];
  visited.add(start);
  while (stack.length > 0) {
    const node: number = stack.pop();
    for (let neighbor of graph[node]) {
      if (!visited.has(neighbor)) {
        stack.push(neighbor);
        visited.add(neighbor);
      }
    }
  }
  return visited;
}

export class Vertex {
  geometry: Geometry;
  next: Vertex;
  previous: Vertex;
  connection: ConnectionEnum;

  constructor(geometry: Geometry) {
    this.geometry = geometry;
  }
}

export class Grapher2 {
  /**
   * Array index = shape index
   * Array at index = array of shape index
   *
   * https://experiencestack.co/graph-implementation-in-python-916fc3b6a8a
   */
  adjacency_list(geometries: Geometry[]): Array<Array<number>> {
    const TOLERANCE = 0.01;
    const adjacency_list: Array<Array<number>> = [];
    for (let row_i = 0; row_i < geometries.length; row_i++) {
      adjacency_list[row_i] = [];
      // const this_vertex = new Vertex(geometries[row_i]);
      for (let col_i = 0; col_i < geometries.length; col_i++) {
        // const next_vertex = new Vertex(geometries[col_i]);

        // const connectedEndToStart = geometries[row_i].endPoint.equals(geometries[col_i].startPoint, TOLERANCE);
        // const connectedStartToEnd = geometries[row_i].startPoint.equals(geometries[col_i].endPoint, TOLERANCE);
        // const connectedEndToEnd = geometries[row_i].endPoint.equals(geometries[col_i].endPoint, TOLERANCE);
        // const connectedStartToStart = geometries[row_i].startPoint.equals(geometries[col_i].startPoint, TOLERANCE);

        // if (connectedEndToStart) {
        //     this_vertex.next = next_vertex;
        //     next_vertex.previous = this_vertex;
        // } else if (connectedStartToEnd) {
        //     this_vertex.previous = next_vertex;
        //     next_vertex.next = this_vertex;
        // } else if (connectedEndToEnd) {
        //     this_vertex.next = next_vertex;
        //     next_vertex.next = this_vertex;
        // } else if (connectedStartToStart) {
        //     this_vertex.previous = next_vertex;
        //     next_vertex.previous = this_vertex;
        // } else {
        //     // not connected
        //     continue;
        // }

        // const connected = connectedEndToStart || connectedStartToEnd || connectedEndToEnd || connectedStartToStart;
        // if (connected)
        //     // Eliminate duplicates in adjacency list
        //     if (! adjacency_list[row_i].includes(col_i))
        //         // TODO push on Vertex, not number
        //         adjacency_list[row_i].push(col_i);

        // Previous way:
        //
        const endToStartDistance = geometries[row_i].endPoint.distance(
          geometries[col_i].startPoint,
        );

        // FIXME Both start-to-start and end-to-end results in broken links
        // However, if only one is used then multishapes don't always get linked
        const endToEndDistance = geometries[row_i].endPoint.distance(
          geometries[col_i].endPoint,
        );
        const startToStartDistance = geometries[row_i].startPoint.distance(
          geometries[col_i].startPoint,
        );

        // If this one is brought back, be sure to add it to 'distance' calculation below
        // const startToEndDistance = geometries[col_i].endPoint.distance(geometries[row_i].startPoint);
        const distance = Math.min(
          endToStartDistance,
          endToEndDistance,
          startToStartDistance,
        );
        if (row_i == col_i) {
          // do nothing
        } else if (distance <= TOLERANCE) {
          // Eliminate duplicates in adjacency list
          if (!adjacency_list[row_i].includes(col_i))
            adjacency_list[row_i].push(col_i);
        } else {
          // do nothing
        }
      }
    }
    return adjacency_list;
  }

  connect(
    adjacency_list: Array<Array<number>>,
    geometries: Geometry[],
  ): Array<Set<number>> {
    const visited_sets: Array<Set<number>> = [];
    for (let shape_i = 0; shape_i < geometries.length; shape_i++) {
      const visited = dfs(adjacency_list, shape_i);
      // Eliminate equivalent visited lists where set1==set2
      const found = visited_sets.find((visited_set) =>
        setsAreEqual(visited_set, visited),
      );
      if (!found) {
        visited_sets.push(visited);
      }
    }
    return visited_sets;
  }

  graph(geometries: Geometry[]): Array<Set<number>> {
    const adjacency_list: number[][] = this.adjacency_list(geometries);
    const connections: Array<Set<number>> = this.connect(
      adjacency_list,
      geometries,
    );
    return connections;
  }
}

export class Grapher {
  graph(shapes: Shape[], tolerance: number = 0.01): Shape[][] {
    return graphShapes(shapes, tolerance);
  }
}
