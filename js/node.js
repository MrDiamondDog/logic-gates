import IO from "./io.js";
import Tooltip from "./tooltip.js";
import Utils from "./utilities.js";
import { Widget, ButtonWidget } from "./widgets.js";
class Node {
    constructor(ctx, settings, predicate = undefined) {
        this.selected = false;
        this.widgetOptions = [];
        this.widgets = [];
        this.isCustom = false;
        this.customNodes = [];
        this.ctx = ctx;
        this.settings = settings;
        this.title = settings.title;
        this.uuid = crypto.randomUUID();
        if (settings.inputs[0] instanceof IO) {
            this.inputs = settings.inputs;
        }
        else {
            this.inputs = settings.inputs.map((input, i) => new IO(input, false, i, this.uuid));
        }
        if (settings.outputs[0] instanceof IO) {
            this.outputs = settings.outputs;
        }
        else {
            this.outputs = settings.outputs.map((output, i) => new IO(output, true, i, this.uuid));
        }
        this.isCustom = settings.isCustom || settings.customNodes !== undefined;
        this.customNodes = settings.customNodes || [];
        this.predicate = predicate || undefined;
        this.x = settings.x;
        this.y = settings.y;
        this.tooltip = settings.tooltip;
        this.widgetOptions = settings.widgetOptions || [];
        this.id = settings.id || undefined;
        this.ctx.font = "30px monospace";
        this.width = Utils.getTextWidth(this.ctx, this.title) + 20;
        this.height = Math.max(this.inputs.length * 25, this.outputs.length * 25) + 35;
        this.widgets = this.widgetOptions.map((widget, i) => {
            if (widget.type === "button") {
                return new ButtonWidget(this.ctx, this.findIO(widget.parentIOName));
            }
            return new Widget(this.ctx, this.findIO(widget.parentIOName));
        });
        Utils.ios.push(...this.inputs);
        Utils.ios.push(...this.outputs);
    }
    draw() {
        this.ctx.font = "30px monospace";
        // Draw the node
        this.ctx.fillStyle = Utils.accentColor;
        this.ctx.fillRect(this.x, this.y, this.width, this.height);
        // Draw the outline if selected
        if (this.selected) {
            this.ctx.strokeStyle = Utils.highlightColor;
            this.ctx.lineWidth = 3;
            this.ctx.strokeRect(this.x, this.y, this.width, this.height);
        }
        // Draw the title
        this.ctx.fillStyle = Utils.textColor;
        this.ctx.fillText(this.title, this.x + 10, this.y + 30);
        // Draw the inputs
        for (let i = 0; i < this.inputs.length; i++) {
            this.inputs[i].draw(this.ctx, this.x, this.y);
        }
        // Draw the outputs
        for (let i = 0; i < this.outputs.length; i++) {
            this.outputs[i].draw(this.ctx, this.x + this.width, this.y);
        }
        // Draw the widgets
        for (let i = 0; i < this.widgets.length; i++) {
            this.widgets[i].draw();
        }
        this.ctx.font = "15px monospace";
        this.ctx.fillStyle = Utils.footerTextColor;
        if (this.id)
            this.ctx.fillText(this.id, this.x + this.width / 2 - Utils.getTextWidth(this.ctx, this.id) / 2, this.y + this.height - 7);
    }
    update(notCustom = true) {
        if (this.predicate) {
            const result = this.predicate(this.inputs, this.widgets);
            for (let i = 0; i < this.outputs.length; i++) {
                this.outputs[i].powered = result[i];
                this.outputs[i].update();
            }
            for (let i = 0; i < this.inputs.length; i++) {
                this.inputs[i].update();
            }
        }
        if (this.isCustom) {
            let innerInputs = [];
            let innerOutputs = [];
            for (let i = 0; i < this.customNodes.length; i++) {
                if (this.customNodes[i].title == "Input") {
                    innerInputs.push(this.customNodes[i]);
                }
                else if (this.customNodes[i].title == "Output") {
                    innerOutputs.push(this.customNodes[i]);
                }
            }
            for (let i = 0; i < innerInputs.length; i++) {
                innerInputs[i].widgets[0].setPowered(this.inputs[i].powered);
            }
            for (let i = 0; i < this.customNodes.length; i++) {
                this.customNodes[i].update(false); //
            }
            for (let i = 0; i < this.outputs.length; i++) {
                this.outputs[i].powered = innerOutputs[i].inputs[0].powered;
            }
            // make sure nested custom nodes are updated
            for (let i = 0; i < this.customNodes.length; i++) {
                this.customNodes[i].update(false); //
            }
        }
        for (let i = 0; i < this.inputs.length; i++) {
            this.inputs[i].update();
        }
        for (let i = 0; i < this.outputs.length; i++) {
            this.outputs[i].update();
        }
        if (notCustom) {
            this.draw();
            const hoveringNode = Utils.rectContainsPoint(Utils.mouse.x, Utils.mouse.y, this.x, this.y, this.width, this.height);
            // Widget logic
            if (!Utils.mouse.draggingNode && !Utils.mouse.draggingIO) {
                for (var i = 0; i < this.widgets.length; i++) {
                    if (this.widgets[i] instanceof ButtonWidget) {
                        if (Utils.circleContainsPoint(Utils.mouse.x, Utils.mouse.y, this.widgets[i].x, this.widgets[i].y, 8) && Utils.mouse.clicking) {
                            this.widgets[i].setPowered(!this.widgets[i].powered);
                        }
                    }
                }
            }
            // Tool tip logic
            if (!Utils.mouse.draggingNode) {
                let tooltip;
                if (Utils.mouse.hoveringInput) {
                    tooltip = new Tooltip(Utils.mouse.hoveringInput.name);
                }
                else if (Utils.mouse.hoveringOutput) {
                    tooltip = new Tooltip(Utils.mouse.hoveringOutput.name);
                }
                else if (this.tooltip && hoveringNode) {
                    // tooltip = new Tooltip(this.tooltip);
                }
                if (tooltip) {
                    tooltip.draw(this.ctx, Utils.mouse.x, Utils.mouse.y);
                }
            }
            // Dragging node logic
            if (!Utils.mouse.hoveringInput && !Utils.mouse.hoveringOutput && !Utils.mouse.draggingIO) {
                // Dragging logic
                if (hoveringNode && Utils.mouse.clicking && !Utils.mouse.draggingNode) {
                    Utils.mouse.draggingNode = this;
                    Utils.mouse.dragOffset = { x: Utils.mouse.x - this.x, y: Utils.mouse.y - this.y };
                }
                if (Utils.mouse.draggingNode === this) {
                    this.move(Utils.mouse.x - Utils.mouse.dragOffset.x, Utils.mouse.y - Utils.mouse.dragOffset.y);
                }
            }
            // Dragging IO Logic
            if ((Utils.mouse.hoveringInput || Utils.mouse.hoveringOutput || Utils.mouse.draggingIO) && !Utils.mouse.draggingNode) {
                if (Utils.mouse.clicking && !Utils.mouse.draggingIO) {
                    Utils.mouse.draggingIO = Utils.mouse.hoveringInput || Utils.mouse.hoveringOutput;
                }
                if (Utils.mouse.draggingIO) {
                    Utils.bezierLine(this.ctx, Utils.mouse.x, Utils.mouse.y, Utils.mouse.draggingIO.x, Utils.mouse.draggingIO.y, Utils.textColor);
                }
                if (!Utils.mouse.clicking && Utils.mouse.draggingIO) {
                    if (Utils.mouse.hoveringInput) {
                        Utils.mouse.draggingIO.connect(Utils.mouse.hoveringInput);
                    }
                    else if (Utils.mouse.hoveringOutput) {
                        Utils.mouse.hoveringOutput.connect(Utils.mouse.draggingIO);
                    }
                    Utils.mouse.draggingIO = undefined;
                }
            }
        }
    }
    move(x, y) {
        this.x = x;
        this.y = y;
    }
    contains(x, y) {
        return Utils.rectContainsPoint(x, y, this.x, this.y, this.width, this.height);
    }
    intersects(x, y, x2, y2) {
        return Utils.rectIntersectsRect(x, y, x2, y2, this.x, this.y, this.width, this.height);
    }
    findIO(name) {
        for (let i = 0; i < this.inputs.length; i++) {
            if (this.inputs[i].name === name) {
                return this.inputs[i];
            }
        }
        for (let i = 0; i < this.outputs.length; i++) {
            if (this.outputs[i].name === name) {
                return this.outputs[i];
            }
        }
        return undefined;
    }
    delete() {
        for (let i = 0; i < this.inputs.length; i++) {
            this.inputs[i].delete();
        }
        for (let i = 0; i < this.outputs.length; i++) {
            this.outputs[i].delete();
        }
        Utils.nodes.splice(Utils.nodes.indexOf(this), 1);
    }
}
export default Node;
