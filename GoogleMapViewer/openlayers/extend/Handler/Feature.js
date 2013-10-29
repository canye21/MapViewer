OpenLayers.Handler.Feature.prototype.EVENTMAP = {
    'click': { 'in': 'click', 'out': 'clickout' },
    'contextmenu': { 'in': 'rclick', 'out': null },
    'mousemove': { 'in': 'over', 'out': 'out' },
    'dblclick': { 'in': 'dblclick', 'out': null },
    'mousedown': { 'in': null, 'out': null },
    'mouseup': { 'in': null, 'out': null }
};

OpenLayers.Handler.Feature.prototype.handle = function(evt) {
    if (this.feature && !this.feature.layer) {
        // feature has been destroyed
        this.feature = null;
    }
    var type = evt.type;

    type = 2 == evt.button ? 'contextmenu' : type; //判断是否是右键

    var handled = false;
    var previouslyIn = !!(this.feature); // previously in a feature
    var click = (type == "click" || type == "dblclick" || type == "contextmenu");
    this.feature = this.layer.getFeatureFromEvent(evt);
    if (this.feature && !this.feature.layer) {
        // feature has been destroyed
        this.feature = null;
    }
    if (this.lastFeature && !this.lastFeature.layer) {
        // last feature has been destroyed
        this.lastFeature = null;
    }
    if (this.feature) {
        var inNew = (this.feature != this.lastFeature);
        if (this.geometryTypeMatches(this.feature)) {
            // in to a feature
            if (previouslyIn && inNew) {
                // out of last feature and in to another
                if (this.lastFeature) {
                    this.triggerCallback(type, 'out', [this.lastFeature]);
                }
                this.triggerCallback(type, 'in', [this.feature]);
            } else if (!previouslyIn || click) {
                // in feature for the first time
                this.triggerCallback(type, 'in', [this.feature]);
            }
            this.lastFeature = this.feature;
            handled = true;
        } else {
            // not in to a feature
            if (this.lastFeature && (previouslyIn && inNew || click)) {
                // out of last feature for the first time
                this.triggerCallback(type, 'out', [this.lastFeature]);
            }
            // next time the mouse goes in a feature whose geometry type
            // doesn't match we don't want to call the 'out' callback
            // again, so let's set this.feature to null so that
            // previouslyIn will evaluate to false the next time
            // we enter handle. Yes, a bit hackish...
            this.feature = null;
        }
    } else {
        if (this.lastFeature && (previouslyIn || click)) {
            this.triggerCallback(type, 'out', [this.lastFeature]);
        }
    }
    return handled;
};

OpenLayers.Handler.Feature.prototype.triggerCallback = function(type, mode, args) {
    var key = this.EVENTMAP[type][mode];
    if (key) {
        if (type == 'click' && this.up && this.down) {
            // for click/clickout, only trigger callback if tolerance is met
            var dpx = Math.sqrt(
                    Math.pow(this.up.x - this.down.x, 2) +
                    Math.pow(this.up.y - this.down.y, 2)
                );
            if (dpx <= this.clickTolerance) {
                this.callback(key, args);
            }
        }
        else {
            this.callback(key, args);
        }
    }
};