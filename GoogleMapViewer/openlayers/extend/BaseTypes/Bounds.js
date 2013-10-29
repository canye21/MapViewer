/**
* APIMethod: getCenterLonLat
* 
* Returns:
* {<OpenLayers.LonLat>} The center of the bounds in map space.
*/
//OpenLayers.Bounds.prototype.getCenterLonLat = function () {
//    if (!this.centerLonLat) {
//        this.centerLonLat = new OpenLayers.LonLat(
//                (this.right - this.left) / 2, (this.top - this.bottom) / 2
//            );
//    }
//    return this.centerLonLat;
//};

OpenLayers.Bounds.prototype.containsLonLat = function (ll, inclusive) {
    if (ll) {
        return this.contains(ll.lon, ll.lat, inclusive);
    }

    return false;
};