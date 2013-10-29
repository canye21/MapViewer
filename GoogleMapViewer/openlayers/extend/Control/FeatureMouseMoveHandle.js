OpenLayers.Control.FeatureMouseMoveHandle = OpenLayers.Class(OpenLayers.Control, {

    EVENT_TYPES: ['featureMouseMove', 'featureMouseOver', 'featureMouseOut'],

    /**
    * APIProperty: geometryTypes
    * {Array(String)} To restrict selecting to a limited set of geometry types,
    *     send a list of strings corresponding to the geometry class names.
    */
    geometryTypes: null,

    /**
    * Property: layer
    * {<OpenLayers.Layer.Vector>}
    */
    layer: null,

    type: OpenLayers.Control.TYPE_TOGGLE,

    /**
    * Property: feature
    * {<OpenLayers.Feature.Vector>}
    */
    feature: null,

    initialize: function (layer, options) {
        this.EVENT_TYPES =
            OpenLayers.Control.FeatureHandle.prototype.EVENT_TYPES.concat(
            OpenLayers.Control.prototype.EVENT_TYPES
        );

        OpenLayers.Control.prototype.initialize.apply(this, [options]);

        this.layer = layer;
        var callbacks = {
            over: this.overFeature,
            out: this.outFeature
        };

        this.callbacks = OpenLayers.Util.extend(callbacks, this.callbacks);
        this.handlers = {
            feature: new OpenLayers.Handler.Feature(
                this, this.layer, this.callbacks,
                { geometryTypes: this.geometryTypes }
            )
        };
    },

    /**
    * APIMethod: activate
    * Activate the control and the feature handler.
    * 
    * Returns:
    * {Boolean} Successfully activated the control and feature handler.
    */
    activate: function () {
        return (this.handlers.feature.activate() &&
                OpenLayers.Control.prototype.activate.apply(this, arguments));
    },

    /**
    * APIMethod: deactivate
    * Deactivate the control and all handlers.
    * 
    * Returns:
    * {Boolean} Successfully deactivated the control.
    */
    deactivate: function () {
        this.handlers.feature.deactivate();
        this.feature = null;
        return OpenLayers.Control.prototype.deactivate.apply(this, arguments);
    },

    /**
    * Method: overFeature
    * Called when the feature handler detects a mouse-over on a feature.
    *     This activates the drag handler.
    *
    * Parameters:
    * feature - {<OpenLayers.Feature.Vector>} The selected feature.
    */
    overFeature: function (feature) {
        this.feature = feature;
        this.over = true;

        this.events.triggerEvent("featureMouseOver", {
            feature: feature
        });


        var o = this;
        this.layer.events.register("mousemove", this.layer, function (evt) {
            o.mouseMove();
        });
    },

    mouseMove: function () {
        if (this.over === true && this.feature != null) {
            var evt = this.handlers.feature.evt;
            var px = new OpenLayers.Pixel(evt.pageX, evt.pageY);
            var lonlat = this.map.getLonLatFromViewPortPx(px);

            this.events.triggerEvent("featureMouseMove", {
                feature: this.feature,
                lonlat: lonlat.transform(new OpenLayers.Projection(map.projection), new OpenLayers.Projection(map.displayProjection))
            });
        }
    },

    /**
    * Method: outFeature
    * Called when the feature handler detects a mouse-out on a feature.
    *
    * Parameters:
    * feature - {<OpenLayers.Feature.Vector>} The feature that the mouse left.
    */
    outFeature: function (feature) {
        if (this.feature && this.feature.id == feature.id) {
            this.events.triggerEvent("featureMouseOut", {
                feature: feature
            });
            this.over = false;
            //this.feature = null;

            this.layer.events.remove("mousemove");
        }
    },

    /**
    * Method: setMap
    * Set the map property for the control and all handlers.
    *
    * Parameters: 
    * map - {<OpenLayers.Map>} The control's map.
    */
    setMap: function (map) {
        this.handlers.feature.setMap(map);
        OpenLayers.Control.prototype.setMap.apply(this, arguments);
    },

    CLASS_NAME: "OpenLayers.Control.FeatureMouseMoveHandle"
});