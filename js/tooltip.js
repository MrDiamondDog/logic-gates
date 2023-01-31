import Utils from "./utilities.js";
class Tooltip {
    constructor(text) {
        this.text = text;
    }
    draw(ctx, x, y) {
        const height = Utils.getTextHeight(ctx, this.text) + 5;
        ctx.font = '20px monospace';
        ctx.fillStyle = Utils.accentColor2;
        ctx.fillRect(x, y - height, Utils.getTextWidth(ctx, this.text) + 20, height);
        ctx.fillStyle = Utils.textColor;
        ctx.fillText(this.text, x + 10, y + 30 - height);
    }
}
export default Tooltip;
