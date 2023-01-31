import Utils from "./utilities.js";
import { ContextMenu, ContextMenuItem } from "./contextmenu.js";
const canvas = document.getElementById('canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight - 50;
const ctx = canvas.getContext('2d');
ctx.fillStyle = Utils.backgroundColor;
ctx.fillRect(0, 0, canvas.width, canvas.height);
function Update() {
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
        Utils.nodes[i].update();
        const node = Utils.nodes[i];
        if (node.title == "Input") {
            Utils.inputs.push(node);
        }
        else if (node.title == "Output") {
            Utils.outputs.push(node);
        }
    }
    if (Utils.mouse.selecting) {
        ctx.fillStyle = Utils.selectColor;
        ctx.fillRect(Utils.mouse.dragStart.x, Utils.mouse.dragStart.y, Utils.mouse.x - Utils.mouse.dragStart.x, Utils.mouse.y - Utils.mouse.dragStart.y);
    }
    if (Utils.contextMenu) {
        Utils.contextMenu.update();
    }
}
Update();
function GenerateTruthTable() {
    const truthTable = [];
    for (let i = 0; i < Utils.inputs.length; i++) {
        Utils.inputs[i].widgets[0].setPowered(false);
    }
    for (let i = 0; i < Utils.nodes.length; i++) {
        const node = Utils.nodes[i];
        node.update();
    }
    for (let i = 0; i < Utils.nodes.length; i++) {
        const node = Utils.nodes[i];
        node.update();
    }
    // go through all combinations of inputs on/off and get the outputs
    for (let i = 0; i < Math.pow(2, Utils.inputs.length); i++) {
        const row = [];
        // set the inputs, powered or not
        for (let j = 0; j < Utils.inputs.length; j++) {
            const input = Utils.inputs[j];
            const powered = (i & (1 << j)) != 0;
            if (powered)
                input.widgets[0].setPowered(true);
            else
                input.widgets[0].setPowered(false);
        }
        // update the nodes
        for (let j = 0; j < Utils.nodes.length; j++) {
            const node = Utils.nodes[j];
            node.update();
        }
        for (let j = 0; j < Utils.nodes.length; j++) {
            const node = Utils.nodes[j];
            node.update();
        }
        for (let j = 0; j < Utils.inputs.length; j++) {
            const input = Utils.inputs[j];
            row.push(input.widgets[0].powered);
        }
        for (let j = 0; j < Utils.outputs.length; j++) {
            const output = Utils.outputs[j];
            row.push(output.inputs[0].powered);
        }
        truthTable.push(row);
    }
    const outputTable = document.getElementById("truth-table");
    outputTable.innerHTML = "";
    const header = document.createElement("tr");
    for (let i = 0; i < Utils.inputs.length; i++) {
        const td = document.createElement("td");
        td.innerText = Utils.letters[i];
        header.appendChild(td);
    }
    for (let i = 0; i < Utils.outputs.length; i++) {
        const td = document.createElement("td");
        td.innerText = Utils.letters[i + 16];
        header.appendChild(td);
    }
    outputTable.appendChild(header);
    for (let i = 0; i < truthTable.length; i++) {
        const row = truthTable[i];
        const tr = document.createElement("tr");
        for (let j = 0; j < row.length; j++) {
            const td = document.createElement("td");
            td.innerText = row[j] ? "1" : "0";
            td.className = row[j] ? "tt-1" : "tt-0";
            tr.appendChild(td);
        }
        outputTable.appendChild(tr);
    }
    outputTable.style.display = "block";
    hidett.innerHTML = "Hide Truth Table";
    const parent = outputTable.parentNode;
    parent.style.display = "block";
}
canvas.addEventListener('mousemove', function (e) {
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
canvas.addEventListener('mousedown', function (e) {
    if (e.button == 2) {
        if (Utils.mouse.selecting)
            return;
        Utils.mouse.dragStart.x = Utils.mouse.x;
        Utils.mouse.dragStart.y = Utils.mouse.y;
        Utils.mouse.selecting = true;
    }
    else if (Utils.selectingMultiple) {
        Utils.selectingMultiple = false;
        for (let i = 0; i < Utils.selectedNodes.length; i++) {
            Utils.selectedNodes[i].selected = false;
        }
        Utils.selectedNodes = [];
    }
    else {
        Utils.mouse.clicking = true;
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
                break;
            }
        }
    }
});
canvas.addEventListener('mouseup', function (e) {
    Utils.mouse.clicking = false;
    Utils.mouse.dragging = false;
    Utils.mouse.draggingNode = null;
    if (Utils.mouse.selecting) {
        Utils.mouse.selecting = false;
        for (let i = 0; i < Utils.nodes.length; i++) {
            const node = Utils.nodes[i];
            if (node.intersects(Utils.mouse.dragStart.x, Utils.mouse.dragStart.y, Utils.mouse.x, Utils.mouse.y) || node.intersects(Utils.mouse.x, Utils.mouse.y, Utils.mouse.dragStart.x, Utils.mouse.dragStart.y) || node.intersects(Utils.mouse.dragStart.x, Utils.mouse.y, Utils.mouse.x, Utils.mouse.dragStart.y) || node.intersects(Utils.mouse.x, Utils.mouse.dragStart.y, Utils.mouse.dragStart.x, Utils.mouse.y)) {
                node.selected = true;
                Utils.selectedNodes.push(node);
                Utils.selectingMultiple = true;
            }
        }
    }
});
canvas.addEventListener('keydown', function (e) {
    if (e.key == "Delete") {
        if (Utils.selectingMultiple) {
            for (let i = 0; i < Utils.selectedNodes.length; i++) {
                Utils.selectedNodes[i].delete();
            }
            Utils.selectedNodes = [];
            Utils.selectingMultiple = false;
        }
        else if (Utils.selectedNode) {
            Utils.selectedNode.delete();
            Utils.selectedNode = undefined;
        }
    }
});
window.addEventListener('contextmenu', function (e) {
    e.preventDefault();
    Utils.contextMenu = new ContextMenu(ctx, Utils.mouse.x, Utils.mouse.y, [
        new ContextMenuItem("AND", function () {
            Utils.CreateNode(ctx, "AND", Utils.mouse.x, Utils.mouse.y);
        }),
    ]);
});
window.onresize = function () {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
};
const nodeSelect = document.getElementById("footer");
for (let i = 0; i < Utils.prebuiltNodes.length; i++) {
    const button = document.createElement("button");
    button.innerText = Utils.prebuiltNodes[i];
    button.addEventListener('click', function (e) {
        Utils.CreateNode(ctx, Utils.prebuiltNodes[i]);
    });
    nodeSelect.appendChild(button);
}
const generate = document.getElementById("generate");
generate.addEventListener('click', function (e) {
    GenerateTruthTable();
});
const hidett = document.getElementById("hide-tt");
const truthTable = document.getElementById("truth-table");
hidett.addEventListener('click', function (e) {
    truthTable.style.display = truthTable.style.display == "none" ? "block" : "none";
    this.innerHTML = truthTable.style.display == "none" ? "Show Truth Table" : "Hide Truth Table";
});
truthTable.style.display = "block";
hidett.innerHTML = "Hide Truth Table";
const create = document.getElementById("create");
create.addEventListener('click', function (e) {
    const name = prompt("Name of Node");
    if (name == null)
        return;
    Utils.CreateCustomNode(ctx, name);
});
