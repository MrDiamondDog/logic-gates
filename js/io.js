import Utils from "./utilities.js";
class IO {
    /**
     * Creates a new Port
     * @param name Name of the port
     * @param isOutput Is the port an output
     * @param index Index of the port
     * @param parentNode ID of the parent node
     */
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
        this.uuid = crypto.randomUUID();
        this.allowMultipleConnections = isOutput;
    }
    getParentNode() {
        return Utils.GetNodeByUUID(this.parentNode);
    }
    checkPower() {
        for (let i = 0; i < this.connections.length; i++) {
            const connection = Utils.GetIOByUUID(this.connections[i]);
            connection.powered = this.powered;
        }
        if (this.isOutput)
            return;
        else {
            this.powered = false;
            for (let i = 0; i < this.backwardConnections.length; i++) {
                if (Utils.GetIOByUUID(this.backwardConnections[i]).powered) {
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
            const connection = Utils.GetIOByUUID(this.connections[i]);
            Utils.line(ctx, connection.x, connection.y, this.x, this.y, Utils.powerColor(this.powered));
        }
    }
    canConnect(io) {
        return (this.isOutput &&
            !io.isOutput &&
            io.backwardConnections.length == 0 &&
            (this.allowMultipleConnections || this.connections.length == 0) &&
            (io.allowMultipleConnections || io.connections.length == 0) &&
            this.parentNode != io.parentNode &&
            io.parentNode != this.parentNode &&
            !this.deleted &&
            !io.deleted &&
            this.uuid != io.uuid);
    }
    connect(io) {
        if (this.canConnect(io)) {
            this.connections.push(io.uuid);
            io.backwardConnections.push(this.uuid);
        }
    }
    delete() {
        Utils.ios.splice(Utils.ios.indexOf(this), 1);
        for (let i = 0; i < this.connections.length; i++) {
            const connection = Utils.GetIOByUUID(this.connections[i]);
            connection.backwardConnections.splice(connection.backwardConnections.indexOf(this.uuid), 1);
        }
        for (let i = 0; i < this.backwardConnections.length; i++) {
            const connection = Utils.GetIOByUUID(this.backwardConnections[i]);
            connection.connections.splice(connection.connections.indexOf(this.uuid), 1);
        }
        this.deleted = true;
    }
}
export default IO;
