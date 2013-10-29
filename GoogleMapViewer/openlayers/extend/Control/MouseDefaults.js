OpenLayers.Control.MouseDefaults.prototype.defaultWheelUp = function(evt) {
    if (this.map.getZoom() <= this.map.getNumZoomLevels()) {
        this.map.setCenter(this.map.getCenter(),
                               this.map.getZoom() + 1);
    }
};