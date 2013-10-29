(function () {
    window.CacheInfo = {};

    window.CreatMap = function () {
        window.map = new OpenLayers.Map("mapContainer", {
            projection: "EPSG:900913",
            displayProjection: "EPSG:4326",
            controls: [
                new OpenLayers.Control.KeyboardDefaults()
            ]
        });
        InitBaseControls(); //初始化最基本的控件
    };

    //初始化基本控件
    function InitBaseControls() {
        var commonPanel = MapInterface.Control.CreatePanel('commonPanel', 'olControlCommonPanel');
        var pan = MapControls.PanControl();

        map.AddControls(commonPanel, [pan, MapControls.ZoomOutControl(), MapControls.ZoomInControl(), MapControls.MaxExtentControl(), MapControls.SwitchMapControl()]);
        commonPanel.defaultControl = pan;

        map.AddControls(null, [
                            new OpenLayers.Control.KeyboardDefaults(), //键盘默认事件（方向键控制地图平移),
                            commonPanel]);

        pan = null;
        commonPanel = null;
    }
})();