import { Shape } from "../shape";

const setsAreEqual = (xs: Set<number>, ys: Set<number>) =>
    xs.size === ys.size &&
    [...xs].every((x) => ys.has(x));

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

export class Grapher {

    /**
     * Array index = shape index
     * Array at index = array of shape index
     * 
     * https://experiencestack.co/graph-implementation-in-python-916fc3b6a8a
     */
    adjacency_list(shapes: Shape[]): Array<Array<number>> {
        const TOLERANCE = 0.01;
        const adjacency_list: Array<Array<number>> = [];
        for (let row_i = 0; row_i < shapes.length; row_i++) {
            adjacency_list[row_i] = [];
            for (let col_i = 0; col_i < shapes.length; col_i++) {
                const distance1 = shapes[row_i].end_point.distance(shapes[col_i].start_point);
                const distance2 = shapes[col_i].end_point.distance(shapes[row_i].start_point);
                const distance = Math.min(distance1, distance2);
                if (row_i == col_i) {
                    // do nothing
                } else if (distance <= TOLERANCE) {
                    // Eliminate duplicates in adjacency list
                    if (! adjacency_list[row_i].includes(col_i))
                        adjacency_list[row_i].push(col_i);
                } else {
                    // do nothing
                }
            }
        }
        return adjacency_list;
    }

    connect(adjacency_list: Array<Array<number>>, shapes: Shape[]): Array<Set<number>> {
        const visited_sets: Array<Set<number>> = [];
        for (let shape_i = 0; shape_i < shapes.length; shape_i++) {
            const visited = dfs(adjacency_list, shape_i);
            // Eliminate equivalent visited lists where set1==set2
            const found = visited_sets.find((visited_set) => setsAreEqual(visited_set, visited));
            if (! found) {
                visited_sets.push(visited);
            }
        }
        return visited_sets;
    }

}