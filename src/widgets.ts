import IO from "./io.js";
import Utils from "./utilities.js";

export class Widget {
    parentIO: IO;
    x: number = 0;
    y: number = 0;
    ctx: CanvasRenderingContext2D;
    isOutput: boolean;
    powered: boolean = false;

    constructor(ctx : CanvasRenderingContext2D, parentIO: IO) {
        this.parentIO = parentIO;
        this.ctx = ctx;
        this.isOutput = parentIO.isOutput;
    }

    draw() {
        this.x = this.parentIO.x + (this.isOutput ? -20 : 20);
        this.y = this.parentIO.y;
    }

    click() {}
    on() {}
    off() {}
}

export class ButtonWidget extends Widget {
    draw() {
        super.draw();
        this.ctx.fillStyle = Utils.powerColor(this.powered);
        Utils.circle(this.ctx, this.x, this.y, 8, Utils.powerColor(this.powered));
    }

    click() {
        this.powered = !this.powered;
        this.parentIO.powered = this.powered;
    }

    on() {
        this.powered = true;
        this.parentIO.powered = this.powered;
    }

    off() {
        this.powered = false;
        this.parentIO.powered = this.powered;
    }
}