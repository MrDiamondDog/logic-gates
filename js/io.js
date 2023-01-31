import Utils from "./utilities.js";
class IO {
    constructor(name, isOutput, index, parentNode) {
        this.powered = false;
        this.x = 0;
        this.y = 0;
        this.deleted = false;
        this.connections = [];
        this.backwardConnections = []; // connections that go backward and should not be displayed
        this.name = name;
        this.isOutput = isOutput;
        this.index = index;
        this.parentNode = parentNode;
        this.allowMultipleConnections = isOutput;
    }
    checkPower() {
        if (this.isOutput)
            return;
        else {
            this.powered = false;
            for (let i = 0; i < this.backwardConnections.length; i++) {
                if (this.backwardConnections[i].powered) {
                    this.powered = true;
                    break;
                }
            }
        }
    }
    update() {
        this.checkPower();
    }
    draw(ctx, x, y) {
        this.x = x;
        this.y = y + 45 + this.index * 25;
        Utils.circle(ctx, this.x, this.y, 5, Utils.powerColor(this.powered));
        for (let i = 0; i < this.connections.length; i++) {
            Utils.bezierLine(ctx, this.connections[i].x, this.connections[i].y, this.x, this.y, Utils.powerColor(this.powered));
            this.connections[i].powered = this.powered;
        }
    }
    canConnect(io) {
        return this.isOutput != io.isOutput && (this.allowMultipleConnections || this.connections.length == 0) && (io.allowMultipleConnections || io.connections.length == 0) && this.parentNode != io.parentNode && io.parentNode != this.parentNode;
    }
    connect(io) {
        if (this.canConnect(io)) {
            this.connections.push(io);
            io.backwardConnections.push(this);
        }
    }
    delete() {
        for (let i = 0; i < this.connections.length; i++) {
            this.connections[i].backwardConnections.splice(this.connections[i].backwardConnections.indexOf(this), 1);
        }
        for (let i = 0; i < this.backwardConnections.length; i++) {
            this.backwardConnections[i].connections.splice(this.backwardConnections[i].connections.indexOf(this), 1);
        }
        this.deleted = true;
    }
}
export default IO;