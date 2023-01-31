var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import Node from "./node.js";
class Utils {
    static powerColor(powered) {
        return !powered ? '#84423f' : '#34c13b';
    }
    static getTextWidth(ctx, text) {
        var total = 0;
        for (let i = 0; i < text.length; i++) {
            total += ctx.measureText(text[i]).width;
        }
        return total;
    }
    static getTextHeight(ctx, text) {
        let metrics = ctx.measureText(text);
        let fontHeight = metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent;
        return fontHeight;
    }
    static circle(ctx, x, y, radius, fill) {
        ctx.fillStyle = fill;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2, false);
        ctx.fill();
    }
    static circleContainsPoint(x, y, cx, cy, radius) {
        return Math.sqrt(Math.pow(x - cx, 2) + Math.pow(y - cy, 2)) < radius;
    }
    static rectContainsPoint(x, y, rx, ry, rw, rh) {
        return x >= rx && x <= rx + rw && y >= ry && y <= ry + rh;
    }
    static rectIntersectsRect(x1, y1, w1, h1, x2, y2, w2, h2) {
        return x1 < x2 + w2 && x1 + w1 > x2 && y1 < y2 + h2 && y1 + h1 > y2;
    }
    static bezierLine(ctx, x1, y1, x2, y2, stroke) {
        ctx.strokeStyle = stroke;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.bezierCurveTo(x1 - 50, y1, x2 + 50, y2, x2, y2);
        ctx.stroke();
    }
    static GetEmptySpace(ctx) {
        let x = 100;
        let y = 100;
        let intersects = true;
        while (intersects) {
            intersects = false;
            for (let i = 0; i < this.nodes.length; i++) {
                let node = this.nodes[i];
                if (this.rectIntersectsRect(x, y, 200, 200, node.x, node.y, node.width, node.height)) {
                    intersects = true;
                    y += 50;
                    if (y > ctx.canvas.height - 100) {
                        y = 100;
                        x += 50;
                    }
                    break;
                }
            }
        }
        return { x, y };
    }
    static CreateCustomNode(ctx, name, deleteAll = true, nodes = undefined) {
        let { x, y } = this.GetEmptySpace(ctx);
        let cache = this.nodes;
        if (deleteAll)
            this.nodes = [];
        var inputs = [];
        var outputs = [];
        if (nodes) {
            for (var i = 0; i < nodes.length; i++) {
                if (nodes[i].title == "Input")
                    inputs.push(nodes[i]);
                else if (nodes[i].title == "Output")
                    outputs.push(nodes[i]);
            }
        }
        const newNode = (nodes) ? new Node(ctx, {
            title: name,
            inputs: inputs.map((input) => input.id),
            outputs: outputs.map((output) => output.id),
            x: x,
            y: y,
            tooltip: "A custom node.",
            isCustom: true,
            customNodes: nodes
        }) : new Node(ctx, {
            title: name,
            inputs: this.inputs.map((input) => input.id),
            outputs: this.outputs.map((output) => output.id),
            x: x,
            y: y,
            tooltip: "A custom node.",
            isCustom: true,
            customNodes: cache
        });
        if (nodes) {
            newNode.x = x;
            newNode.y = y;
        }
        this.nodes.push(newNode);
        return newNode;
    }
    static CreateNode(ctx, name, x = undefined, y = undefined) {
        if (!x || !y) {
            x = this.GetEmptySpace(ctx).x;
            y = this.GetEmptySpace(ctx).y;
        }
        let id = this.letters[(name == "input") ? this.inputs.length : (name == "output") ? this.outputs.length + 13 : 26];
        switch (name) {
            case "Random":
                name = this.prebuiltNodes[Math.floor(Math.random() * this.prebuiltNodes.length)];
                this.CreateNode(ctx, name, x, y);
                break;
            case "or":
                this.nodes.push(new Node(ctx, {
                    title: 'OR',
                    inputs: ["A", "B"],
                    outputs: ["C"],
                    x: x,
                    y: y,
                    tooltip: "Outputs true if either input is true.",
                    id: id
                }, (inputs) => {
                    return [inputs[0].powered || inputs[1].powered];
                }));
                break;
            case "and":
                this.nodes.push(new Node(ctx, {
                    title: 'AND',
                    inputs: ["A", "B"],
                    outputs: ["C"],
                    x: x,
                    y: y,
                    tooltip: "Outputs true if both inputs are true.",
                    id: id
                }, (inputs) => {
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
                    tooltip: "Outputs true if the input is false.",
                    id: id
                }, (inputs) => {
                    return [!inputs[0].powered];
                }));
                break;
            case "input":
                if (this.inputs.length > 12) {
                    alert("Input limit reached!");
                    break;
                }
                this.nodes.push(new Node(ctx, {
                    title: 'Input',
                    inputs: [],
                    outputs: ["A"],
                    x: x,
                    y: y,
                    tooltip: "Outputs true if the input is true.",
                    widgetOptions: [{ type: "button", parentIOName: "A" }],
                    id: id
                }, (inputs, widgets) => {
                    return [widgets[0].powered];
                }));
                break;
            case "output":
                if (this.outputs.length > 12) {
                    alert("Output limit reached!");
                    break;
                }
                this.nodes.push(new Node(ctx, {
                    title: 'Output',
                    inputs: ["A"],
                    outputs: [],
                    x: x,
                    y: y,
                    tooltip: "Outputs true if the input is true.",
                    id: id
                }, (inputs) => {
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
                    tooltip: "Outputs true if one input is true and the other is false.",
                    id: id
                }, (inputs) => {
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
                    tooltip: "Outputs true if both inputs are false.",
                    id: id
                }, (inputs) => {
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
                    tooltip: "Outputs true if both inputs are false.",
                    id: id
                }, (inputs) => {
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
                    tooltip: "Outputs true if both inputs are the same.",
                    id: id
                }, (inputs) => {
                    return [inputs[0].powered == inputs[1].powered];
                }));
                break;
        }
    }
    static sleep(ms) {
        return __awaiter(this, void 0, void 0, function* () {
            return Promise.resolve(setTimeout(() => { }, ms));
        });
    }
}
Utils.letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ ";
Utils.backgroundColor = '#212d38';
Utils.accentColor = '#2f3e4e';
Utils.accentColor2 = '#3f4e5e';
Utils.highlightColor = '#2d5b8a';
Utils.selectColor = 'rgba(4, 122, 239, 0.25)';
Utils.textColor = '#ffffff';
Utils.footerTextColor = '#909090';
Utils.nodes = [];
Utils.inputs = [];
Utils.outputs = [];
Utils.contextMenu = undefined;
Utils.selectedNode = undefined;
Utils.selectedNodes = [];
Utils.selectingMultiple = false;
Utils.prebuiltNodes = ["Random", "input", "output", "or", "nor", "xor", "and", "xnor", "nand", "not"];
Utils.mouse = {
    x: 0,
    y: 0,
    dragging: false,
    draggingNode: null,
    draggingIO: undefined,
    hoveringInput: undefined,
    hoveringOutput: undefined,
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
};
export default Utils;
