import salesman from 'salesman.js';
import { TspPoint } from "./tsp-point";
import { PointProperties } from '../../geometry/point/point';
import { Rapid } from '../../domain/rapid';
import { Cut } from '../../domain/cut';

export class TravellingSalesman {
    
    solve(tspPoints: TspPoint[]) {
        const solutionIndexes: number[] = salesman.solve(tspPoints);
        const rapidStartPoints = solutionIndexes.map(i => tspPoints[i]);

        // Start from origin
        let lastPoint: PointProperties = {x: 0, y: 0};
        for (const tspPoint of rapidStartPoints) {
            const cut: Cut = tspPoint.cut;
            cut.rapidTo = new Rapid({startPoint: lastPoint, endPoint: cut.startPoint});
            lastPoint = cut.endPoint;
        }

    }

}