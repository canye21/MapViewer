<%@ Page Language="C#" AutoEventWireup="true" CodeFile="Map.aspx.cs" Inherits="WebGis_Map" %>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <title>地图页面</title>
    <link href="openlayers/theme/custom/style.css" rel="stylesheet" type="text/css" />
    <script type="text/javascript" src="openlayers/lib/OpenLayers.js"></script>
    <script type="text/javascript" src="openlayers/extend/Extend.js"></script>
    <script type="text/javascript" src="openlayers/interface/interface.js"></script>
    <style type="text/css">
        html, body
        {
            width: 100%;
            height: 100%;
        }
        *
        {
            margin: 0px;
            padding: 0px;
        }
        body
        {
            overflow: hidden;
        }
        #mapContainer
        {
            position: absolute;
            width: 100%;
            height: 100%;
        }
    </style>
</head>
<body>
    <form id="form1" runat="server">
    <div id="mapContainer">
    </div>
    </form>
    <script type="text/javascript">
        window.rootPath = '<%=ResolveClientUrl("~/") %>';
        CreatMap();
        InitMap();

        function InitMap() {
            var geomCenter = MapInterface.WKT.Read('<%=center %>');
            var originalCenter = MapInterface.Mercator.ProjectForward(MapInterface.WKT.Read('<%=originalCenter %>'));
            var originalZoomLevel = parseInt('<%=originalZoomLevel %>');

            //扩展地图属性
            var mapOption = {
                numZoomLevels: parseInt('<%=maxZoomLevel %>'),
                minZoomLevel: parseInt('<%=minZoomLevel %>'),
                originalCenter: MapInterface.CreateLonLat(originalCenter.x, originalCenter.y),
                originalZoomLevel: originalZoomLevel
            };
            MapInterface.Extend(map, mapOption);

            //配置层属性及投影参数
            var option = {
                numZoomLevels: parseInt('<%=maxZoomLevel %>'),
                minZoomLevel: parseInt('<%=minZoomLevel %>'),
                sphericalMercator: true,
                maxExtent: new OpenLayers.Bounds(-20037508.34, -20037508.34, 20037508.34, 20037508.34),
                maxResolution: 156543.0339,
                units: "m",
                projection: "EPSG:900913"
            };

            //添加地图图层
            var streetMap = new OpenLayers.Layer.TileCache('street', "<%=mapUrl %>", '2d', MapInterface.Extend({ isBaseLayer: true }, option)); //初始化二维图层
            streetMap.events.on({ moveend: MapInterface.MapDataCache.ReDraw }); //二维图层绑定moveend事件
            var statelliteMap = new OpenLayers.Layer.TileCache("sate", "<%=mapUrl %>", "sate", MapInterface.Extend({ format: 'image/jpg' }, option)); //初始化谷歌图层
            var routeMap = new OpenLayers.Layer.TileCache("route", "<%=mapUrl %>", "route", MapInterface.Extend({ format: 'image/png', isBaseLayer: false }, option)); //初始化路线图层
            routeMap.visibility = false;
            statelliteMap.events.on({ moveend: MapInterface.MapDataCache.ReDraw }); //谷歌绑定moveend事件
            map.addLayers([streetMap, statelliteMap, routeMap]);

            var c = MapInterface.Mercator.ProjectForward(geomCenter);
            MapInterface.SetCenter(c.x, c.y, parseInt('<%=defaultLevel %>'));
        }
    </script>
</body>
</html>
