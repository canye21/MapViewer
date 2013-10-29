OpenLayers.Renderer.SVG.prototype.setStyle = function (node, style, options) {
    style = style || node._style;
    options = options || node._options;
    var r = parseFloat(node.getAttributeNS(null, "r"));
    var widthFactor = 1;
    var pos;
    if (node._geometryClass == "OpenLayers.Geometry.Point" && r) {
        node.style.visibility = "";
        if (style.graphic === false) {
            node.style.visibility = "hidden";
        } else if (style.externalGraphic) {
            pos = this.getPosition(node);

            if (style.graphicTitle) {
                node.setAttributeNS(null, "title", style.graphicTitle);

                var title = this.nodeFactory(node._featureId + '_title', "title");
                var text = this.nodeFactory(node._featureId + '_title_text', "text");
                var tspan = this.nodeFactory(node._featureId + '_title_text_tspan', "tspan");
                tspan.textContent = style.graphicTitle;

                text.appendChild(tspan);
                title.appendChild(text);
                node.appendChild(title);

                title = null;
                text = null;
                tspan = null;
            }
            if (style.graphicWidth && style.graphicHeight) {
                node.setAttributeNS(null, "preserveAspectRatio", "none");
            }
            var width = style.graphicWidth || style.graphicHeight;
            var height = style.graphicHeight || style.graphicWidth;
            width = width ? width : style.pointRadius * 2;
            height = height ? height : style.pointRadius * 2;
            var xOffset = (style.graphicXOffset != undefined) ?
                    style.graphicXOffset : -(0.5 * width);
            var yOffset = (style.graphicYOffset != undefined) ?
                    style.graphicYOffset : -(0.5 * height);

            var opacity = style.graphicOpacity || style.fillOpacity;

            node.setAttributeNS(null, "x", (pos.x + xOffset).toFixed());
            node.setAttributeNS(null, "y", (pos.y + yOffset).toFixed());
            node.setAttributeNS(null, "width", width);
            node.setAttributeNS(null, "height", height);
            node.setAttributeNS(this.xlinkns, "href", style.externalGraphic);
            node.setAttributeNS(null, "style", "opacity: " + opacity);
        } else if (this.isComplexSymbol(style.graphicName)) {
            // the symbol viewBox is three times as large as the symbol
            var offset = style.pointRadius * 3;
            var size = offset * 2;
            var id = this.importSymbol(style.graphicName);
            pos = this.getPosition(node);
            widthFactor = this.symbolMetrics[id][0] * 3 / size;

            // remove the node from the dom before we modify it. This
            // prevents various rendering issues in Safari and FF
            var parent = node.parentNode;
            var nextSibling = node.nextSibling;
            if (parent) {
                parent.removeChild(node);
            }

            if (this.supportUse === false) {
                // workaround for webkit versions that cannot do defs/use
                // (see https://bugs.webkit.org/show_bug.cgi?id=33322):
                // copy the symbol instead of referencing it
                var src = document.getElementById(id);
                node.firstChild && node.removeChild(node.firstChild);
                node.appendChild(src.firstChild.cloneNode(true));
                node.setAttributeNS(null, "viewBox", src.getAttributeNS(null, "viewBox"));
            } else {
                node.setAttributeNS(this.xlinkns, "href", "#" + id);
            }
            node.setAttributeNS(null, "width", size);
            node.setAttributeNS(null, "height", size);
            node.setAttributeNS(null, "x", pos.x - offset);
            node.setAttributeNS(null, "y", pos.y - offset);

            // now that the node has all its new properties, insert it
            // back into the dom where it was
            if (nextSibling) {
                parent.insertBefore(node, nextSibling);
            } else if (parent) {
                parent.appendChild(node);
            }
        } else {
            node.setAttributeNS(null, "r", style.pointRadius);
        }

        var rotation = style.rotation;
        if ((rotation !== undefined || node._rotation !== undefined) && pos) {
            node._rotation = rotation;
            rotation |= 0;
            if (node.nodeName !== "svg") {
                node.setAttributeNS(null, "transform",
                        "rotate(" + rotation + " " + pos.x + " " +
                        pos.y + ")");
            } else {
                var metrics = this.symbolMetrics[id];
                node.firstChild.setAttributeNS(null, "transform",
                     "rotate(" + style.rotation + " " + metrics[1] +
                         " " + metrics[2] + ")");
            }
        }
    }

    if (options.isFilled) {
        node.setAttributeNS(null, "fill", style.fillColor);
        node.setAttributeNS(null, "fill-opacity", style.fillOpacity);
    } else {
        node.setAttributeNS(null, "fill", "none");
    }

    if (options.isStroked) {
        node.setAttributeNS(null, "stroke", style.strokeColor);
        node.setAttributeNS(null, "stroke-opacity", style.strokeOpacity);
        node.setAttributeNS(null, "stroke-width", style.strokeWidth * widthFactor);
        node.setAttributeNS(null, "stroke-linecap", style.strokeLinecap || "round");
        // Hard-coded linejoin for now, to make it look the same as in VML.
        // There is no strokeLinejoin property yet for symbolizers.
        node.setAttributeNS(null, "stroke-linejoin", "round");
        style.strokeDashstyle && node.setAttributeNS(null,
                "stroke-dasharray", this.dashStyle(style, widthFactor));
    } else {
        node.setAttributeNS(null, "stroke", "none");
    }

    if (style.pointerEvents) {
        node.setAttributeNS(null, "pointer-events", style.pointerEvents);
    }

    if (style.cursor != null) {
        node.setAttributeNS(null, "cursor", style.cursor);
    }

    return node;
};

