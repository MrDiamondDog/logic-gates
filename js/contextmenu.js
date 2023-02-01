import Utils from "./utilities.js";
export class ContextMenu {
    constructor(ctx, x, y, items) {
        this.ctx = ctx;
        this.x = x;
        this.y = y;
        this.items = items;
        for (let i = 0; i < this.items.length; i++) {
            this.items[i].parent = this;
        }
    }
    update() {
        var _a;
        if (Utils.mouse.clicking) {
            (_a = document.getElementById("context")) === null || _a === void 0 ? void 0 : _a.remove();
        }
    }
    create() {
        var _a;
        (_a = document.getElementById("context")) === null || _a === void 0 ? void 0 : _a.remove();
        const context = document.createElement("div");
        context.id = "context";
        context.style.left = this.x + "px";
        context.style.top = this.y + "px";
        for (let i = 0; i < this.items.length; i++) {
            const item = this.items[i];
            context.appendChild(item.element);
        }
        document.body.appendChild(context);
        setInterval(this.update, 1000 / 60);
    }
    close() {
        var _a;
        (_a = document.getElementById("context")) === null || _a === void 0 ? void 0 : _a.remove();
    }
}
export class ContextMenuItem {
    constructor(element, callback, eventListener = "click") {
        this.element = element;
        this.callback = callback;
        this.element.addEventListener(eventListener, () => {
            var _a;
            this.callback();
            (_a = this.parent) === null || _a === void 0 ? void 0 : _a.close();
        });
    }
}
