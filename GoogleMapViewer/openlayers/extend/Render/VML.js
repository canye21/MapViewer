OpenLayers.Renderer.VML.prototype.drawText = function (featureId, style, location) {
    var label = this.nodeFactory(featureId + this.LABEL_ID_SUFFIX, "olv:rect");
    var textbox = this.nodeFactory(featureId + this.LABEL_ID_SUFFIX + "_textbox", "olv:textbox");

    var resolution = this.getResolution();
    label.style.left = ((location.x / resolution - this.offset.x) | 0) + "px";
    label.style.top = ((location.y / resolution - this.offset.y) | 0) + "px";
    label.style.flip = "y";

    textbox.innerText = style.label;

    //扩展背景色
    if (style.labelBackgroundColor) {
        textbox.style.backgroundColor = style.labelBackgroundColor;
    }
    if (style.labelBorderColor || style.labelBorderSize) {
        textbox.style.border = "solid " + (style.labelBorderSize ? style.labelBorderSize : "1px") + " " + (style.labelBorderColor ? style.labelBorderColor : "#000000");
    }

    if (style.fontColor) {
        textbox.style.color = style.fontColor;
    }
    if (style.fontOpacity) {
        textbox.style.filter = 'alpha(opacity=' + (style.fontOpacity * 100) + ')';
    }
    if (style.fontFamily) {
        textbox.style.fontFamily = style.fontFamily;
    }
    if (style.fontSize) {
        textbox.style.fontSize = style.fontSize;
    }
    if (style.fontWeight) {
        textbox.style.fontWeight = style.fontWeight;
    }
    if (style.labelSelect === true) {
        label._featureId = featureId;
        textbox._featureId = featureId;
        textbox._geometry = location;
        textbox._geometryClass = location.CLASS_NAME;
    }
    textbox.style.whiteSpace = "nowrap";
    // fun with IE: IE7 in standards compliant mode does not display any
    // text with a left inset of 0. So we set this to 1px and subtract one
    // pixel later when we set label.style.left
    textbox.inset = "1px,0px,0px,0px";

    if (!label.parentNode) {
        label.appendChild(textbox);
        this.textRoot.appendChild(label);
    }

    var align = style.labelAlign || "cm";
    if (align.length == 1) {
        align += "m";
    }
    var xshift = textbox.clientWidth *
            (OpenLayers.Renderer.VML.LABEL_SHIFT[align.substr(0, 1)]);
    var yshift = textbox.clientHeight *
            (OpenLayers.Renderer.VML.LABEL_SHIFT[align.substr(1, 1)]);
    label.style.left = parseInt(label.style.left) - xshift - 1 + "px";
    label.style.top = parseInt(label.style.top) + yshift + "px";
}