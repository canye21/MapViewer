OpenLayers.Feature.Vector.prototype.labelDisplay = true;//是否显示标签

OpenLayers.Feature.Vector.prototype.showLabel = function () {
    this.labelDisplay = true;

    if (!this.layer) {
        return;
    }

    var label = document.getElementById(this.id + this.layer.renderer.LABEL_ID_SUFFIX);
    //扩展背景色
    var labelBackground = document.getElementById(this.id + this.layer.renderer.BACKGROUND_ID_SUFFIX);

    if (label) {
        label.style.display = 'block';
    }
    if (labelBackground) {
        labelBackground.style.display = 'block';
    }
};

OpenLayers.Feature.Vector.prototype.hideLabel = function () {
    this.labelDisplay = false;

    if (!this.layer) {
        return;
    }

    var label = document.getElementById(this.id + this.layer.renderer.LABEL_ID_SUFFIX);
    //扩展背景色
    var labelBackground = document.getElementById(this.id + this.layer.renderer.BACKGROUND_ID_SUFFIX);

    if (label) {
        label.style.display = 'none';
    }
    if (labelBackground) {
        labelBackground.style.display = 'none';
    }
};