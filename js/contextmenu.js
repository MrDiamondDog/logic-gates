export class ContextMenu {
    constructor(ctx, x, y, items) {
        this.ctx = ctx;
        this.x = x;
        this.y = y;
        this.items = items;
    }
    update() {
    }
    draw() {
        var _a;
        (_a = document.getElementById("context")) === null || _a === void 0 ? void 0 : _a.remove();
        const context = document.createElement("div");
        context.id = "context";
        context.style.left = this.x + "px";
        context.style.top = this.y + "px";
        for (let i = 0; i < this.items.length; i++) {
            const item = this.items[i];
            const button = document.createElement("button");
            button.innerText = item.text;
            button.onclick = () => {
                var _a;
                item.click();
                (_a = document.getElementById("context")) === null || _a === void 0 ? void 0 : _a.remove();
            };
            context.appendChild(button);
        }
        document.body.appendChild(context);
    }
}
export class ContextMenuItem {
    constructor(text, callback) {
        this.text = text;
        this.callback = callback;
    }
    click() {
        this.callback();
    }
}
