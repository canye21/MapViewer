
OpenLayers.Popup.prototype.setSize = function (contentSize) {
    this.size = contentSize.clone();

    // if our contentDiv has a css 'padding' set on it by a stylesheet, we 
    //  must add that to the desired "size". 
    var contentDivPadding = this.getContentDivPadding();
    var wPadding = contentDivPadding.left + contentDivPadding.right;
    var hPadding = contentDivPadding.top + contentDivPadding.bottom;

    // take into account the popup's 'padding' property
    this.fixPadding();
    wPadding += this.padding.left + this.padding.right;
    hPadding += this.padding.top + this.padding.bottom;

    //将关闭按钮的空间取消
    // make extra space for the close div
//    if (this.closeDiv) {
//        var closeDivWidth = parseInt(this.closeDiv.style.width);
//        wPadding += closeDivWidth + contentDivPadding.right;
//    }

    //increase size of the main popup div to take into account the 
    // users's desired padding and close div.        
    this.size.w += wPadding;
    this.size.h += hPadding;

    //now if our browser is IE, we need to actually make the contents 
    // div itself bigger to take its own padding into effect. this makes 
    // me want to shoot someone, but so it goes.
    if (OpenLayers.Util.getBrowserName() == "msie") {
        this.contentSize.w +=
                contentDivPadding.left + contentDivPadding.right;
        this.contentSize.h +=
                contentDivPadding.bottom + contentDivPadding.top;
    }

    if (this.div != null) {
        this.div.style.width = this.size.w + "px";
        this.div.style.height = this.size.h + "px";
    }
    if (this.contentDiv != null) {
        this.contentDiv.style.width = contentSize.w + "px";
        this.contentDiv.style.height = contentSize.h + "px";
    }
};
