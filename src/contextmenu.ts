import Utils from "./utilities.js";

export class ContextMenu {
    ctx: CanvasRenderingContext2D;
    x : number;
    y : number;
    items : ContextMenuItem[];

    constructor(ctx: CanvasRenderingContext2D, x : number, y : number, items : ContextMenuItem[]) {
        this.ctx = ctx;
        this.x = x;
        this.y = y;
        this.items = items;
    }

    update() {

    }

    draw() {
        document.getElementById("context")?.remove();
        const context = document.createElement("div");
        context.id = "context";
        context.style.left = this.x + "px";
        context.style.top = this.y + "px";
        
        for (let i = 0; i < this.items.length; i++) {
            const item = this.items[i];
            const button = document.createElement("button");
            button.innerText = item.text;
            button.onclick = () => {
                item.click();
                document.getElementById("context")?.remove();
            }
            context.appendChild(button);
        }

        document.body.appendChild(context);
    }
}

export class ContextMenuItem {
    text : string;
    callback : () => void;

    constructor(text : string, callback : () => void) {
        this.text = text;
        this.callback = callback;
    }

    click() {
        this.callback();
    }
}