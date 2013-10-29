OpenLayers.Layer.TileCache.prototype.initialize = function (name, url, layername, options) {
    this.layername = layername;
    OpenLayers.Layer.Grid.prototype.initialize.apply(this,
                                                         [name, url, {}, options]);
    this.extension = this.format.split('/')[1].toLowerCase();
    //this.extension = (this.extension == 'jpg') ? 'jpeg' : this.extension;
};


OpenLayers.Layer.TileCache.prototype.getURL = function (bounds) {
    var res = this.map.getResolution();
    var bbox = this.maxExtent;
    var size = this.tileSize;
    var tileX = Math.round((bounds.left - bbox.left) / (res * size.w));
    var tileY = Math.round((bbox.top - bounds.top) / (res * size.h)); //更改
    //var tileY = Math.round((bounds.bottom - bbox.bottom) / (res * size.h));
    var tileZ = this.serverResolutions != null ?
            OpenLayers.Util.indexOf(this.serverResolutions, res) :
            this.map.getZoom();
    /**
    * Zero-pad a positive integer.
    * number - {Int} 
    * length - {Int} 
    *
    * Returns:
    * {String} A zero-padded string
    */
    function zeroPad(number, length) {
        number = String(number);
        var zeros = [];
        for (var i = 0; i < length; ++i) {
            zeros.push('0');
        }
        return zeros.join('').substring(0, length - number.length) + number;
    }
    var components = [
            this.layername,
            zeroPad(tileZ + 1, 2),
            zeroPad(parseInt(tileX / 1000000), 3),
            zeroPad((parseInt(tileX / 1000) % 1000), 3),
            zeroPad((parseInt(tileX) % 1000), 3),
            zeroPad(parseInt(tileY / 1000000), 3),
            zeroPad((parseInt(tileY / 1000) % 1000), 3),
            zeroPad((parseInt(tileY) % 1000), 3) + '.' + this.extension
        ];
    var path = components.join('/');
    var url = this.url;
    if (url instanceof Array) {
        url = this.selectUrl(path, url);
    }
    url = (url.charAt(url.length - 1) == '/') ? url : url + '/';
    return url + path;
};