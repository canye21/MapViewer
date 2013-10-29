/*
最小地图显示级别
*/
OpenLayers.Map.prototype.minZoomLevel = 1;
OpenLayers.Map.prototype.originalCenter = null;
OpenLayers.Map.prototype.originalZoomLevel = 1;

OpenLayers.Map.prototype.getMinZoomLevel = function () {
    var minZoomLevel = null;
    if (this.baseLayer != null) {
        minZoomLevel = this.baseLayer.minZoomLevel;
    }
    return minZoomLevel;
};

OpenLayers.Map.prototype.isValidZoomLevel = function (zoomLevel) {
    return ((zoomLevel != null) &&
                (zoomLevel >= 0) &&
                (zoomLevel >= this.getMinZoomLevel()) &&
                (zoomLevel < this.getNumZoomLevels()));
};

OpenLayers.Map.prototype.zoomToMaxExtent = function (options) {
    if (this.originalCenter) {
        this.originalZoomLevel = this.originalZoomLevel || this.minZoomLevel;
        this.setCenter(this.originalCenter, this.originalZoomLevel);
    }
    else {
        //restricted is true by default
        var restricted = (options) ? options.restricted : true;

        var maxExtent = this.getMaxExtent({
            'restricted': restricted
        });
        this.zoomToExtent(maxExtent);
    }
};


/*
添加工具 
*/
OpenLayers.Map.prototype.AddControls = function (panel, controls) {
    if (controls) {
        if (!(controls instanceof Array)) {
            controls = [controls];
        }

        var that = this;
        for (var i = 0, len = controls.length; i < len; ++i) {
            if (controls[i].type === OpenLayers.Control.TYPE_TOOL || controls[i].type == null) {
                controls[i].events.on({ 'activate': that.DeactivateRestsTool });
            }
        }

        if (panel) {
            panel.addControls(controls);
        }
        else {
            this.addControls(controls);
        }
    }

    panel = null;
    controls = null;
};

/*删除工具*/
OpenLayers.Map.prototype.RemoveControl = function (panel, control) {
    if (panel && control) {
        panel.div.removeChild(control.panel_div);
        OpenLayers.Util.removeItem(panel.controls, control);
    }

    //make sure control is non-null and actually part of our map
    if ((control) && (control == this.getControl(control.id))) {
        if (control.div && (control.div.parentNode == this.viewPortDiv)) {
            this.viewPortDiv.removeChild(control.div);
        }
        OpenLayers.Util.removeItem(this.controls, control);
    }
};

/*
取消其他的选中工具 
*/
OpenLayers.Map.prototype.DeactivateRestsTool = function (obj) {
    var control = obj != undefined ? obj.object : undefined;

    if (control) {
        var controls = this.map.controls;

        for (var i = controls.length - 1; i >= 0; i--) {
            if (controls[i] && controls[i] != control) {
                //取消地图切换、右键、工具条
                if ((controls[i].controlType && controls[i].controlType == 'switchMap')
                || (controls[i].CLASS_NAME && (controls[i].CLASS_NAME == 'OpenLayers.Control.FeatureContextmenu'
                || controls[i].CLASS_NAME == 'OpenLayers.Control.FeatureMouseMoveHandle'
                || controls[i].CLASS_NAME == 'OpenLayers.Control.Panel'))) {
                    continue;
                }
                //拖动和绘制取消互斥
                if ((control.CLASS_NAME == 'OpenLayers.Control.DrawFeature' && controls[i].CLASS_NAME == 'OpenLayers.Control.DragFeature')
                || (control.CLASS_NAME == 'OpenLayers.Control.DragFeature' && controls[i].CLASS_NAME == 'OpenLayers.Control.DrawFeature')) {
                    continue;
                }

                if (controls[i].active && (controls[i].type != OpenLayers.Control.TYPE_BUTTON || controls[i].type == null)) {
                    controls[i].deactivate();
                }
            }
        }
    }

    controls = null;
    control = null;
};