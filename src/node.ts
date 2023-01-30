import IO from './io.js';
import Tooltip from './tooltip.js';
import Utils from './utilities.js';
import { Widget, ButtonWidget } from './widgets.js';

class Node {
    ctx: CanvasRenderingContext2D;
    title: string;
    inputs: IO[];
    outputs: IO[];
    settings: NodeSettings;
    predicate: (inputs : IO[], widgets : Widget[]) => boolean[];
    x: number;
    y: number;
    width: number;
    height: number;
    tooltip: string | undefined;
    selected: boolean = false;
    widgetOptions: NodeWidget[] = [];
    widgets: Widget[] = [];

    constructor(ctx : CanvasRenderingContext2D, settings : NodeSettings, predicate : (inputs : IO[], widgets : Widget[]) => boolean[]) {
        this.ctx = ctx;
        this.settings = settings;
        this.title = settings.title;
        if (settings.inputs[0] instanceof IO) {
            this.inputs = settings.inputs as IO[];
        } 
        else {
            this.inputs = settings.inputs.map((input, i) => new IO(input as string, false, i, this));
        }
        if (settings.outputs[0] instanceof IO) {
            this.outputs = settings.outputs as IO[];
        }
        else {
            this.outputs = settings.outputs.map((output, i) => new IO(output as string, true, i, this));
        }
        this.predicate = predicate;
        this.x = settings.x;
        this.y = settings.y;
        this.tooltip = settings.tooltip;
        this.widgetOptions = settings.widgetOptions || [];

        this.ctx.font = '30px monospace';
        this.width = Utils.getTextWidth(this.ctx, this.title) + 20;
        this.height = Math.max(this.inputs.length * 25, this.outputs.length * 25) + 35;

        this.widgets = this.widgetOptions.map((widget, i) => {
            if (widget.type === 'button') {
                return new ButtonWidget(this.ctx, this.findIO(widget.parentIOName) as IO);
            }
            return new Widget(this.ctx, this.findIO(widget.parentIOName) as IO);
        });
    }

    draw() {
        this.ctx.font = '30px monospace';

        // Draw the node
        this.ctx.fillStyle = Utils.accentColor;
        this.ctx.fillRect(this.x, this.y, this.width, this.height);

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

        for (let i = 0; i < this.widgets.length; i++) {
            this.widgets[i].draw();
        }
    }

    update() {
        const result = this.predicate(this.inputs, this.widgets);

        for (let i = 0; i < this.outputs.length; i++) {
            this.outputs[i].powered = result[i];
            this.outputs[i].update();
        }

        for (let i = 0; i < this.inputs.length; i++) {
            this.inputs[i].update();
        }

        this.draw();

        const hoveringNode = Utils.rectContainsPoint(Utils.mouse.x, Utils.mouse.y, this.x, this.y, this.width, this.height);

        if (!Utils.mouse.draggingNode && !Utils.mouse.draggingIO) {
            for (var i = 0; i < this.widgets.length; i++) {
                if (this.widgets[i] instanceof ButtonWidget) {
                    if (Utils.circleContainsPoint(Utils.mouse.x, Utils.mouse.y, this.widgets[i].x, this.widgets[i].y, 8) && Utils.mouse.clicking){
                        this.widgets[i].click();
                    }
                }   
            }
        }

        // Check if the user is hovering over an input or output
        if (!Utils.mouse.draggingNode) {
            // Draw a tooltip
            let tooltip : Tooltip | undefined;
            if (Utils.mouse.hoveringInput) {
                tooltip = new Tooltip(Utils.mouse.hoveringInput.name);
            }
            else if (Utils.mouse.hoveringOutput) {
                tooltip = new Tooltip(Utils.mouse.hoveringOutput.name);
            }
            else if (this.tooltip && hoveringNode) {
                tooltip = new Tooltip(this.tooltip);
            }

            if (tooltip) {
                tooltip.draw(this.ctx, Utils.mouse.x, Utils.mouse.y);
            }
        }

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

        if (((Utils.mouse.hoveringInput || Utils.mouse.hoveringOutput) || Utils.mouse.draggingIO) && !Utils.mouse.draggingNode) {
            if (Utils.mouse.clicking && !Utils.mouse.draggingIO) {
                Utils.mouse.draggingIO = Utils.mouse.hoveringInput || Utils.mouse.hoveringOutput as IO;
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

    move(x : number, y : number) {
        this.x = x;
        this.y = y;
    }

    contains(x : number, y : number) {
        return Utils.rectContainsPoint(x, y, this.x, this.y, this.width, this.height);
    }

    intersects(x : number, y : number, x2 : number, y2 : number) {
        return Utils.rectIntersectsRect(x, y, x2, y2, this.x, this.y, this.width, this.height);
    }

    findIO(name : string) {
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

interface NodeSettings {
    title: string,
    inputs: string[] | IO[],
    outputs: string[] | IO[],
    widgetOptions?: NodeWidget[],
    x: number,
    y: number,
    tooltip?: string
}

interface NodeWidget {
    type: string,
    parentIOName: string,
}

export default Node;