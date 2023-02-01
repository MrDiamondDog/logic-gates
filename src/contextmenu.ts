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

        for (let i = 0; i < this.items.length; i++) {
            this.items[i].parent = this;
        }
    }

    update() {
        if (Utils.mouse.clicking) {
            document.getElementById("context")?.remove();
        }
    }

    create() {
        document.getElementById("context")?.remove();
        const context = document.createElement("div");
        context.id = "context";
        context.style.left = this.x + "px";
        context.style.top = this.y + "px";
        
        for (let i = 0; i < this.items.length; i++) {
            const item = this.items[i];
            context.appendChild(item.element);
        }

        document.body.appendChild(context);

        setInterval(this.update, 1000 / 60)
    }

    close() {
        document.getElementById("context")?.remove();
    }
}

export class ContextMenuItem {
    element : HTMLElement;
    callback : (...params : any) => boolean;
    parent: ContextMenu | undefined;

    constructor(element : HTMLElement, callback : (...params: any) => boolean, eventListener: string = "click") {
        this.element = element;
        this.callback = callback;
        this.element.addEventListener(eventListener, (...params) => { 
            const result: boolean = this.callback(params);
            if (result) this.parent?.close();
        });
    }
}