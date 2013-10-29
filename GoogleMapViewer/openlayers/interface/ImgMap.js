(function () {
    window.CacheInfo = {};

    window.CreatImgMap = function () {
        window.map = new OpenLayers.Map("mapContainer", {
            projection: "EPSG:900913",
            displayProjection: "EPSG:4326",
            controls: [
                new OpenLayers.Control.KeyboardDefaults()
            ],
            eventListeners: {
                zoomend: MapInterface.MapDataCache.ReDraw
            }
        });

        InitCollectLayers();
        InitBaseControls(); //初始化最基本的控件

        window.map.events.register('removelayer', window.map, MapInterface.Layer._removeLayerCallback);
    };

    //初始化采集层
    function InitCollectLayers() {

        //添加点时点的样式
        var pointLayerStyle = new OpenLayers.Style({
            externalGraphic: 'openlayers/img/marker.png',
            graphicWidth: 20,
            graphicHeight: 20,
            graphicXOffset: -10,
            graphicYOffset: -10
        });

        //采集图元的图层
        var collectLayer = MapInterface.Layer.CreateVectorLayer('collectLayer', {
            displayInLayerSwitcher: false,
            style: pointLayerStyle,
            styleMap: new OpenLayers.StyleMap({ "default": pointLayerStyle })
        });

        map.addLayer(collectLayer);
    }

    //初始化基本控件
    function InitBaseControls() {
        var commonPanel = MapInterface.Control.CreatePanel('commonPanel', 'olControlCommonPanel');
        var pan = MapControls.PanControl();

        map.AddControls(commonPanel, [pan, MapControls.ZoomOutControl(), MapControls.ZoomInControl(), MapControls.PrintControl()]);
        commonPanel.defaultControl = pan;

        map.AddControls(null, [
                            new OpenLayers.Control.KeyboardDefaults(), //键盘默认事件（方向键控制地图平移),
                            commonPanel]);

        pan = null;
        commonPanel = null;
        $('.olControlCommonPanel').easydrag();
    }
})();