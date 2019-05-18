var variable = draw2d.shape.basic.Rectangle.extend({

    NAME: "VariableFigure", // required for JSON read/write

    init: function (attr, setter, getter) {
        this._super(attr, setter, getter);
        this.width = 70;
        this.height = 20;
        this.resizeable = false;
        this.userData = attr;
        this.label = new draw2d.shape.basic.Label({
            text: attr.text,
            outlineStroke: 1,
            stroke: 0,
        });
        var ud = this.userData;
        this.label.installEditor(new draw2d.ui.LabelInplaceEditor({
            onCommit: $.proxy(function(text){
                ud.text = text;
            })
        }));
        this.add(this.label, new draw2d.layout.locator.CenterLocator());


        this.installEditPolicy(new draw2d.policy.figure.AntSelectionFeedbackPolicy());

        ppp = this;
        var port = this.createPort("input");
        port.on("connect", hide, port);
        port.on("disconnect", show, port);


        this.setInput = function () {
            var ports = this.getPorts();
            if (ports.data[0].name == "input0") {
                return;
            }
            this.removePort(ports.data[0]);
            var port = this.createPort("input");
            port.on("connect", hide, port);
            port.on("disconnect", show, port);
        }
        this.setOutput = function () {
            var ports = this.getPorts();
            if (ports.data[0].name == "output0") {
                return;
            }
            this.removePort(ports.data[0]);
            var port = this.createPort("output");
        }
        this.getFreeInputPort = function(){
            var inputPorts = this.getInputPorts().data;
            for(var i=0;i<inputPorts.length;i++){
                if(inputPorts[i].connections.data.length==0){
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

        this.setOutput();

        var vr = this;
        this.label.padding.bottom = 7;
        this.label.padding.right = 7;
        this.label.on("contextmenu", function(emitter, event){
            $.contextMenu({
                selector: 'body', 
                events:
                {  
                    hide:function(){ $.contextMenu( 'destroy' ); }
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
                        case "input":
                            this.setInput();
                            this.repaint();
                            break;
                        case "output":
                            this.setOutput();
                            this.repaint();
                            break;
    
                        default:
                            break;
                    }
    
                }, vr),
                x: event.x,
                y: event.y,
                items: {
                    "input": {
                        name: "Input"
                    },
                    "output": {
                        name: "Output"
                    },
                    // "delete": {
                    //     name: "Delete"
                    // },
                }
            });
        });
    },
    onContextMenu: function (x, y) {
        var shape = this.shape[0];
        $(shape).attr('id', this.getId());
        var id = "#" + this.getId();
        $.contextMenu({
            selector: id,
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
                    case "input":
                        this.setInput();
                        this.repaint();
                        break;
                    case "output":
                        this.setOutput();
                        this.repaint();
                        break;

                    default:
                        break;
                }

            }, this),
            x: x,
            y: y,
            items: {
                "input": {
                    name: "Input"
                },
                "output": {
                    name: "Output"
                },
                // "delete": {
                //     name: "Delete"
                // },
            }
        });
    }
});