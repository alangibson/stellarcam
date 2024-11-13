import { Cut } from "../../domain/cut";
import { Part } from "../../domain/part";
import { chainContains } from "../../geometry/chain/chain.function";

export class Parter {

    process(cuts: Cut[]): Part[] {
        // Create nodes for each polygon with properties for parent and children
        interface Node {
            cut: Cut,
            parent: Node,
            children: Node[]
        };
        let nodes: Node[] = cuts.map(cut => ({ cut: cut, parent: null, children: [] }));
    
        // Assign parent to each node based on containment
        for (let i = 0; i < nodes.length; i++) {
            let nodeP = nodes[i];
            for (let j = 0; j < nodes.length; j++) {
                if (i === j) continue;
                let nodeQ = nodes[j];
                if (chainContains(nodeQ.cut.chain, nodeP.cut.chain)) {
                    if (nodeP.parent === null || chainContains(nodeQ.cut.chain, nodeP.parent.cut.chain)) {
                        nodeP.parent = nodeQ;
                    }
                }
            }
        }
    
        // Build children arrays for each node
        for (let node of nodes) {
            if (node.parent) {
                node.parent.children.push(node);
            }
        }
    
        // Find all outermost polygons (roots of containment trees)
        let roots = nodes.filter(node => node.parent === null);

        // Recursive function to process into Parts
        let parts: Part[] = [];
        function processNode(node: Node) {
            let holes: Cut[] = node.children.map(child => child.cut);
    
            if (node.parent === null)
                parts.push(new Part({
                    shell: node.cut,
                    holes: holes
                }));
    
            // Process children recursively
            for (let child of node.children) {
                processNode(child);
            }
        }
    
        // Process each root node
        for (let root of roots) {
            processNode(root);
        }
    
        return parts;
    }
    
}