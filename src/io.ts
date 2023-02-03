import Utils from "./utilities.js";
import Node from "./node.js";

class IO {
    name: string;
    isOutput: boolean;
    index: number;
    powered: boolean = false;
    x: number = 0;
    y: number = 0;
    parentNode: string;
    deleted: boolean = false;
    uuid: string;

    connections: string[] = [];
    backwardConnections: string[] = []; // connections that go backward and should not be displayed
    allowMultipleConnections: boolean;

    /**
     * Creates a new Port
     * @param name Name of the port
     * @param isOutput Is the port an output
     * @param index Index of the port
     * @param parentNode ID of the parent node
     */
    constructor(name: string, isOutput: boolean, index: number, parentNode: string) {
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

        if (this.isOutput) return;
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

    draw(ctx: CanvasRenderingContext2D, x: number, y: number) {
        this.x = x;
        this.y = y + 45 + this.index * 25;
        Utils.circle(ctx, this.x, this.y, 5, Utils.powerColor(this.powered));

        for (let i = 0; i < this.connections.length; i++) {
            const connection = Utils.GetIOByUUID(this.connections[i]);
            Utils.line(ctx, connection.x, connection.y, this.x, this.y, Utils.powerColor(this.powered));
        }
    }

    canConnect(io: IO) {
        return (
            this.isOutput &&
            !io.isOutput &&
            io.backwardConnections.length == 0 &&
            (this.allowMultipleConnections || this.connections.length == 0) &&
            (io.allowMultipleConnections || io.connections.length == 0) &&
            this.parentNode != io.parentNode &&
            io.parentNode != this.parentNode &&
            !this.deleted &&
            !io.deleted &&
            this.uuid != io.uuid
        );
    }

    connect(io: IO) {
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
