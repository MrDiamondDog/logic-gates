import Utils from "./utilities.js";
import IO from "./io.js";
import Node from "./node.js";

const canvas = document.getElementById('canvas') as HTMLCanvasElement;
canvas.width = window.innerWidth;
canvas.height = window.innerHeight - 50;
const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
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

    for (let i = 0; i < Utils.nodes.length; i++) {
        Utils.nodes[i].update();
    }

    if (Utils.mouse.selecting) {
        ctx.fillStyle = Utils.selectColor;
        ctx.fillRect(Utils.mouse.dragStart.x, Utils.mouse.dragStart.y, Utils.mouse.x - Utils.mouse.dragStart.x, Utils.mouse.y - Utils.mouse.dragStart.y);
    }
}
Update();

function GenerateTruthTable(){
    const inputs : Node[] = [];
    const outputs : Node[] = [];
    for (let i = 0; i < Utils.nodes.length; i++) {
        const node = Utils.nodes[i];
        if (node.title == "Input") {
            inputs.push(node);
        }
        else if (node.title == "Output") {
            outputs.push(node);
        }
    }

    console.log("Inputs", inputs.length, "Outputs", outputs.length)

    const truthTable : boolean[][] = [];
    for (let i = 0; i < inputs.length; i++) {
        inputs[i].widgets[0].off();
    }

    for (let i = 0; i < Utils.nodes.length; i++) {
        const node = Utils.nodes[i];
        node.update();
    }

    // go through all combinations of inputs on/off and get the outputs
    for (let i = 0; i < Math.pow(2, inputs.length); i++) {
        const row : boolean[] = [];
        
        // set the inputs, powered or not
        for (let j = 0; j < inputs.length; j++) {
            const input = inputs[j];
            const powered = (i & (1 << j)) != 0;
            if (powered) input.widgets[0].on();
            else input.widgets[0].off();
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

        for (let j = 0; j < inputs.length; j++) {
            const input = inputs[j];
            row.push(input.widgets[0].powered);
        }

        for (let j = 0; j < outputs.length; j++) {
            const output = outputs[j];
            row.push(output.inputs[0].powered);
        }

        truthTable.push(row);
    }

    const outputTable = document.getElementById("truth-table") as HTMLTableElement;
    outputTable.innerHTML = "";

    const header = document.createElement("tr");
    for (let i = 0; i < inputs.length; i++) {
        const td = document.createElement("td");
        td.innerText = Utils.letters[i];
        header.appendChild(td);
    }
    for (let i = 0; i < outputs.length; i++) {
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
        if (Utils.mouse.selecting) return;
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
                Utils.nodes.splice(i, 1);
                Utils.nodes.unshift(node);
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
            if (node.intersects(Utils.mouse.dragStart.x, Utils.mouse.dragStart.y, Utils.mouse.x, Utils.mouse.y) || node.intersects(Utils.mouse.x, Utils.mouse.y, Utils.mouse.dragStart.x, Utils.mouse.dragStart.y)) {
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
});
window.onresize = function () {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

const nodeSelect = document.getElementById("footer") as HTMLDivElement;
for (let i = 0; i < Utils.prebuiltNodes.length; i++) {
    const button = document.createElement("button");
    button.innerText = Utils.prebuiltNodes[i];
    button.addEventListener('click', function (e) {
        Utils.CreateNode(ctx, Utils.prebuiltNodes[i]);
    });
    nodeSelect.appendChild(button);
}

const generate = document.getElementById("generate") as HTMLButtonElement;
generate.addEventListener('click', function (e) {
    GenerateTruthTable();
});

const hidett = document.getElementById("hide-tt") as HTMLButtonElement;
hidett.addEventListener('click', function (e) {
    const truthTable = document.getElementById("truth-table") as HTMLDivElement;
    truthTable.style.display = truthTable.style.display == "none" ? "block" : "none";
    this.innerHTML = truthTable.style.display == "none" ? "Show Truth Table" : "Hide Truth Table";
});