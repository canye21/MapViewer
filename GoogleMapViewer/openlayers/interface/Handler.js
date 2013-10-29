MapControls.Handler = {

    //采集处理程序
    Collect: function () {
        var geom = arguments[0].feature.geometry;
        switch (geom.CLASS_NAME) {
            case 'OpenLayers.Geometry.Point':
                if (top.window.callback.savePoint) {
                    top.window.callback.savePoint(geom);
                }
                else {
                    SavePoint(MapInterface.Control.GetControlByID('collectPointControl').cacheInfo, geom);
                }
                break;
            case 'OpenLayers.Geometry.LineString':
                SaveLine(MapInterface.Control.GetControlByID('collectLineControl').cacheInfo, geom);
                break;
            case 'OpenLayers.Geometry.Polygon':
                SavePolygon(MapInterface.Control.GetControlByID('collectPolygonControl').cacheInfo, geom);
                break;
        }
    },

    //右键处理程序
    RClick: function (feature) {
        var event = window.event;
        ContextMenu(feature.jsonInfo, event.clientX, event.clientY);
    },

    //单击处理程序
    Click: function (feature) {
        if (feature.attributes.feature.attributes["type"] == 'diagram') {
            DiagramClickEvent(feature.attributes.feature);
        } else {
            ClickEvent(feature.attributes.feature);              
        }
    },

    /*图元拖动事件*/
    OnDrag: function (feature, pixel) {
        DragingPoint(feature.jsonInfo, feature.geometry)
    },

    OnDragComplete: function (feature, pixel) {
        switch (feature.geometry.CLASS_NAME) {
            case 'OpenLayers.Geometry.Point':
                {
                    if (feature.jsonInfo) {
                        UpdatePoint(feature.jsonInfo, feature.geometry);
                    }
                    break;
                }
            case 'OpenLayers.Geometry.LineString':
                {
                    break;
                }
            case 'OpenLayers.Geometry.Polygon':
                {
                    break;
                }
        }
    }
};


/*Marker 的处理函数*/
var MarkerHandler = {
    //鼠标移上去冒泡
    MouseOver: function (evt) {

    },

    //鼠标单击
    Click: function (evt) {

    }
};
function DiagramClickEvent(json) {
    TaskDiagramEnablePost(json); 
}
//单击事件
function ClickEvent(json) {
    var modular = $('#hfModular', $(top.window.frames['mapFrame'].document)).val();
    switch (modular) {
        case 'taskPostDistribution':
            TaskPostDistributionClick(json);
            break;
        case 'taskEnablePost':
            TaskEnablePost(json);
            break;
    }

}

//勤务示意图启禁岗位
function TaskDiagramEnablePost(json) {
    $.post('../handler/TaskPostDeploymentHandler.ashx', { opt: 'taskDiagramPointEnable', postCode: json.key, rank: json.attributes["rank"].toString(), taskCode: parent.taskCode, diagramCode: parent.diagramCode, random: getRandom() }, function (res) {
        if (res != 'fail') {
            parent.MapInterface.MapDataCache.ReDrawByLayerName("044");  //刷新层   
            parent.window.frames['mainFrame'].refreshEnable('044'); 
        }
    });
}

//启禁岗位
function TaskEnablePost(json) {
    $.post('../handler/TaskPostDeploymentHandler.ashx', { opt: 'taskPointEnable', code: json.key, item: json.item, task: $('#hfItem', $(top.window.frames["taskFrame"].document)).val(), random: getRandom() }, function (res) {
        if (res != 'fail') {
            MapInterface.MapDataCache.ReDrawByLayerName('044');
            top.window.frames['taskFrame'].refreshEnable('044');
        }
    });

}

//选择分配
function TaskPostDistributionClick(json) {
    if (top.window.frames['selectFrame'].appendSelectPost != null) {
        top.window.frames['selectFrame'].appendSelectPost({ code: json.key, name: json.attributes.name, number: json.attributes.number, enableClick: true });
    }
}

/*保存点*/
function UpdatePoint(json, geom) {
    switch (json.layerName) {
        case 'taskPlanInformation':
            UpdateTaskPlanInformation(json.code, geom);
            break;
        case 'taskDropPoint':
            UpdateTaskDrop(json.code, geom);
            break;
        default:
            break;
    }
}

/***保存点***/
function SavePoint(json, geom) {
    switch (json.layerName) {
        case 'taskPlanDrop':
            SaveTaskPlanDrop(json, geom)
            break;
        default:
            SaveCommonPoint(json, geom);
            break;
    }
}

