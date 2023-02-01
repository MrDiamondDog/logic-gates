import Node from "./node.js";
import IO from "./io.js";
import { ContextMenu, ContextMenuItem } from "./contextmenu.js";
import { ButtonWidget, Widget } from "./widgets.js";

class Utils {
    static letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ ";

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

    static contextMenu: ContextMenu | undefined = undefined;

    static selectedNode: Node | undefined = undefined;

    static prebuiltNodes = ["input", "output", "or", "nor", "xor", "and", "xnor", "nand", "not", "comment"];

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
        clicking: false,
    }

    static addNodeContextMenuItem(ctx: CanvasRenderingContext2D){
        const select = document.createElement("select");
        const placeHolder = document.createElement("option");
        placeHolder.innerText = "New Node";
        select.appendChild(placeHolder);
        for (let i = 0; i < Utils.prebuiltNodes.length; i++) {
            const option = document.createElement("option");
            option.value = Utils.prebuiltNodes[i];
            option.innerText = Utils.prebuiltNodes[i];
            select.appendChild(option);
        }

        const item = new ContextMenuItem(select, () => {
            this.CreateNode(ctx, select.value, this.mouse.x, this.mouse.y)
            return true;
        }, "change");
        return item;
    }

    static deleteNodeContextMenuItem(ctx: CanvasRenderingContext2D){
        const element = document.createElement("button");
        element.innerHTML = "Delete"
        
        const item = new ContextMenuItem(element, () => {
            this.selectedNode?.delete();
            return true;
        });
        return item;
    }

    static inputContextMenuItem(ctx: CanvasRenderingContext2D, placeholder: string, callback: (value: string) => void, charLimit: number = 10){
        const input = document.createElement("input");
        input.placeholder = placeholder;
        input.type = "text";
        input.maxLength = charLimit;
        const item = new ContextMenuItem(input, (e) => {
            if (e[0].key != "Enter") return false;
            callback(input.value)
            return true;
        }, "keydown");
        return item;
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

    static GetEmptySpace(ctx: CanvasRenderingContext2D) {
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

    static CreateCustomNode(ctx: CanvasRenderingContext2D, name: string, deleteAll: boolean = true, nodes: Node[] | undefined = undefined) {
        let { x, y } = this.GetEmptySpace(ctx);
        let cache = this.nodes as Node[];
        if (deleteAll) this.nodes = [];

        var inputs: Node[] = [];
        var outputs: Node[] = [];
        if (nodes) {
            for (var i = 0; i < nodes.length; i++) {
                if (nodes[i].title == "Input") inputs.push(nodes[i]);
                else if (nodes[i].title == "Output") outputs.push(nodes[i]);
            }
        }

        const newNode = (nodes) ? new Node(ctx, {
            title: name,
            inputs: inputs.map((input) => input.id as string),
            outputs: outputs.map((output) => output.id as string),
            x: x,
            y: y,
            tooltip: "A custom node.",
            isCustom: true,
            customNodes: nodes
        }) : new Node(ctx, {
            title: name,
            inputs: this.inputs.map((input) => input.id as string),
            outputs: this.outputs.map((output) => output.id as string),
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

    // thanks chatgpt
    static tableToASCII(table: HTMLTableElement): string {
        const rows = table.rows.length;
        const columns = table.rows[0].cells.length;
        const data: string[][] = [];
      
        for (let i = 0; i < rows; i++) {
          data[i] = [];
          for (let j = 0; j < columns; j++) {
            data[i][j] = table.rows[i].cells[j].innerHTML;
          }
        }
      
        let result = "";
      
        // Find the maximum length of each column
        const colWidths = Array(columns).fill(0);
        for (const row of data) {
          for (let i = 0; i < row.length; i++) {
            colWidths[i] = Math.max(colWidths[i], row[i].length);
          }
        }
      
        // Create the top border
        result += "+";
        for (const width of colWidths) {
          result += "-".repeat(width + 2) + "+";
        }
        result += "\n";
      
        // Create the header
        result += "|";
        for (let i = 0; i < data[0].length; i++) {
          result += " " + data[0][i].padEnd(colWidths[i]) + " |";
        }
        result += "\n";
      
        // Create the separator between the header and the content
        result += "+";
        for (const width of colWidths) {
          result += "-".repeat(width + 2) + "+";
        }
        result += "\n";
      
        // Create the table contents
        for (let i = 1; i < data.length; i++) {
          result += "|";
          for (let j = 0; j < data[i].length; j++) {
            result += " " + data[i][j].padEnd(colWidths[j]) + " |";
          }
          result += "\n";
        }
      
        // Create the bottom border
        result += "+";
        for (const width of colWidths) {
          result += "-".repeat(width + 2) + "+";
        }
        result += "\n";
      
        return result;
      }

    static CreateNode(ctx: CanvasRenderingContext2D, name: string, x: number | undefined = undefined, y: number | undefined = undefined) {
        if (!x || !y) {
            x = this.GetEmptySpace(ctx).x;
            y = this.GetEmptySpace(ctx).y;
        }
        let id = this.letters[(name == "input") ? this.inputs.length : (name == "output") ? this.outputs.length + 13 : 26];

        switch (name) {
            case "or":
                this.nodes.push(new Node(ctx, {
                    title: 'OR',
                    inputs: ["A", "B"],
                    outputs: ["C"],
                    x: x,
                    y: y,
                    tooltip: "Outputs true if either input is true.",
                    id: id
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
                    tooltip: "Outputs true if both inputs are true.",
                    id: id
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
                    tooltip: "Outputs true if the input is false.",
                    id: id
                }, (inputs: IO[]) => {
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
                }, (inputs: IO[], widgets: Widget[]) => {
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
                    tooltip: "Outputs true if one input is true and the other is false.",
                    id: id
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
                    tooltip: "Outputs true if both inputs are false.",
                    id: id
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
                    tooltip: "Outputs true if both inputs are false.",
                    id: id
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
                    tooltip: "Outputs true if both inputs are the same.",
                    id: id
                }, (inputs: IO[]) => {
                    return [inputs[0].powered == inputs[1].powered];
                }));
                break;
            case "comment":
                this.nodes.push(new Node(ctx, {
                    title: 'Comment',
                    inputs: ["A"],
                    outputs: ["B"],
                    x: x,
                    y: y,
                    tooltip: "Outputs true if the input is true.",
                    id: id
                }, (inputs: IO[], widgets: Widget[]) => {
                    return [inputs[0].powered];
                }));
        }
    }

    static async sleep(ms: number) {
        return Promise.resolve(setTimeout(() => { }, ms));
    }

    static mobileAndTabletCheck = function () {
        let check = false;
        (function (a) { if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true; })(navigator.userAgent || navigator.vendor);
        return check;
    };
}

export default Utils;