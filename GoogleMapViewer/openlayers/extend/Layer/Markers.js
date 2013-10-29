OpenLayers.Layer.Markers.prototype.AddMarkers = function (markers) {
    for (var i = 0, len = markers.length; i < len; i++) {
        this.addMarker(markers[i]);
    }
};