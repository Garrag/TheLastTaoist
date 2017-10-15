cc.Class({
    extends: cc.Component,

    properties: {
        navPosNode: cc.Node,
    },

    onLoad: function () {
        //加入画笔
        var graphicsNode = new cc.Node('MapDebugNode')
        this.g = graphicsNode.addComponent(cc.Graphics)
        graphicsNode.parent = cc.director.getScene()
    },

    start: function (dt) {
        // this.updateCurrentPlatform()
        // this.platform.getRandomNode().drawSelf(this.g, new cc.Color(255,0,0) )
        // var pos = this.node.parent.convertToNodeSpaceAR(this.platform.getRandomNode().pos)
    },
    //获得当前平台
    updateCurrentPlatform:function(){
        this.platform = GM.mapManager.getPlatformByNode(this.getCurrentNavNode())
        return this.platform
    },
    //获得当前导航节点
    getCurrentNavNode:function(){
        var worldPos = this.node.convertToWorldSpaceAR(this.navPosNode.getPosition())
        return GM.mapManager.getNavNodeByPos(worldPos)
    },

});
