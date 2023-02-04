import Utils from "./utilities.js";

class Tooltip {
    text: string;

    constructor(text: string) {
        this.text = text;
    }

    draw(ctx: CanvasRenderingContext2D, x: number, y: number) {
        ctx.font = "20px monospace";
        ctx.fillStyle = Utils.accentColor2;
        ctx.fillRect(x, y - 45, Utils.getTextWidth(ctx, this.text) + 20, 45);
        ctx.fillStyle = Utils.textColor;
        ctx.fillText(this.text, x + 10, y + 30 - 45);
    }
}

export default Tooltip;
