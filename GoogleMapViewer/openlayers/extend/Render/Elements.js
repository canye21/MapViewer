OpenLayers.ElementsIndexer.prototype.removeText = function (featureId) {
    var label = document.getElementById(featureId + this.LABEL_ID_SUFFIX);
    if (label) {
        this.textRoot.removeChild(label);
    }

    //扩展背景色
    var labelBackground = document.getElementById(featureId + this.BACKGROUND_ID_SUFFIX);
    if (labelBackground) {
        this.textRoot.removeChild(labelBackground);
    }
}