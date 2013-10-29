(function () {
    var jsfiles = new Array(
        'Util.js',
        'BaseTypes/Bounds.js',
        'Control/DragFeature.js',
        'Control/DrawFeature.js',
        'Control/FeatureContextmenu.js',
        'Control/FeatureHandle.js',
        'Control/FeatureMouseMoveHandle.js',
        'Control/ModifyFeature.js',
        'Control/MouseDefaults.js',
        'Handler/Feature.js',
        'Handler/Path.js',
        'Handler/Point.js',
        'Render/SVG.js',
        'Render/VML.js',
        'Feature/Vector.js',
        'Layer/TileCache.js',
        'Layer/Vector.js',
        'Layer/Markers.js',
        "Popup/FramedCloud.js",
        'Events.js',
        'Popup.js',
        'Marker.js',
        'Map.js'
    );

    var agent = navigator.userAgent;
    var docWrite = (agent.match("MSIE") || agent.match("Safari"));
    if (docWrite) {
        var allScriptTags = new Array(jsfiles.length);
    }
    var host = OpenLayers._getScriptLocation() + "extend/";
    for (var i = 0, len = jsfiles.length; i < len; i++) {
        if (docWrite) {
            allScriptTags[i] = "<script src='" + host + jsfiles[i] +
                           "'></script>";
        } else {
            var s = document.createElement("script");
            s.src = host + jsfiles[i];
            var h = document.getElementsByTagName("head").length ?
                   document.getElementsByTagName("head")[0] :
                   document.body;
            h.appendChild(s);
        }
    }
    if (docWrite) {
        document.write(allScriptTags.join(""));
    }

})();