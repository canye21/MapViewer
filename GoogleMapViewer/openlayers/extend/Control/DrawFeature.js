OpenLayers.Control.DrawFeature.prototype.drawFeature = function (geometry) {
    var feature = new OpenLayers.Feature.Vector(geometry);
    var proceed = this.layer.events.triggerEvent(
            "sketchcomplete", { feature: feature }
        );
    if (proceed !== false) {
        feature.state = OpenLayers.State.INSERT;
        this.featureAdded(feature);

        var f = feature.clone();
        f.geometry = f.geometry.transform(new OpenLayers.Projection(map.projection), new OpenLayers.Projection(map.displayProjection));
        this.events.triggerEvent("featureadded", { feature: f });
    }
};