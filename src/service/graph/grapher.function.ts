import { Shape } from "../../geometry/shape";

export function reorientShapes(shapes: Shape[], tolerance: number = 0.01) {
  // FIXME this is causing some arcs to be rendered upside down

  for (let i = 1; i < shapes.length; i++) {
    const prevShape: Shape = shapes[i - 1];
    const currentShape: Shape = shapes[i];
    if (prevShape.endPoint.isEqual(currentShape.startPoint, tolerance)) {
      // Already correctly oriented
      continue;
    } else if (prevShape.endPoint.isEqual(currentShape.endPoint, tolerance)) {
      // Reverse the current segment to match the end to start
      currentShape.reverse();
    } else if (
      prevShape.startPoint.isEqual(currentShape.startPoint, tolerance)
    ) {
      // Reverse the previous segment to match the start to end
      prevShape.reverse();
    } else if (prevShape.startPoint.isEqual(currentShape.endPoint, tolerance)) {
      currentShape.reverse();
      prevShape.reverse();
    }
  }
}

export function sortShapes(shapes: Shape[], tolerance: number = 0.01): Shape[] {
  const result: Shape[] = [shapes[0]]; // Start with the first shape
  const remainingShapes = shapes.slice(1); // Remove the first shape from remaining shapes

  while (remainingShapes.length > 0) {
    let shapeFound = false;

    // Try to find a shape whose start point matches the end point of the last shape in the result
    for (let i = 0; i < remainingShapes.length; i++) {
      const remainingShape: Shape = remainingShapes[i];
      const lastResult: Shape = result[result.length - 1];

      if (remainingShape.startPoint.isEqual(lastResult.endPoint, tolerance)) {
        result.push(remainingShape);
        remainingShapes.splice(i, 1); // Remove the matched shape from remaining shapes
        shapeFound = true;
        break;
      }
    }

    // If no matching shape is found, it means the shapes can't be sorted in a sequence
    if (!shapeFound) {
      throw new Error("Shapes cannot be connected to form a sequence");
    }
  }

  return result;
}

export function graphShapes(
  shapes: Shape[],
  tolerance: number = 0.01,
): Shape[][] {
  const multishapes: Shape[][] = [];
  const visited = new Array(shapes.length).fill(false);

  function dfs(index, group) {
    visited[index] = true;
    group.push(shapes[index]);

    for (let i = 0; i < shapes.length; i++) {
      if (!visited[i] && shapes[index].isConnectedTo(shapes[i], tolerance)) {
        dfs(i, group);
      }
    }
  }

  for (let i = 0; i < shapes.length; i++) {
    if (!visited[i]) {
      const group: Shape[] = [];
      dfs(i, group);
      multishapes.push(group);
    }
  }

  return multishapes;
}