//保存常规点
function SaveCommonPoint(json, geom) {
    $.post('../Handler/FeatureHandler.ashx',
         MapInterface.Extend({ opt: 'savePoint', coord: MapInterface.WKT.Write(geom), random: getRandom() }, json),
         function (res) {
             if (res == 'fail') {
                 alert('保存失败！');
             } else {
                 ShowPoints(json);
             }
         });
}

//添加勤务规划拖拽点
function SaveTaskPlanDrop(json, geom) {
    ShowLoadingImage();
    $.post('../Handler/TaskPlanHandler.ashx',
         MapInterface.Extend({ opt: 'addDropPoint', task: JSON.stringify(top.window.frames['taskFrame'].task), coord: MapInterface.WKT.Write(geom), random: getRandom() }, json),
         function (res) {
             if (res == 'fail') {
                 alert('添加失败！');
             } else if (res == 'error') {
                 alert('拖拽点添加位置有误！');
             } else {
                 ShowTaskPlan(res, 'false');
             }
         });
}

/*保存线*/
function SaveLine(json, geom) {
    switch (json.layerName) {
        case 'taskPlanConnection':
            SaveTaskPlanConnection(json, geom)
            break;
        default:
            break;
    }
}

//保存勤务规划连线点
function SaveTaskPlanConnection(json, geom) {
    ShowLoadingImage();
    $.post('../Handler/TaskPlanHandler.ashx',
         MapInterface.Extend({ opt: 'addConnectionPoint', task: JSON.stringify(top.window.frames['taskFrame'].task), coord: MapInterface.WKT.Write(geom), random: getRandom() }, json),
         function (res) {
             if (res == 'fail') {
                 HiddenLoadingImage();
                 alert('添加失败！');
             } else {
                 ShowTaskPlan(res, 'false');
             }
         });
}

/*保存面*/
function SavePolygon(json, geom) {
    switch (json.layerName) {
        case 'taskPostDistributionPost':
            SaveTaskPostDistributionPost(json, geom)
            break;
        default:
            break;
    }
}

//多边形选中岗位
function SaveTaskPostDistributionPost(json, geom) {
    $.post('../Handler/TaskPostDeploymentHandler.ashx',
            MapInterface.Extend({ "opt": "getSelectPosts", "coord": MapInterface.WKT.Write(geom), "random": getRandom() }, json),
            function (res) {
                if (res != 'fail') {
                    top.window.frames['postSelectFrame'].initPosts(JSON.parse(res));
                } else {
                    alert('选择岗位失败！');
                }
            });
}

/*显示Point*/
function ShowPoints(json) {
    switch (json.layerName) {
        case 'taskPostDeploymentPost':
            ShowTaskPostDeploymentPosts(json);
            break;
        case 'taskPostDistributionPost':
            ShowTaskPostDistributionPosts(json);
            break;
        default:
            ShowCommonPoints(json);
            break;
    }
}

//显示勤务提取后的岗位信息
function ShowTaskPostDeploymentPosts(json) {
    ShowLoadingImage();
    $.post('../Handler/TaskPostDeploymentHandler.ashx',
            MapInterface.Extend({ opt: 'showTaskPostDeploymentPosts', random: getRandom() }, json),
            function (res) {
                if (res != 'fail')
                    MapInterface.Point.Show(json, res);
                HiddenLoadingImage();
            });
}

//显示勤务分配后的岗位信息
function ShowTaskPostDistributionPosts(json) {
    ShowLoadingImage();
    $.post('../Handler/TaskPostDeploymentHandler.ashx',
            MapInterface.Extend({ opt: 'showTaskPostDistributionPosts', random: getRandom() }, json),
            function (res) {
                if (res != 'fail')
                    MapInterface.Point.Show(json, res);
                if (json.enableClick)
                    MapInterface.Layer.EnableClick(json.layerName);
                HiddenLoadingImage();
            });
}

//显示普通点
function ShowCommonPoints(json) {
    $.post('../Handler/FeatureHandler.ashx',
            MapInterface.Extend({ opt: 'showPoints', random: getRandom() }, json),
            function (res) {
                if (res != 'fail')
                    MapInterface.Point.Show(json, res);
            });
}

/*显示Line*/
function ShowLines(json) {
    switch (json.layerName) {
        case '':
            break;
        default:
            ShowCommonLines(json);
            break;
    }
}

function ShowCommonLines(json) {

}

/*显示Marker*/
function ShowMarkers(json) {

}

/*显示Polygon*/
function ShowPolygons(json) {

}

/*拖动点*/
function DragingPoint(json, geom) {
    switch (json.layerName) {
        case 'taskDropPoint':
            DragingDropPoints(json, geom);
            break;
    }
}