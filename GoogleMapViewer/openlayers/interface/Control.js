
/********************************************************/
/*                                                      */
/*                   地图工具集合                       */
/*                                                      */
/********************************************************/

(function () {
    window.MapControls = {

        //平移
        PanControl: function () {
            return new OpenLayers.Control.MouseDefaults({
                'id': 'panControl'
            });
        },

        //放大
        ZoomOutControl: function () {
            return new OpenLayers.Control.ZoomIn({
                'id': 'zoomOutControl',
                'out': false,
                displayClass: 'olControlZoomOut'
            });
        },

        //缩小
        ZoomInControl: function () {
            return new OpenLayers.Control.ZoomOut({
                'id': 'zoomInControl',
                'out': true,
                displayClass: 'olControlZoomIn'
            });
        },

        //全图
        MaxExtentControl: function () {
            return new OpenLayers.Control.ZoomToMaxExtent({
                'id': 'zoomToMaxExtentControl',
                displayClass: 'olControlZoomToMaxExtent'
            });
        },

        //打印工具
        PrintControl: function () {
            return new OpenLayers.Control({
                id: 'printControl',
                type: OpenLayers.Control.TYPE_BUTTON,
                displayClass: 'olControlPrint',
                trigger: printMap
            });
        },

        //测量
        MeasureControl: function () {
            var control = new OpenLayers.Control.Measure(OpenLayers.Handler.Path, {
                id: 'measureControl',
                persist: true
            });
            control.events.on({
                "measure": handleMeasure,
                "measurepartial": handleMeasurepartial
            });
            return control;
        },

        //地图切换
        SwitchMapControl: function () {
            var setMapType = new OpenLayers.Control({
                'id': 'switchMapControl',
                type: OpenLayers.Control.TYPE_TOGGLE,
                controlType: 'switchMap',
                displayClass: 'olControlSwitchMap'
            });
            setMapType.events.on({ 'activate': SwitchSatelliteMap, 'deactivate': SwitchStreetMap });

            return setMapType;
        },

        //路线地图
        RouteMapControl: function () {
            var routeMapControl = new OpenLayers.Control({
                id: 'routeMapControl',
                type: OpenLayers.Control.TYPE_TOGGLE,
                controlType: 'switchMap',
                displayClass: 'olControlRouteMap'
            });
            routeMapControl.events.on({ 'activate': showRouteMap, 'deactivate': hideRouteMap });

            return routeMapControl;
        },

        //采集点工具
        CollectPointControl: function (collectLayer, option) {
            collectLayer = collectLayer || MapInterface.Layer.GetLayerByName('collectLayer');
            option = option || {};
            option.id = option.id || 'collectPointControl';
            option.title = option.title || '采集点';
            option.map = option.map || map;
            option.displayClass = option.displayClass || 'olControlCollectPoint';
            option.eventListeners = {
                featureadded: MapControls.Handler.Collect
            }

            return new OpenLayers.Control.DrawFeature(collectLayer, OpenLayers.Handler.Point, option);
        },

        //采集线工具
        CollectLineControl: function (collectLayer, option) {
            collectLayer = collectLayer || MapInterface.Layer.GetLayerByName('collectLayer');
            option = option || {};
            option.id = option.id || 'collectLineControl';
            option.title = option.title || '采集路线';
            option.map = option.map || map;
            option.displayClass = option.displayClass || 'olControlCollectLine';
            option.eventListeners = {
                featureadded: MapControls.Handler.Collect
            }

            return new OpenLayers.Control.DrawFeature(collectLayer, OpenLayers.Handler.Path, option);
        },

        //采集多边形工具
        CollectPolygonControl: function (collectLayer, option) {
            collectLayer = collectLayer || MapInterface.Layer.GetLayerByName('collectLayer');
            option = option || {};
            option.id = option.id || 'collectPolygonControl';
            option.title = option.title || '采集多边形';
            option.map = option.map || map;
            option.displayClass = option.displayClass || 'olControlCollectPolygon';
            option.eventListeners = {
                featureadded: MapControls.Handler.Collect
            }

            return new OpenLayers.Control.DrawFeature(collectLayer, OpenLayers.Handler.Polygon, option);
        }
    };


    /********************************************************/
    /*                                                      */
    /*                  地图工具的处理函数                  */
    /*                                                      */
    /********************************************************/

    //测量处理
    function handleMeasurepartial(event) {
        var element = document.getElementById('measureContainer');
        if (element != undefined) {
            element.parentNode.removeChild(element);
        }
    }

    function handleMeasure(event) {
        var geometry = event.geometry;
        var element = document.getElementById('measureContainer');

        if (element == undefined) {
            element = document.createElement('div');
            element.setAttribute('id', 'measureContainer');
            element.style.zIndex = 10000;
            element.style.border = 'solid 1px #000000';
            element.style.padding = '3px';
            element.style.position = 'absolute';
            element.style.color = '#FF0000';
            element.style.background = '#FFFFFF';
            element.style.fontWeight = 'bold';
            element.style.left = null;
            element.style.top = null;
            element.style.right = '10px';
            element.style.bottom = '10px';
            element.style.display = "none";

            document.body.appendChild(element);
        }
        $.post('../handler/CommonHandler.ashx', { opt: 'measurements', coord: MapInterface.WKT.Write(MapInterface.Mercator.ProjectInverse(geometry)), random: GetRandom() }, function (str) {
            if (str != "fail") {
                element.style.display = 'block';  //设置标尺可见                           
                var out = '';
                out += '距离: ' + str + "公里" + ' <img src="../Resource/Images/close.png" style="cursor:pointer;width:12px; height:12px; vertical-align:text-bottom" title="清除" onclick=\'MapInterface.Layer.ClearLayerByName(\"OpenLayers.Handler.Path\"); arguments[0].srcElement.parentElement.style.display="none";\'/>';
                element.innerHTML = out;
            }
        });


        if (window.event) {
            element.style.right = null;
            element.style.bottom = null;
            element.style.left = window.event.x + 'px';
            element.style.top = window.event.y + 'px';

        }
    }


    //打印地图
    function printMap() {
        self.focus();
        if (window.top.location.href.indexOf('Map.aspx') > 0) {
            window.top.print();
        }
        else {
            window.top.print();
        }
        return;
    }

    //街道图切换
    function SwitchStreetMap(event) {
        //隐藏路网图
        hideRouteMap(event);

        //获得街道图层
        var streetLayer = MapInterface.Layer.GetLayerByName('street');
        //设置基础图层为街道图层
        map.setBaseLayer(streetLayer);

        //移除工具栏中的路网图标
        map.RemoveControl(MapInterface.Control.GetControlByID('commonPanel'), MapInterface.Control.GetControlByID('routeMapControl'));

        streetLayer = null;
    }

    //卫星图切换
    function SwitchSatelliteMap(event) {
        //获得卫星图层
        var sateLayer = MapInterface.Layer.GetLayerByName('sate');
        //设置基础图层为卫星图层
        map.setBaseLayer(sateLayer);

        //添加工具栏中的路网图标
        map.AddControls(MapInterface.Control.GetControlByID('commonPanel'), MapControls.RouteMapControl());

        sateLayer = null;
    }

    //显示路线地图
    function showRouteMap(event) {
        var routeLayer = MapInterface.Layer.GetLayerByName('route');
        if (routeLayer) {
            routeLayer.setVisibility(true);
        }

        routeLayer = null;
    }

    //隐藏路线地图
    function hideRouteMap(event) {
        var routeLayer = MapInterface.Layer.GetLayerByName('route');
        if (routeLayer) {
            routeLayer.setVisibility(false);
        }

        routeLayer = null;
    }
})();