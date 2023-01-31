import Utils from "./utilities.js";
export class Widget {
    constructor(ctx, parentIO) {
        this.x = 0;
        this.y = 0;
        this.powered = false;
        this.parentIO = parentIO;
        this.ctx = ctx;
        this.isOutput = parentIO.isOutput;
    }
    draw() {
        this.x = this.parentIO.x + (this.isOutput ? -20 : 20);
        this.y = this.parentIO.y;
    }
    click() { }
    on() { }
    off() { }
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
