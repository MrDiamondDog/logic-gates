import Utils from "./utilities.js";

class Tooltip {
    text: string;

    constructor(text: string) {
        this.text = text;
    }

    draw(ctx: CanvasRenderingContext2D, x: number, y: number) {
        const height = Utils.getTextHeight(ctx, this.text) + 20;

        ctx.font = '20px monospace';
        ctx.fillStyle = Utils.accentColor2;
        ctx.fillRect(x, y - height, Utils.getTextWidth(ctx, this.text) + 20, height);
        ctx.fillStyle = Utils.textColor;
        ctx.fillText(this.text, x + 10, y + 30 - height);
    }
}

export default Tooltip;