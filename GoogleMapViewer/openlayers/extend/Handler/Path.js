OpenLayers.Handler.Path.prototype.slideFactor = 50;

OpenLayers.Handler.Path.prototype.click = function (evt) {
    OpenLayers.Event.stop(evt);
    return false;

};

OpenLayers.Handler.Path.prototype.dblclick = function (evt) {
    if (!this.freehandMode(evt)) {
        var index = this.line.geometry.components.length - 1;
        this.line.geometry.removeComponent(this.line.geometry.components[index]);
        this.removePoint();
        this.finalize();
    }
    return false;
};

OpenLayers.Handler.Path.prototype.contextmenu = function (evt) {
    if (this.line) {
        if (this.line.geometry.components.length > 2) {
            var index = this.line.geometry.components.length - 1;
            this.line.geometry.removeComponent(this.line.geometry.components[index - 1]);
            this.line.geometry.removeComponent(this.line.geometry.components[index - 2]);
        }
        else {
            this.layer.removeFeatures([this.line]);
            this.layer.removeFeatures([this.point]);

            this.lastDown = null;
            this.mouseDown = false;
            this.drawing = false;
        }
    }

    return false;
};

OpenLayers.Handler.Path.prototype.mousemove = function (evt) {
    if (this.drawing) {
        if (this.mouseDown && this.freehandMode(evt)) {
            this.addPoint(evt.xy);
        } else {
            if (parseFloat(evt.clientX) <= 50) {
                this.control.map.pan(-this.slideFactor, 0);
            }
            if (parseFloat(evt.clientY) <= 50) {
                this.control.map.pan(0, -this.slideFactor);
            }
            if (parseFloat(evt.clientX) >= parseFloat(document.body.clientWidth) - 50) {
                this.control.map.pan(this.slideFactor, 0);
            }
            if (parseFloat(evt.clientY) >= parseFloat(document.body.clientHeight) - 50) {
                this.control.map.pan(0, this.slideFactor);
            }
            this.modifyFeature(evt.xy);
        }
    }
    return true;
};