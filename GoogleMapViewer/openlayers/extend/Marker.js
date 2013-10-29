OpenLayers.Marker.prototype.label = null;
OpenLayers.Marker.prototype.labelDiv = null;
OpenLayers.Marker.prototype.labelDisplay = true;

OpenLayers.Marker.prototype.initialize = function (label, lonlat, icon, style) {
    this.label = label || '';
    this.lonlat = lonlat;
    this.style = style;

    var newIcon = (icon) ? icon : OpenLayers.Marker.defaultIcon();
    if (this.icon == null) {
        this.icon = newIcon;
    } else {
        this.icon.url = newIcon.url;
        this.icon.size = newIcon.size;
        this.icon.offset = newIcon.offset;
        this.icon.calculateOffset = newIcon.calculateOffset;
    }

    this.labelDiv = document.createElement('div');
    if (this.label && this.label != '') {
        this.labelDiv.innerHTML = this.label;
    }

    this.labelDiv.style.whiteSpace = "nowrap";
    this.labelDiv.style.display = 'none';
    this.labelDiv.style.position = 'absolute';
    this.labelDiv.style.left = (this.icon.size.w + 1) + 'px';
    this.labelDiv.style.top = (this.icon.size.h / 2 - 5) + 'px';

    //扩展背景色
    if (style.labelBackgroundColor || style.labelBorderColor || style.labelBorderSize) {
        this.labelDiv.style.padding = '1px';
        this.labelDiv.style.borderStyle = 'solid';
        this.labelDiv.style.backgroundColor = (this.style.labelBackgroundColor && this.style.labelBackgroundColor != '') ? this.style.labelBackgroundColor : '#FDC648';
        this.labelDiv.style.borderColor = (this.style.labelBorderColor && this.style.labelBorderColor != '') ? this.style.labelBorderColor : '#FFFFFF';
        this.labelDiv.style.borderWidth = (this.style.labelBorderSize && this.style.labelBorderSize != '') ? this.style.labelBorderSize + 'px' : '1px';
    }

    this.icon.imageDiv.appendChild(this.labelDiv);
    this.events = new OpenLayers.Events(this, this.icon.imageDiv, null);
};

OpenLayers.Marker.prototype.draw = function (px) {
    if (this.label && this.label != '') {
        this.labelDiv.style.display = this.labelDisplay == true ? 'block' : 'none';
    }

    return this.icon.draw(px);
};


OpenLayers.Marker.prototype.showLabel = function () {
    this.labelDisplay = true;
    this.labelDiv.style.display = 'block';
};

OpenLayers.Marker.prototype.hideLabel = function () {
    this.labelDisplay = false;
    this.labelDiv.style.display = 'none';
};