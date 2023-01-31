import Node from "./node.js";
import IO from "./io.js";
import { ButtonWidget, Widget } from "./widgets.js";

class Utils {
    static letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

    static backgroundColor = '#212d38';
    static accentColor = '#2f3e4e';
    static accentColor2 = '#3f4e5e';
    static highlightColor = '#2d5b8a';
    static selectColor = 'rgba(4, 122, 239, 0.25)'
    static textColor = '#ffffff';
    static footerTextColor = '#909090';

    static nodes: Node[] = [];
    static inputs: Node[] = [];
    static outputs: Node[] = [];

    static selectedNode: Node | undefined = undefined;
    static selectedNodes: Node[] = [];
    static selectingMultiple = false;

    static prebuiltNodes = ["Random", "input", "output", "or", "nor", "xor", "and", "xnor", "nand", "not"];  

    static powerColor(powered: boolean) {
        return !powered ? '#84423f' : '#34c13b';
    }

    static mouse = {
        x: 0,
        y: 0,
        dragging: false,
        draggingNode: null as Node | null,
        draggingIO: undefined as IO | undefined,
        hoveringInput: undefined as IO | undefined,
        hoveringOutput: undefined as IO | undefined,
        dragOffset: {
            x: 0,
            y: 0
        },
        dragStart: {
            x: 0,
            y: 0
        },
        selecting: false,
        clicking: false,
    }

    static getTextWidth(ctx: CanvasRenderingContext2D, text: string) {
        var total = 0;
        for (let i = 0; i < text.length; i++) {
            total += ctx.measureText(text[i]).width;
        }
        return total;
    }

    static getTextHeight(ctx: CanvasRenderingContext2D, text: string) {
        let metrics = ctx.measureText(text);
        let fontHeight = metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent;
        return fontHeight;
    }

    static circle(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, fill: string) {
        ctx.fillStyle = fill;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2, false);
        ctx.fill();
    }

    static circleContainsPoint(x: number, y: number, cx: number, cy: number, radius: number) {
        return Math.sqrt(Math.pow(x - cx, 2) + Math.pow(y - cy, 2)) < radius;
    }

    static rectContainsPoint(x: number, y: number, rx: number, ry: number, rw: number, rh: number) {
        return x >= rx && x <= rx + rw && y >= ry && y <= ry + rh;
    }

    static rectIntersectsRect(x1: number, y1: number, w1: number, h1: number, x2: number, y2: number, w2: number, h2: number) {
        return x1 < x2 + w2 && x1 + w1 > x2 && y1 < y2 + h2 && y1 + h1 > y2;
    }

    static bezierLine(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, stroke: string) {
        ctx.strokeStyle = stroke;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.bezierCurveTo(x1 - 50, y1, x2 + 50, y2, x2, y2);
        ctx.stroke();
    }

    static CreateNode(ctx: CanvasRenderingContext2D, name: string) {
        // find a position by adding to x and y until it doesn't intersect with any other nodes
        let x = 100;
        let y = 100;
        let intersects = true;
        while (intersects) {
            intersects = false;
            for (let i = 0; i < this.nodes.length; i++) {
                let node = this.nodes[i];
                if (this.rectIntersectsRect(x, y, 200, 200, node.x, node.y, node.width, node.height)) {
                    intersects = true;
                    x += 50;
                    if (x > ctx.canvas.width - 200) {
                        x = 100;
                        y += 50;
                    }
                    break;
                }
            }
        }

        switch (name) {
            case "Random":
                // set the name to something else from the list
                name = this.prebuiltNodes[Math.floor(Math.random() * this.prebuiltNodes.length)];
                this.CreateNode(ctx, name);
                break;
            case "or":
                this.nodes.push(new Node(ctx, {
                    title: 'OR',
                    inputs: ["A", "B"],
                    outputs: ["C"],
                    x: x,
                    y: y,
                    tooltip: "Outputs true if either input is true."
                }, (inputs: IO[]) => {
                    return [inputs[0].powered || inputs[1].powered];
                }))
                break;
            case "and":
                this.nodes.push(new Node(ctx, {
                    title: 'AND',
                    inputs: ["A", "B"],
                    outputs: ["C"],
                    x: x,
                    y: y,
                    tooltip: "Outputs true if both inputs are true."
                }, (inputs: IO[]) => {
                    return [inputs[0].powered && inputs[1].powered];
                }));
                break;
            case "not":
                this.nodes.push(new Node(ctx, {
                    title: 'NOT',
                    inputs: ["A"],
                    outputs: ["B"],
                    x: x,
                    y: y,
                    tooltip: "Outputs true if the input is false."
                }, (inputs: IO[]) => {
                    return [!inputs[0].powered];
                }));
                break;
            case "input":
                this.nodes.push(new Node(ctx, {
                    title: 'Input',
                    inputs: [],
                    outputs: ["A"],
                    x: x,
                    y: y,
                    tooltip: "Outputs true if the input is true.",
                    widgetOptions: [{ type: "button", parentIOName: "A" }]
                }, (inputs: IO[], widgets: Widget[]) => {
                    return [widgets[0].powered];
                }));
                break;
            case "output":
                this.nodes.push(new Node(ctx, {
                    title: 'Output',
                    inputs: ["A"],
                    outputs: [],
                    x: x,
                    y: y,
                    tooltip: "Outputs true if the input is true."
                }, (inputs: IO[]) => {
                    return [];
                }));
                break;
            case "xor":
                this.nodes.push(new Node(ctx, {
                    title: 'XOR',
                    inputs: ["A", "B"],
                    outputs: ["C"],
                    x: x,
                    y: y,
                    tooltip: "Outputs true if one input is true and the other is false."
                }, (inputs: IO[]) => {
                    return [inputs[0].powered != inputs[1].powered];
                }));
                break;
            case "nand":
                this.nodes.push(new Node(ctx, {
                    title: 'NAND',
                    inputs: ["A", "B"],
                    outputs: ["C"],
                    x: x,
                    y: y,
                    tooltip: "Outputs true if both inputs are false."
                }, (inputs: IO[]) => {
                    return [!(inputs[0].powered && inputs[1].powered)];
                }));
                break;
            case "nor":
                this.nodes.push(new Node(ctx, {
                    title: 'NOR',
                    inputs: ["A", "B"],
                    outputs: ["C"],
                    x: x,
                    y: y,
                    tooltip: "Outputs true if both inputs are false."
                }, (inputs: IO[]) => {
                    return [!(inputs[0].powered || inputs[1].powered)];
                }));
                break;
            case "xnor":
                this.nodes.push(new Node(ctx, {
                    title: 'XNOR',
                    inputs: ["A", "B"],
                    outputs: ["C"],
                    x: x,
                    y: y,
                    tooltip: "Outputs true if both inputs are the same."
                }, (inputs: IO[]) => {
                    return [inputs[0].powered == inputs[1].powered];
                }));
                break;
        }
    }

    static async sleep(ms: number) {
        return Promise.resolve(setTimeout(() => { }, ms));   
    }
}

export default Utils;