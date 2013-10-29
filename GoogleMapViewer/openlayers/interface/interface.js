(function () {
    var jsfiles = new Array(
    'MapInterface.js',
    'Control.js',
    'Handler.js',
    'Map.js',
    'ImgMap.js'
    );

    var agent = navigator.userAgent;
    var docWrite = (agent.match("MSIE") || agent.match("Safari"));
    if (docWrite) {
        var allScriptTags = new Array(jsfiles.length);
    }
    var host = OpenLayers._getScriptLocation() + "interface/";
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