OpenLayers.Handler.Point.prototype.click = function(evt) {
    OpenLayers.Event.stop(evt);
    if (this.drawing) {
        this.finalize();
        return false;
    } else {
        return true;
    }
};

OpenLayers.Handler.Point.prototype.dblclick = function(evt) {
    OpenLayers.Event.stop(evt);
    return false;
};

OpenLayers.Handler.Point.prototype.mouseup = function(evt) {
    OpenLayers.Event.stop(evt);
    return false;
};

OpenLayers.Handler.Point.prototype.modifyFeature = function(pixel) {
    var lonlat = this.map.getLonLatFromPixel(pixel);
    this.point.geometry.x = lonlat.lon;
    this.point.geometry.y = lonlat.lat;
    this.callback("modify", [this.point.geometry, this.point]);
    this.point.geometry.clearBounds();
};

OpenLayers.Handler.Point.prototype.createFeature = function(pixel) {
    var lonlat = this.map.getLonLatFromPixel(pixel);
    this.point = new OpenLayers.Feature.Vector(
            new OpenLayers.Geometry.Point(lonlat.lon, lonlat.lat)
        );
    this.callback("create", [this.point.geometry, this.point]);
    this.point.geometry.clearBounds();
};