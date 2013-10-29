/* Copyright (c) 2006-2010 by OpenLayers Contributors (see authors.txt for 
* full list of contributors). Published under the Clear BSD license.  
* See http://svn.openlayers.org/trunk/openlayers/license.txt for the
* full text of the license. */


/**
* @requires OpenLayers/Control.js
* @requires OpenLayers/Feature/Vector.js
* @requires OpenLayers/Handler/Feature.js
* @requires OpenLayers/Layer/Vector/RootContainer.js
*/

/**
* Class: OpenLayers.Control.SelectFeature
* The SelectFeature control selects vector features from a given layer on 
* click or hover. 
*
* Inherits from:
*  - <OpenLayers.Control>
*/
OpenLayers.Control.FeatureContextmenu = OpenLayers.Class(OpenLayers.Control, {

    /**
    * Constant: EVENT_TYPES
    *
    * Supported event types:
    *  - *beforefeaturehighlighted* Triggered before a feature is highlighted
    *  - *featurehighlighted* Triggered when a feature is highlighted
    *  - *featureunhighlighted* Triggered when a feature is unhighlighted
    */
    EVENT_TYPES: ['featureContextMenu'],

    /**
    * Property: layer
    * {<OpenLayers.Layer.Vector>} The vector layer with a common renderer
    * root for all layers this control is configured with (if an array of
    * layers was passed to the constructor), or the vector layer the control
    * was configured with (if a single layer was passed to the constructor).
    */
    layer: null,

    type: OpenLayers.Control.TYPE_TOGGLE,


    /**
    * APIProperty: callbacks
    * {Object} The functions that are sent to the handlers.feature for callback
    */
    callbacks: null,

    /**
    * Property: handlers
    * {Object} Object with references to  <OpenLayers.Handler>
    *     instances.
    */
    handler: null,

    /**
    * Constructor: OpenLayers.Control.SelectFeature
    * Create a new control for selecting features.
    *
    * Parameters:
    * layers - {<OpenLayers.Layer.Vector>}, or an array of vector layers. The
    *     layer(s) this control will select features from.
    * options - {Object} 
    */
    initialize: function (layer, options) {
        this.EVENT_TYPES =
            OpenLayers.Control.FeatureContextmenu.prototype.EVENT_TYPES.concat(
            OpenLayers.Control.prototype.EVENT_TYPES
        );

        // concatenate events specific to this control with those from the base
        OpenLayers.Control.prototype.initialize.apply(this, [options]);
        //this.events.fallThrough = true;

        this.layer = layer;

        this.callbacks = OpenLayers.Util.extend({
            rclick: this.OnContextmenuFeature
        },
         this.callbacks);
        this.handler = new OpenLayers.Handler.Feature(this, this.layer, this.callbacks);
    },

    /**
    * Method: destroy
    */
    destroy: function () {
        if (this.active && this.layers) {
            this.map.removeLayer(this.layer);
        }
        OpenLayers.Control.prototype.destroy.apply(this, arguments);
        if (this.layers) {
            this.layer.destroy();
        }
    },

    /**
    * Method: activate
    * Activates the control.
    * 
    * Returns:
    * {Boolean} The control was effectively activated.
    */
    activate: function () {
        if (!this.active) {
            this.handler.activate();
        }
        return OpenLayers.Control.prototype.activate.apply(
            this, arguments
        );
    },

    /**
    * Method: deactivate
    * Deactivates the control.
    * 
    * Returns:
    * {Boolean} The control was effectively deactivated.
    */
    deactivate: function () {
        if (this.active) {
            this.handler.deactivate();
        }
        return OpenLayers.Control.prototype.deactivate.apply(
            this, arguments
        );
    },

    /**
    * Method: 右键处理
    *
    * Parameters:
    * feature - {<OpenLayers.Feature.Vector>} 
    */
    OnContextmenuFeature: function (feature) {
        if (feature && feature.layer == this.layer) {
            this.events.triggerEvent("featureContextMenu", feature);
        }
    },

    CLASS_NAME: "OpenLayers.Control.FeatureContextmenu"
});