OpenLayers.Renderer.SVG.prototype.drawText = function (featureId, style, location) {
    var resolution = this.getResolution();

    var x = (location.x / resolution + this.left);
    var y = (location.y / resolution - this.top);

    var label = this.nodeFactory(featureId + this.LABEL_ID_SUFFIX, "text");
    var tspan = this.nodeFactory(featureId + this.LABEL_ID_SUFFIX + "_tspan", "tspan");

    label.setAttributeNS(null, "x", x);
    label.setAttributeNS(null, "y", -y);

    if (style.fontColor) {
        label.setAttributeNS(null, "fill", style.fontColor);
    }
    if (style.fontOpacity) {
        label.setAttributeNS(null, "opacity", style.fontOpacity);
    }
    if (style.fontFamily) {
        label.setAttributeNS(null, "font-family", style.fontFamily);
    }
    if (style.fontSize) {
        label.setAttributeNS(null, "font-size", style.fontSize);
    }
    if (style.fontWeight) {
        label.setAttributeNS(null, "font-weight", style.fontWeight);
    }
    if (style.labelSelect === true) {
        label.setAttributeNS(null, "pointer-events", "visible");
        label._featureId = featureId;
        tspan._featureId = featureId;
        tspan._geometry = location;
        tspan._geometryClass = location.CLASS_NAME;
    } else {
        label.setAttributeNS(null, "pointer-events", "none");
    }
    var align = style.labelAlign || "cm";
    label.setAttributeNS(null, "text-anchor",
            OpenLayers.Renderer.SVG.LABEL_ALIGN[align[0]] || "middle");

    if (this.isGecko) {
        label.setAttributeNS(null, "dominant-baseline",
                OpenLayers.Renderer.SVG.LABEL_ALIGN[align[1]] || "central");
    } else {
        tspan.setAttributeNS(null, "baseline-shift",
                OpenLayers.Renderer.SVG.LABEL_VSHIFT[align[1]] || "-35%");
    }

    //多行
    if (style.label.indexOf('<br/>') > 0) {
        var arr = style.label.split('<br/>');
        var preTspan;
        for (var i = 0; i < arr.length; i++) {
            tspan = this.nodeFactory(featureId + this.LABEL_ID_SUFFIX + "_tspan" + i.toString(), "tspan");
            tspan.textContent = arr[i];

            if (i == 0) {
                tspan.setAttributeNS(null, "fill", 'blue');
            }
            else {
                tspan.setAttributeNS(null, "fill", 'red');
            }

            if (preTspan) {
                tspan.setAttributeNS(null, "dx", -(preTspan.textLength.animVal.SVG_LENGTHTYPE_PX * arr[i - 1].length + 16));
                tspan.setAttributeNS(null, "dy", i * 15);
            }

            preTspan = tspan;
            if (!label.parentNode) {
                label.appendChild(tspan);
            }
        }
        this.textRoot.appendChild(label);
    }
    else {
        tspan.textContent = style.label;

        if (!label.parentNode) {
            label.appendChild(tspan);
            this.textRoot.appendChild(label);
        }
    }

    //扩展背景色
    if (style.labelBackgroundColor || style.labelBorderColor || style.labelBorderSize) {
        var bg = this.nodeFactory(featureId + this.BACKGROUND_ID_SUFFIX, "rect");
        if (style.labelBackgroundColor) {
            bg.setAttributeNS(null, "fill", style.labelBackgroundColor);
        }
        if (style.labelBorderColor || style.labelBorderSize) {
            bg.setAttributeNS(null, "stroke", (style.labelBorderColor ? style.labelBorderColor : "#000000")); bg.setAttributeNS(null, "stroke-width", (style.labelBorderSize ? style.labelBorderSize : "0.5"));
        }
        var bbox = label.getBBox();
        var labelWidth = bbox.width;
        var labelHeight = bbox.height;
        var padding = 2;
        if (style.labelPadding) {
            var pos = style.labelPadding.indexOf("px");
            if (pos == -1) {
                padding = style.labelPadding;
            } else {
                padding = parseInt(style.labelPadding.substr(0, pos));
            }
        }
        bg.setAttributeNS(null, "x", bbox.x - padding);
        bg.setAttributeNS(null, "y", bbox.y - padding);
        bg.setAttributeNS(null, "height", (labelHeight + padding * 2) + "px");
        bg.setAttributeNS(null, "width", (labelWidth + padding * 2) + "px");
        if (!bg.parentNode) {
            this.textRoot.insertBefore(bg, label);
        }
    }
};

OpenLayers.Renderer.SVG.prototype.removeText = function (featureId) {
    var label = document.getElementById(featureId + this.LABEL_ID_SUFFIX);
    if (label) {
        label.parentNode.removeChild(label);
    }
    //扩展背景色
    var labelBackground = document.getElementById(featureId + this.BACKGROUND_ID_SUFFIX);
    if (labelBackground) {
        labelBackground.parentNode.removeChild(labelBackground);
    }
};