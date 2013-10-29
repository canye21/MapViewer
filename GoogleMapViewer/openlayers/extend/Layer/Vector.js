OpenLayers.Layer.Vector.prototype.drawFeature = function (feature, style) {
    // don't try to draw the feature with the renderer if the layer is not 
    // drawn itself
    if (!this.drawn) {
        return
    }
    if (typeof style != "object") {
        if (!style && feature.state === OpenLayers.State.DELETE) {
            style = "delete";
        }
        var renderIntent = style || feature.renderIntent;
        style = feature.style || this.style;
        if (!style) {
            style = this.styleMap.createSymbolizer(feature, renderIntent);
        }
    }

    if (!this.renderer.drawFeature(feature, style)) {
        this.unrenderedFeatures[feature.id] = feature;
    } else {
        delete this.unrenderedFeatures[feature.id];
    };

    if (feature.labelDisplay) {
        feature.showLabel();
    }
    else {
        feature.hideLabel();
    }
};