var logical = draw2d.shape.basic.Rectangle.extend({

    NAME: "LogicalFigure", // required for JSON read/write

    init: function (attr, setter, getter) {
        this._super(attr, setter, getter);
        this.width = 50;
        this.userData = attr;
        if (attr.text != "NOT") {
            this.height = 70;
        } else {
            this.height = 70 - 30;
        }
        this.resizeable = false;
        this.label = new draw2d.shape.basic.Label({
            text: attr.text,
            outlineStroke: 1,
            fontSize: 11
        });
        this.label.padding.top = 5;
        this.label.padding.right = 0;
        this.label.padding.bottom = -20;
        this.label.padding.left = 0;
        this.label.stroke = 0;
        this.add(this.label, new draw2d.layout.locator.TopLocator(this));

        this.installEditPolicy(new draw2d.policy.figure.AntSelectionFeedbackPolicy());

        if (attr.text != "NOT")
            this.createPort("input");
        this.createPort("input");

        this.createPort("output");

        this.inputPorts.each(function (n, el) {
            el.on("connect", hide, el);
            el.on("disconnect", show, el);
        });

        this.addInput = function () {
            this.height += 15;
            var port = this.createPort("input");
            port.on("connect", hide, port);
            port.on("disconnect", show, port);
        }

        this.deleteInput = function () {
            if (this.getPorts().data.length <= 3) return;
            this.height -= 15;
            this.removePort(this.inputPorts.last());
        }

        this.getFreeInputPort = function () {
            var inputPorts = this.getInputPorts().data;
            for (var i = 0; i < inputPorts.length; i++) {
                if (inputPorts[i].connections.data.length == 0) {
                    return inputPorts[i];
                }
            }
        }

        this.drawConnections = function () {
            var outputPort = this.getOutputPorts().data[0];
            if (outputPort) {
                var connections = outputPort.connections.data;
                for (var i = 0; i < connections.length; i++) {
                    canvas.add(connections[i]);
                }
            }
        }

        this.portInitialize = function(){
            this.inputPorts.data.forEach(element => {
                element.on("connect", hide, element);
                element.on("disconnect", show, element);
                if(element.connections.data.length>0){
                    element.setVisible(false);
                }
            });
        }
    },
    onContextMenu: function (x, y) {
        var shape = this.shape[0];
        $(shape).attr('id', this.getId());
        var id = "#" + $(shape).attr('id');
        if (this.label.text != "NOT")
            $.contextMenu({
                selector: id,
                autoHide: true,
                events: {
                    hide: function () {
                        $.contextMenu('destroy');
                    }
                },
                callback: $.proxy(function (key, options) {
                    switch (key) {
                        case "delete":
                            //  without undo/redo support
                            this.getCanvas().remove(this);

                            //  with undo/redo support
                            // var cmd = new draw2d.command.CommandDelete(this);
                            // this.getCanvas().getCommandStack().execute(cmd);
                            break;
                        case "addInput":
                            this.addInput();
                            this.repaint();
                            break;
                        case "deleteInput":
                            this.deleteInput();
                            this.repaint();
                            break;
                        case "show":
                            console.log(this);
                            break;
                        case "idName":
                            console.log(this.idName);
                        default:
                            break;
                    }

                }, this),
                x: x,
                y: y,
                items: {
                    "addInput": {
                        name: "Add Input"
                    },
                    "deleteInput": {
                        name: "Delete Input"
                    },
                    "show": {
                        name: "Show Console"
                    },
                    "idName": {
                        name: "Id Name"
                    }
                    // "delete": {
                    //     name: "Delete"
                    // }
                }
            });
        $.contextMenu({
            selector: id,
            autoHide: true,
            events: {
                hide: function () {
                    $.contextMenu('destroy');
                }
            },
            callback: $.proxy(function (key, options) {
                switch (key) {
                    case "show":
                        console.log(this);
                        break;
                    case "idName":
                        console.log(this.idName);
                    default:
                        break;
                }

            }, this),
            x: x,
            y: y,
            items: {
                "show": {
                    name: "Show Console"
                },
                "idName": {
                    name: "Id Name"
                }
            }
        });
    }
});

function show() {
    this.setVisible(true);

}

function hide() {
    this.setVisible(false);
}