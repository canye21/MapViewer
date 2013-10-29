(function () {
    window.MapInterface = {
        /*
        扩展某个对象 
        */
        Extend: function (obj, option) {
            return OpenLayers.Util.extend(obj, option);
        },

        /*
        创建一个经纬度坐标类型
        */
        CreateLonLat: function (lon, lat) {
            return new OpenLayers.LonLat(parseFloat(lon), parseFloat(lat));
        },

        /*
        功能：获取当前地图显示的范围
        */
        GetExtent: function GetExtent() {
            return window.map.getExtent();
        },

        /*
        功能：获取当前地图显示的范围
        */
        GetExtentGeometry: function GetExtent() {
            var extent = window.map.getExtent();
            var arr = [];
            arr.push("POLYGON((");
            arr.push(extent.left + " " + extent.top);
            arr.push(',');
            arr.push(extent.right + " " + extent.top);
            arr.push(',');
            arr.push(extent.right + " " + extent.bottom);
            arr.push(',');
            arr.push(extent.left + " " + extent.bottom);
            arr.push(',');
            arr.push(extent.left + " " + extent.top);
            arr.push('))');

            return MapInterface.Mercator.ProjectInverse(MapInterface.WKT.Read(arr.join(''))).toString();
        },

        /*
        功能：返回当当前地图的显示级别
        */
        GetZoomLevel: function () {
            return window.map.getZoom();
        },

        /*
        功能：设置地图的中心坐标
        参数：
        lon:经度
        lat:纬度
        level:地图显示级别（可选）
        */
        SetCenter: function (x, y, level) {
            if (x && y) {
                level = level || MapInterface.GetZoomLevel();
                window.map.setCenter(MapInterface.CreateLonLat(x, y), level);
            }
        },

        /*
        将地图缩放到按下范围显示
        */
        zoomToExtent: function (bounds, closest) {
            if (window.map) {
                window.map.zoomToExtent(bounds, closest);
            }
        },

        /*定位一个Geometry*/
        ZoomToGeometry: function (geom) {
            if (!(geom instanceof OpenLayers.Geometry.Point)) {
                MapInterface.zoomToExtent(geom.getBounds());
            }
            else {
                MapInterface.PanTo(geom.x, geom.y);
            }
        },

        /*
        功能：设置地图的中心坐标
        参数：
        lon:经度
        lat:纬度
        level:地图显示级别（可选）
        */
        PanTo: function (x, y) {
            if (x && y) {
                window.map.panTo(MapInterface.CreateLonLat(x, y));
            }
        },

        /*根据点位置获取像素*/
        GetPixelFromGeometry: function (pt) {
            if (pt instanceof OpenLayers.Geometry.Point) {
                return window.map.getPixelFromLonLat(MapInterface.CreateLonLat(pt.x, pt.y));
            }
            return undefined;
        }
    };

    /********************************************************
   
    经纬度转化层坐标操作

    ******************************************************/
    MapInterface.Map = {
        GetLayerPxFromLonLat: function (lonlat) {
            if (lonlat) {
                return window.map.getLayerPxFromLonLat(lonlat);
            }
        }
    }


    /********************************************************
   
    WKT格式操作

    ******************************************************/
    MapInterface.WKT = {

        /*
        功能：根据一个OpenLayers.Geometry类型的对象返回String类型的WKT符串
        参数：<OpenLayers.Geometry>类型的对象
        返回：WKT格式的字符串
        */
        Write: function (geometry) {
            if (geometry) {
                var wktWriter = new OpenLayers.Format.WKT();
                return wktWriter.write(new OpenLayers.Feature.Vector(geometry));
            }
        },

        /*
        功能：根据wkt字符串返回一个OpenLayers.Geometry类型的对象
        参数：WKT格式的字符串
        返回：<OpenLayers.Geometry>类型的对象
        */
        Read: function (wkt) {
            if (wkt) {
                var wktReader = new OpenLayers.Format.WKT();
                return wktReader.read(wkt).geometry;
            }
        }

    };

    /********************************************************
    
    墨卡托操作
    
    ******************************************************/
    MapInterface.Mercator = {

        /*
        功能：将经纬度转换成地图上的坐标
        参数：
        longitude:经度
        latitude: 纬度
        */
        Forward: function (longitude, latitude) {
            return OpenLayers.Layer.SphericalMercator.forwardMercator(parseFloat(longitude), parseFloat(latitude));
        },

        /*
        功能：将地图上的坐标转换成经纬度
        参数：
        longitude:经度
        latitude: 纬度
        */
        Inverse: function (longitude, latitude) {
            return OpenLayers.Layer.SphericalMercator.inverseMercator(parseFloat(longitude), parseFloat(latitude));
        },

        /*
        功能：返回投影坐标后的对象
        参数：地理坐标系的<OpenLayers.Geometry>
        返回：墨卡托坐标转换后的<OpenLayers.Geometry>
        */
        ProjectForward: function (geom) {
            if (geom) {
                return geom.clone().transform(new OpenLayers.Projection(map.displayProjection), new OpenLayers.Projection(map.projection));
            }
            return geom;
        },

        /*
        功能：返回地理坐标的对象（非投影）
        参数：墨卡托坐标转换后的<OpenLayers.Geometry>
        返回：地理坐标系的<OpenLayers.Geometry>
        */
        ProjectInverse: function (geom) {
            if (geom) {
                return geom.clone().transform(new OpenLayers.Projection(map.projection), new OpenLayers.Projection(map.displayProjection));
            }
            return geom;
        }
    };


    /********************************************************
    
    工具控制
 
    ******************************************************/
    MapInterface.Control = {

        /*
        工具条的创建
        */
        CreatePanel: function (id, displayClass) {
            return new OpenLayers.Control.Panel({ 'id': id, 'displayClass': displayClass });
        },

        /*
        功能：根据ID获取地图的工具
        参数：
        id：工具的ID
        */
        GetControlByID: function (id) {
            for (var i in window.map.controls) {
                if (window.map.controls[i].id == id) {
                    return window.map.controls[i];
                }
            }

            return null;
        },

        /*
        激活某个工具
        */
        Activate: function (control) {
            if (control) {
                control.activate();
            }
        },

        /*
        击活采集工具
        */
        ActivateCollectControl: function (type, callback, deactivateCallback) {
            var option = {};
            option.id = 'collectControl';
            option.map = map;
            option.eventListeners = {
                featureadded: callback,
                deactivate: deactivateCallback
            };
            var control = this.GetControlByID(option.id);
            if (control) {
                control.deactivate();
                this.RemoveControl(control);
            }
            var collectLayer = MapInterface.Layer.GetLayerByName('collectLayer');

            switch (type) {
                case 'point':
                    {
                        control = new OpenLayers.Control.DrawFeature(collectLayer, OpenLayers.Handler.Point, option);
                        break;
                    }
                case 'line':
                    {
                        control = new OpenLayers.Control.DrawFeature(collectLayer, OpenLayers.Handler.Path, option);
                        break;
                    }
                case 'polygon':
                    {
                        control = new OpenLayers.Control.DrawFeature(collectLayer, OpenLayers.Handler.Polygon, option);
                        break;
                    }
                case 'rectangle': //距形
                    {
                        option = MapInterface.Extend(option, { handlerOptions: { sides: 4, irregular: true} });
                        control = new OpenLayers.Control.DrawFeature(collectLayer,
                                            OpenLayers.Handler.RegularPolygon,
                                            option)
                        break;
                    }
                case 'circle': //圆形
                    {
                        option = MapInterface.Extend(option, { handlerOptions: { sides: 40} });
                        control = new OpenLayers.Control.DrawFeature(collectLayer,
                                            OpenLayers.Handler.RegularPolygon,
                                            option)
                        break;
                    }
            }
            window.map.AddControls(null, [control]);

            control.activate();
        },

        /*取消采集*/
        DeactivateCollectControl: function () {
            MapInterface.Control.RemoveByID('collectControl');
        },


        /*
        根据ID激活工具
        */
        ActivateByID: function (id) {
            MapInterface.Control.Activate(MapInterface.Control.GetControlByID(id));
        },

        /*
        移除某个控件
        */
        RemoveControl: function (control) {
            if (control) {
                control.deactivate();
                window.map.removeControl(control);
                //MapInterface.Control.ActivateByID('panControl');
            }
        },

        /*根据名称移除工具*/
        RemoveByID: function (id) {
            MapInterface.Control.RemoveControl(MapInterface.Control.GetControlByID(id));
        },

        /*
        功能：扩展工具的属性
        参数：
        id：要扩展的控件ID
        json：扩展的对象
        */
        ExtendControl: function (id, json) {
            var control = MapInterface.Control.GetControlByID(id);
            if (control) {
                OpenLayers.Util.extend(control, json);
            }
        }
    };



    /*******************************************************
    
    图层控制 

    *******************************************************/
    MapInterface.Layer = {

        //设置层的层叠顺序
        SetZIndex: function (layer, zIndex) {
            if (layer && zIndex) {
                if (layer.constructor == String) {
                    layer = MapInterface.Layer.GetLayerByName(layer);
                }
                window.map.setLayerZIndex(layer, zIndex);
            }
        },

        //创建矢量图形图层
        CreateVectorLayer: function (name, options) {
            MapInterface.Layer.RemoveByName(name);

            var layer = new OpenLayers.Layer.Vector(name, options);
            window.map.addLayer(layer);

            return layer;
        },

        //创建Marker的图层
        CreateMarkerLayer: function (name, options) {
            var layer = new OpenLayers.Layer.Markers(name, options);
            if (window.map) {
                window.map.addLayer(layer);
            }
            name = null;
            options = null;

            return layer;
        },

        //显示标签
        ShowLabel: function () {
            var layer = null;
            for (var i = 0, len = map.layers.length; i < len; ++i) {
                layer = map.layers[i];
                if (layer instanceof OpenLayers.Layer.Vector) {
                    for (var j = 0, len1 = layer.features.length; j < len1; j++) {
                        layer.features[j].showLabel();
                    }
                }
                if (layer instanceof OpenLayers.Layer.Markers) {
                    for (var j = 0, len1 = layer.markers.length; j < len1; j++) {
                        layer.markers[j].showLabel();
                    }
                }
                layer.attributes = layer.attributes || {};
                layer.attributes.showLabel = 'true';
            }
            layer = null;
        },

        //隐藏标签
        HideLabel: function () {
            var layer = null;
            for (var i = 0, len = map.layers.length; i < len; ++i) {
                var layer = map.layers[i];
                if (layer instanceof OpenLayers.Layer.Vector) {
                    for (var j = 0, len1 = layer.features.length; j < len1; j++) {
                        layer.features[j].hideLabel();
                    }
                }
                if (layer instanceof OpenLayers.Layer.Markers) {
                    for (var j = 0, len1 = layer.markers.length; j < len1; j++) {
                        layer.markers[j].hideLabel();
                    }
                }
                layer.attributes = layer.attributes || {};
                layer.attributes.showLabel = 'false';
            }
            layer = null;
        },

        /*
        根据属性获取层
        */
        GetLayersBy: function (property, value) {
            var layers = [];
            var map = window.map;

            for (var i = 0, len = map.layers.length; i < len; ++i) {
                if (map.layers[i][property] && map.layers[i][property] == value) {
                    layers.push(map.layers[i]);
                }
            }

            property = null;
            value = null;
            map = null;

            return layers;
        },

        /*
        功能：根据图层的Name获取地图上的一个图层
        */
        GetLayerByName: function (name) {
            var layers = MapInterface.Layer.GetLayersBy('name', name);
            name = null;

            return layers.length > 0 ? layers[0] : undefined;
        },

        /*图层删除回调*/
        _removeLayerCallback: function (obj) {
            if (map && map.controls) {
                var control;
                for (var i = map.controls.length - 1; i >= 0; i--) {
                    control = map.controls[i];

                    if (control && (control.layer && control.layer == obj.layer)
                    || (control.layers && control.layers.length == 1 && control.layers[0] == obj.layer)) {
                        if (control.active) {
                            control.deactivate();
                        }
                        window.map.removeControl(control);
                    }
                }

                control = null;
            }
            var layers = map.layers;
        },

        /*允许层拖动*/
        EnableDrag: function (layer, callback, onDragCallBack) {
            if (layer) {
                layer = layer.constructor === String ? MapInterface.Layer.GetLayerByName(layer) : layer;

                if (layer) {
                    var id = layer.name + '_DragFeatureControl';
                    MapInterface.Control.RemoveByID(id);

                    var option = {
                        id: layer.name + '_DragFeatureControl',
                        onComplete: function (feature, pixel) {
                            if (callback) {
                                var f = feature.clone();
                                f.id = feature.id;
                                f.geometry = MapInterface.Mercator.ProjectInverse(f.geometry);
                                callback(f, pixel);
                            }
                        }
                    };
                    if (onDragCallBack) {
                        option.onDrag = function (feature, pixel) {
                            var f = feature.clone();
                            f.id = feature.id;
                            f.geometry = MapInterface.Mercator.ProjectInverse(f.geometry);
                            onDragCallBack(f, pixel);
                        }
                    }

                    var control = new OpenLayers.Control.DragFeature(layer, option);
                    window.map.AddControls(null, control);
                    control.activate();
                }
            }
        },

        /*取消拖动*/
        UnEnableDrag: function (layer) {
            if (layer) {
                layer = layer.constructor === String ? MapInterface.Layer.GetLayerByName(layer) : layer;
                if (layer) {
                    var control = MapInterface.Control.GetControlByID(layer.name + '_DragFeatureControl');
                    if (control) {
                        control.deactivate();
                        window.map.removeControl(control);
                    }
                }
            }
        },

        /*支持单击*/
        EnableClick: function (layer) {
            MapInterface.Layer.EnableFeatureHandle(layer, {
                featureClick: function (obj) {
                    MapControls.Handler.Click(obj.feature);
                }
            });
        },

        /*取消单击*/
        UnEnableClick: function (layer) {
            MapInterface.Layer.UnEnableFeatureHandle(layer);
        },

        /*支持右键*/
        EnableContextmenu: function (layer, callback) {
            if (layer && callback) {
                if (layer.constructor === String) {
                    layer = MapInterface.Layer.GetLayerByName(layer);
                }

                if (!layer) {
                    return;
                }

                var control = MapInterface.Control.GetControlByID(layer.name + '_ContextmenuControl');
                if (control) {
                    if (control.active) control.deactivate();
                    window.map.removeControl(control);
                }
                control = new OpenLayers.Control.FeatureContextmenu(layer, {
                    id: layer.name + '_ContextmenuControl',
                    eventListeners: {
                        'featureContextMenu': callback
                    }
                });
                window.map.AddControls(null, control);
                control.activate();
                control = null;
            }
        },

        /*取消右键*/
        UnEnableContextmenu: function (layer) {
            if (layer) {
                if (layer.constructor === String) {
                    layer = MapInterface.Layer.GetLayerByName(layer);
                }
                if (!layer) {
                    return;
                }

                var control = MapInterface.Control.GetControlByID(layer.name + '_ContextmenuControl');
                if (layer && layer == control.layer) {
                    if (control.active) {
                        control.deactivate();
                    }
                    MapInterface.Control.RemoveControl(control);
                }
            }
        },

        EnableFeatureHandle: function (layer, callbacks) {
            MapInterface.Control.ActivateByID('panControl');

            if (layer && callbacks) {
                if (layer.constructor === String) {
                    layer = MapInterface.Layer.GetLayerByName(layer);
                }
                if (!layer) {
                    return;
                }

                if (callbacks.featureClick) {
                    var options = {};
                    options.eventListeners = {};
                    options.eventListeners.featureClick = callbacks.featureClick;
                    options.eventListeners.deactivate = callbacks.deactivate;
                    options.id = layer.name + '_FeatureHandle';
                    var control = MapInterface.Control.GetControlByID(options.id);
                    if (control && control.active == true) {
                        control.deactivate();
                        window.map.removeControl(control);
                    }
                    control = new OpenLayers.Control.FeatureHandle(layer, options);
                    window.map.AddControls(null, control);
                    control.activate();
                }
                if (callbacks.featureMouseMove) {
                    var options = {};
                    options.eventListeners = {};
                    options.eventListeners.featureMouseMove = callbacks.featureMouseMove;
                    options.id = layer.name + '_FeatureMouseMoveHandle';
                    var control = MapInterface.Control.GetControlByID(options.id);
                    if (control && control.active == true) {
                        control.deactivate();
                        window.map.removeControl(control);
                    }
                    control = new OpenLayers.Control.FeatureMouseMoveHandle(layer, options);
                    window.map.AddControls(null, control);
                    control.activate();
                }
            }
        },

        UnEnableFeatureHandle: function (layer) {
            if (layer) {
                if (layer.constructor === String) {
                    layer = MapInterface.Layer.GetLayerByName(layer);
                }
                if (!layer) {
                    return;
                }

                var control = MapInterface.Control.GetControlByID(layer.name + '_FeatureHandle');
                if (layer && control && layer == control.layer) {
                    if (control.active) {
                        control.deactivate();
                    }
                    MapInterface.Control.RemoveControl(control);
                }

                control = MapInterface.Control.GetControlByID(layer.name + '_FeatureMouseMoveHandle');
                if (layer && control && layer == control.layer) {
                    if (control.active) {
                        control.deactivate();
                    }
                    MapInterface.Control.RemoveControl(control);
                }
            }
        },

        /*
        清空单个图层
        */
        ClearLayer: function (layer) {
            if (layer) {
                switch (layer.CLASS_NAME) {
                    //矢量图形                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       
                    case "OpenLayers.Layer.Vector":
                        {
                            layer.destroyFeatures();
                            break;
                        }

                        //标记图形
                    case "OpenLayers.Layer.Markers":
                        {
                            layer.clearMarkers();
                            break;
                        }
                }
            }
            layer = null;
        },

        /*
        功能：清空图层上的图元
        layers: 图层的名称、单个图层或多个图层
        delCache:清空地图的缓存（'true'/'false'）
        */
        ClearLayers: function (layers) {
            if (window.map && layers) {
                if (layers.constructor != Array) {
                    layers = [layers];
                }

                for (var i = 0; i < layers.length; i++) {
                    MapInterface.Layer.ClearLayer(layers[i]);
                }
            }
        },

        /*
        功能：清空图层上的图元
        layerName: 图层的名称
        delCache: 清空地图的缓存（'true'/'false'）
        */
        ClearLayerByName: function (layerName) {
            MapInterface.Layer.ClearLayer(MapInterface.Layer.GetLayerByName(layerName));
        },

        /*
        功能：清空所有层中的信息
        */
        Clear: function () {
            if (window.map) {
                var map = window.map;
                var layer;

                for (var i = 0, len = map.layers.length; i < len; ++i) {
                    layer = map.layers[i];

                    if (layer && (layer instanceof OpenLayers.Layer.Vector || layer instanceof OpenLayers.Layer.Markers)) {
                        MapInterface.Layer.ClearLayer(layer);
                    }
                }

                map = null;
                layer = null;
            }
        },

        /*
        根据名称删除层
        */
        RemoveByName: function (layerName) {
            var layer = MapInterface.Layer.GetLayerByName(layerName);
            if (layer) {
                window.map.removeLayer(layer);
            }
            layer = null;
        },

        /*
        删除单个或多个层
        */
        RemoveLayers: function (layers) {
            var map = window.map;
            var layer;
            layers = layers || map.layers;
            if (layers) {
                if (layers.constructor != Array) {
                    layers = [layers];
                }
                for (var i = layers.length - 1; i >= 0; --i) {
                    layer = layers[i];

                    if (layer && layer.CLASS_NAME &&
                    (layer.CLASS_NAME == 'OpenLayers.Layer.Vector'
                    || layer.CLASS_NAME == 'OpenLayers.Layer.Markers')
                    ) {
                        if (layer.name == 'collectLayer') {
                            continue;
                        }
                        map.removeLayer(layer);
                    }
                }
            }
            layer = null;
            map = null;
            layers = null;
        }
    };

    /********************************************************/
    /*                                                      */
    /*                   地图上的缓存信息                   */
    /*                                                      */
    /********************************************************/

    MapInterface.MapDataCache = {
        _ReDraw: function (layer) {
            if (layer && (layer instanceof OpenLayers.Layer.Vector || layer instanceof OpenLayers.Layer.Markers)
                    && layer.attributes && layer.attributes.filterWhere) {
                var name = layer.name;
                var filterWhere = JSON.parse(layer.attributes.filterWhere);

                filterWhere.ViewExtent = MapInterface.GetExtentGeometry();
                filterWhere.ZoomLevel = MapInterface.GetZoomLevel();

                layer.attributes.filterWhere = JSON.stringify(filterWhere);

                if (layer instanceof OpenLayers.Layer.Vector) {
                    var path = 'handler/FeatureHandler.ashx';
                    if (layer.name != 'taskPlanInformation') {
                        var path = ($('#hfModular', $(top.window.frames['mapFrame'].document))[0] && $('#hfModular', $(top.window.frames['mapFrame'].document)).val() != '') ? ($('#hfModular', $(top.window.frames['mapFrame'].document)).val().indexOf('task') < 0 ? 'handler/FeatureHandler.ashx' : 'handler/TaskPostDeploymentHandler.ashx')
                    : 'handler/FeatureHandler.ashx';
                    }

                    $.post(window.rootPath + path, { opt: ($('#hfModular', $(top.window.frames['mapFrame'].document)).val() == 'taskEnablePost' ? 'selectTaskCollectFeature' : 'selectFeature'), filterWhere: layer.attributes.filterWhere, random: getRandom() }, function (res) {
                        MapInterface.Feature.AddFeatures(name, res, layer.attributes);
                    });
                }
                else {
                    $.post(window.rootPath + 'handler/FeatureHandler.ashx', { opt: 'selectFeature', filterWhere: layer.attributes.filterWhere }, function (res) {
                        MapInterface.Feature.AddFeatures(name, res, layer.attributes);
                    });
                }
            }
        },

        /*根据据层名称重画*/
        ReDrawByLayerName: function (layerName) {
            var layer = MapInterface.Layer.GetLayerByName(layerName);
            if (layer) {
                MapInterface.MapDataCache._ReDraw(layer);
            }
        },

        /*
        重画
        */
        ReDraw: function () {
            if (window.map) {
                var map = window.map;
                var layer;
                for (var i = 0, len = map.layers.length; i < len; ++i) {
                    layer = map.layers[i];
                    if (layer.attributes && layer.attributes.allowRefresh == 'true') {
                        MapInterface.MapDataCache._ReDraw(layer);
                    }
                }
                map = null;
                layer = null;
            }
        }
    };

    /*******************************************************
    Feature控制


    *******************************************************/

    MapInterface.Feature = {
        //获取样式
        GetDefaultStyle: function () {
            var style = OpenLayers.Util.extend({}, OpenLayers.Feature.Vector.style['default']);
            style.strokeColor = '#FF0000';
            style.strokeOpacity = 0.7;
            style.strokeWidth = 3;
            style.strokeLinecap = 'round';

            style.labelBackgroundColor = '#FDC648';
            style.labelBorderColor = '#FFFFFF';
            style.labelBorderSize = '2';
            return style;
        },

        //获取图元
        GetFeature: function (layer, featureId) {
            if (!layer || !featureId || layer == "" || featureId == "") {
                return undefined;
            }
            if (!(featureId instanceof String)) {
                return featureId;
            }
            if (layer instanceof String) {
                layer = MapInterface.Layer.GetLayerByName(layer);
            }
            if (layer != undefined) {
                return layer.getFeatureById(featureId);
            }
            return undefined;
        },

        //删除图元
        RemoveFeature: function (layer, feature) {
            if (!layer || !feature || layer == "" || feature == "") {
                return;
            }
            if (layer instanceof String) {
                layer = MapInterface.Layer.GetLayerByName(layer);
            }
            if (!layer) {
                return;
            }
            feature = layer.getFeatureById(feature);
            if (feature) {
                layer.removeFeatures(feature);
            }
        },
        //label设置
        _initLabel: function (style, option) {
            if (style) {
                style.labelAlign = "lm";
                style.labelXOffset = (option.iconW ? option.iconW / 2 : 0) + 5;
                style.fontColor = option.fontColor || "Black";
            }
            return style;
        },

        //创建图标
        _createIcon: function (option) {
            if (!option.icon) {
                return;
            }
            option.iconW = option.iconW || 18;
            option.iconH = option.iconH || 18;
            var icon = null;
            var size = new OpenLayers.Size(option.iconW, option.iconH);
            var offset = new OpenLayers.Pixel(-(size.w / 2), -(size.h / 2));  //图标相对于位置上的平移
            icon = new OpenLayers.Icon(window.rootPath + option.icon, size, offset);

            return icon;
        },

        //初始化图标
        _initFeatureStyle: function (option) {
            var style = MapInterface.Feature.GetDefaultStyle();
            if (option == undefined) {
                return style;
            }
            if (option.color) {
                style.strokeColor = option.color;
            }
            if (option.rotation) {
                style.rotation = option.rotation;
            }
            if (option.icon) {
                option.iconW = option.iconW || 18;
                option.iconH = option.iconH || 18;

                style.externalGraphic = window.rootPath + option.icon;
                style.graphicWidth = option.iconW;
                style.graphicHeight = option.iconH;
                style.graphicXOffset = -(option.iconW / 2);
                style.graphicYOffset = -(option.iconH / 2);
                style.graphicOpacity = 1;
            }

            MapInterface.Feature._initLabel(style, option);
            return style;
        },

        //设置中心
        _center: function (feature, option) {
            if (option.center && option.center == 'true') {
                MapInterface.ZoomToGeometry(feature.geometry);
            }
        },

        //绑定事件处理
        _attachEvent: function (layer, option) {
            if (!option.callback) {
                return;
            }
            //是否有右键处理函数
            if (layer instanceof OpenLayers.Layer.Vector) {
                if (option.callback.contextCallback) {
                    MapInterface.Layer.EnableContextmenu(layer, option.callback.contextCallback);
                }
            }
            if (layer instanceof OpenLayers.Layer.Markers) {
                //图元单击
                if (option.callback.mouseover || option.callback.mouseout
                || option.callback.mousedown) {
                    var markers = layer.markers;
                    var m;
                    for (var i = 0, len = markers.length; i < len; i++) {
                        m = markers[i];

                        if (option.callback.mouseover) {
                            m.events.register('mouseover', null, option.callback.mouseover);
                        }
                        if (option.callback.mouseout) {
                            m.events.register('mouseout', null, option.callback.mouseout);
                        }
                        if (option.callback.mousedown) {
                            m.events.register('mousedown', null, option.callback.mousedown);
                        }
                    }
                    m = undefined;
                    markers = undefined;
                }
            }
        },

        //初始化图层
        _initLayer: function (layerName, option) {
            var layer = MapInterface.Layer.GetLayerByName(layerName);
            if (layer) {
                MapInterface.Layer.ClearLayer(layer);
            }
            else {
                if (option.markerLayer && option.markerLayer === 'true') {
                    layer = MapInterface.Layer.CreateMarkerLayer(layerName);
                }
                else {
                    layer = MapInterface.Layer.CreateVectorLayer(layerName);
                }
            }

            if (option) {
                layer.attributes = {};
                MapInterface.Extend(layer.attributes, option);
            }
            return layer;
        },

        //创建图元
        CreateFeature: function (fObj, option) {
            var g = MapInterface.WKT.Read(fObj.coord);
            var geom = MapInterface.Mercator.ProjectForward(g);

            var style = MapInterface.Feature._initFeatureStyle(fObj.attributes);
            style.label = fObj.name;
            style.graphicTitle = fObj.tip || fObj.name;
            if (fObj.style) {
                MapInterface.Extend(style, fObj.style);
            }

            //marker
            if (option != null) {
                if (option.markerLayer && option.markerLayer === 'true') {
                    var icon = MapInterface.Feature._createIcon(fObj.attributes);
                    var marker = new OpenLayers.Marker(fObj.name, MapInterface.CreateLonLat(geom.x, geom.y), icon, style);
                    marker.labelDisplay = (option.showLabel && (option.showLabel === 'true' || option.showLabel == true)) ? true : false;
                    marker.attributes = {
                        feature: fObj
                    };
                    return marker;
                }
            }

            var f = new OpenLayers.Feature.Vector(geom, null, style);
            f.id = fObj.key;
            f.labelDisplay = option != null ? (option.showLabel && (option.showLabel === 'true' || option.showLabel == true)) ? true : false : false;
            f.attributes = {
                feature: fObj
            };

            return f;
        },

        //添加多个Feature
        /*
        option
        filterWhere 图层过滤条件
        showLabel   是否显示标签('true'/'false')
        allowRefresh 自动刷新层
        markerLayer  是否是marker层('true'/'false')
        callback     事件回调
        {
        mouseover 鼠标移上去(MarkerLayer)
        mouseout  鼠标移开(MarkerLayer)
        contextCallback  右键回调方法(VectorLayer)
        }
        completed_callback 添加完成回调事件
        */
        AddFeatures: function (layerName, features, option, completed_callback) {
            if (layerName == undefined || layerName == ''
            || features == undefined) {
                return;
            }
            option = option || {};

            features = JSON.parse(features);
            if (!(features instanceof Array)) {
                features = [features];
            }
            if (features.length == 0) {
                MapInterface.Feature._initLayer(layerName, option);
                MapInterface.Layer.ClearLayerByName(layerName);
                return;
            }
            var layer = MapInterface.Feature._initLayer(layerName, option);  //初始化图层
            var fs = [];

            for (var i = 0; i < features.length; i++) {
                fs.push(MapInterface.Feature.CreateFeature(features[i], option));
            }

            if (fs.length > 0 && !fs[0].id) {
                for (var i = 0; i < fs.length; i++) {
                    if (fs[i].id == undefined) {
                        fs[i].id = layerName + '_feature_' + i.toString();
                    }
                }
            }

            if (fs.length > 0) {
                if (option.markerLayer && option.markerLayer == 'true') {
                    layer.AddMarkers(fs);
                }
                else {
                    layer.addFeatures(fs);
                }
                MapInterface.Feature._attachEvent(layer, option);
                MapInterface.Feature._center(fs[0], option);

                if (option.filterWhere) {
                    var filterWhere = JSON.parse(option.filterWhere);
                    if (filterWhere.Attributes && filterWhere.Attributes.enableClick)
                        MapInterface.Layer.EnableClick(layerName);
                    else
                        MapInterface.Layer.UnEnableClick(layerName);
                }
            }

            if (completed_callback) {
                completed_callback();
            }
        }
    };

    /*******************************************************
    冒泡控制


    *******************************************************/
    MapInterface.Popup = {
        _popup: null,

        Show: function (option) {
            option.size = option.size || { w: 200, h: 200 };
            var content = '<iframe src="' + window.rootPath + option.url +
            '" style="margin:0px;padding:0px;width:100%;height:100%;" frameborder="no" scrolling="no" marginwidth="0" marginheight="0"/>';

            if (MapInterface.Popup._popup) {
                MapInterface.Popup._popup.lonlat = option.lonlat;
                MapInterface.Popup._popup.setSize(new OpenLayers.Size(option.size.w, option.size.h));
                MapInterface.Popup._popup.setContentHTML(content);
                MapInterface.Popup._popup.updatePosition();
                MapInterface.Popup._popup.show();
                return;
            }

            if (option.lonlat && option.url) {
                MapInterface.Popup._popup = new OpenLayers.Popup.FramedCloud('marker_popup',
                option.lonlat,
                new OpenLayers.Size(option.size.w, option.size.h),
                content,
                null,
                true
                );
                MapInterface.Popup._popup.autoSize = false;
                MapInterface.Popup._popup.minSize = new OpenLayers.Size(10, 10);

                map.addPopup(MapInterface.Popup._popup);
                MapInterface.Popup._popup.show();
            }
        },

        Hide: function () {
            if (MapInterface.Popup._popup) {
                MapInterface.Popup._popup.hide();
            }
        },

        Remove: function () {
            if (MapInterface.Popup._popup) {
                map.removePopup(MapInterface.Popup._popup);
                MapInterface.Popup._popup = null;
            }
        }
    };
})();