import Utils from "./utilities.js";
import Node from "./node.js";
import {ContextMenu, ContextMenuItem} from "./contextmenu.js";

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
canvas.width = window.innerWidth;
canvas.height = window.innerHeight - 50;
const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
ctx.fillStyle = Utils.backgroundColor;
ctx.fillRect(0, 0, canvas.width, canvas.height);

async function Update() {
    requestAnimationFrame(Update);
    ctx.fillStyle = Utils.backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = Utils.accentColor;
    for (let i = 0; i < canvas.width + 50; i += 50) {
        for (let j = 0; j < canvas.height + 50; j += 50) {
            ctx.beginPath();
            ctx.arc(i - 25, j - 25, 2, 0, Math.PI * 2, false);
            ctx.fill();
        }
    }

    Utils.inputs = [];
    Utils.outputs = [];
    for (let i = 0; i < Utils.nodes.length; i++) {
        await Utils.nodes[i].update();

        const node = Utils.nodes[i];
        if (node.title == "Input") {
            Utils.inputs.push(node);
        } else if (node.title == "Output") {
            Utils.outputs.push(node);
        }
    }
}
await Update();

canvas.addEventListener("mousemove", function (e) {
    Utils.mouse.x = e.clientX;
    Utils.mouse.y = e.clientY;

    if (Utils.mouse.clicking) {
        Utils.mouse.dragging = true;
    }

    Utils.mouse.hoveringInput = undefined;
    Utils.mouse.hoveringOutput = undefined;
    for (let i = 0; i < Utils.nodes.length; i++) {
        const node = Utils.nodes[i];
        for (let j = 0; j < node.inputs.length; j++) {
            const input = node.inputs[j];
            if (Utils.circleContainsPoint(Utils.mouse.x, Utils.mouse.y, input.x, input.y, 5)) {
                Utils.mouse.hoveringInput = input;
            }
        }
        for (let j = 0; j < node.outputs.length; j++) {
            const output = node.outputs[j];
            if (Utils.circleContainsPoint(Utils.mouse.x, Utils.mouse.y, output.x, output.y, 5)) {
                Utils.mouse.hoveringOutput = output;
            }
        }
    }
});
canvas.addEventListener("mousedown", function (e) {
    if (e.button == 0) Utils.mouse.clicking = true;

    // clear previous selection
    if (Utils.selectedNode) {
        Utils.selectedNode.selected = false;
        Utils.selectedNode = undefined;
    }
    for (let i = 0; i < Utils.nodes.length; i++) {
        const node = Utils.nodes[i];
        if (node.contains(Utils.mouse.x, Utils.mouse.y)) {
            Utils.selectedNode = node;
            node.selected = true;
            if (Utils.debug) Utils.Log(Utils.LogLevel.Debug, `Selected node ${node.title}${node.id ? ` ${node.id} ` : ""}(${node.uuid})`);
            break;
        }
    }
});
canvas.addEventListener("mouseup", function (e) {
    Utils.mouse.clicking = false;
    Utils.mouse.dragging = false;
    Utils.mouse.draggingNode = null;
});
canvas.addEventListener("keydown", function (e) {
    if (e.key == "Delete") {
        if (Utils.selectedNode) {
            Utils.selectedNode.delete();
            Utils.selectedNode = undefined;
        }
    }
});

window.addEventListener("contextmenu", function (e) {
    e.preventDefault();

    new ContextMenu(ctx, Utils.mouse.x, Utils.mouse.y, [
        Utils.addNodeContextMenuItem(ctx),
        Utils.deleteNodeContextMenuItem(ctx),
        Utils.inputContextMenuItem(
            ctx,
            "Rename",
            (text: string) => {
                if (Utils.selectedNode) {
                    Utils.selectedNode.id = text;
                }
            },
            Utils.selectedNode?.title == "Comment" ? 20 : 5
        ),
        new ContextMenuItem(
            document.createElement("button"),
            (e) => {
                Utils.copiedNode = Utils.selectedNode;
                return true;
            },
            "click",
            "Copy"
        ),
        new ContextMenuItem(
            document.createElement("button"),
            (e) => {
                if (Utils.copiedNode) {
                    Utils.nodes.push(new Node(ctx, Utils.copiedNode.settings, Utils.copiedNode.predicate));
                    const newNode = Utils.nodes[Utils.nodes.length - 1];
                    newNode.x = Utils.mouse.x;
                    newNode.y = Utils.mouse.y;
                }
                return true;
            },
            "click",
            "Paste"
        )
    ]).create();
});
window.onresize = function () {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
};

const nodeSelect = document.getElementById("footer") as HTMLDivElement;
for (let i = 0; i < Utils.prebuiltNodes.length; i++) {
    const button = document.createElement("button");
    button.innerText = Utils.prebuiltNodes[i];
    button.addEventListener("click", function (e) {
        Utils.CreateNode(ctx, Utils.prebuiltNodes[i]);
    });
    nodeSelect.appendChild(button);
}

const randomNode = document.getElementById("random") as HTMLButtonElement;
randomNode.addEventListener("click", function (e) {
    Utils.CreateNode(ctx, Utils.prebuiltNodes[Math.floor(Math.random() * Utils.prebuiltNodes.length)]);
});

const generate = document.getElementById("generate") as HTMLButtonElement;
generate.addEventListener("click", async function (e) {
    await Utils.GenerateTruthTable();
});

const hidett = document.getElementById("hide-tt") as HTMLButtonElement;
const copytt = document.getElementById("copy-tt") as HTMLButtonElement;
const truthTable = document.getElementById("truth-table") as HTMLTableElement;
hidett.addEventListener("click", function (e) {
    truthTable.style.display = truthTable.style.display == "none" ? "block" : "none";
    this.innerHTML = truthTable.style.display == "none" ? "Show Truth Table" : "Hide Truth Table";
});
truthTable.style.display = "block";
hidett.innerHTML = "Hide Truth Table";
copytt.addEventListener("click", function (e) {
    const text = Utils.tableToASCII(truthTable);
    navigator.clipboard.writeText(text);
});

const create = document.getElementById("create") as HTMLButtonElement;
create.addEventListener("click", function (e) {
    if (Utils.inputs.length == 0 || Utils.outputs.length == 0) {
        alert("You need at least one input and one output to create a node.");
        return;
    }
    const name = prompt("Name of Node");
    if (name == null) return;
    Utils.CreateCustomNode(ctx, name);
});

const mobileWarning = document.getElementById("mobile-warning") as HTMLDivElement;
if (Utils.mobileAndTabletCheck()) mobileWarning.style.display = "block";

const clear = document.getElementById("clear") as HTMLButtonElement;
clear.addEventListener("click", function (e) {
    Utils.nodes = [];
});

const debug = document.getElementById("debug") as HTMLButtonElement;
debug.addEventListener("change", function (e) {
    Utils.debug = (e.target as HTMLInputElement).checked;
    if (Utils.debug) Utils.Log(Utils.LogLevel.Debug, "Debug mode enabled"); 
});