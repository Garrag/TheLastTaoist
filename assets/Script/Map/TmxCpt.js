cc.Class({
    extends: cc.Component,

    properties: {
        debug: false,
    },

    onLoad: function() {
        this.tiledMap = this.node.getComponent(cc.TiledMap);
        // cc.log(this.tiledMap);
        for (var key in this.tiledMap.allLayers()) {
            if (this.tiledMap.allLayers()[key].getLayerName() == 'ground') {
                var layer = this.tiledMap.allLayers()[key];
                cc.log(layer.getTiles());
            }
        }


        // cc.log(this.tiledMap.allLayers());
        // cc.log(this.tiledMap.getObjectGroups());


    },

    // called every frame, uncomment this function to activate update callback
    update: function(dt) {

    },
});