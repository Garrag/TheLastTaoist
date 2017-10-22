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
        this.targetNavNode = null;
        this.schedule(function(){
            if(this.getCurrentNavNode() == this.targetNavNode && this.platform){
                this.targetNavNode = this.platform.getRandomNode();
                // this.g.clear()
                // this.targetNavNode.drawSelf(this.g, new cc.Color(255,0,0) );
                this.getComponent('Steering').setTargetPos(this.targetNavNode.pos);
            }else {
                this.updateCurrentPlatform()
            }
        }, 2);
    },

    start: function (dt) {
        // this.updateCurrentPlatform()
        // if(this.platform) {
        //     var navNode = this.platform.getRandomNode();
        //     cc.log('updateCurrentPlatform');
        //     navNode.drawSelf(this.g, new cc.Color(255,0,0) );
        //     this.getComponent('Steering').setTargetPos(navNode.pos);
        // }
    },

    //获得当前平台
    updateCurrentPlatform:function(){
        var currentNavNode = this.getCurrentNavNode()
        this.targetNavNode = currentNavNode;
        this.platform = GM.mapManager.getPlatformByNode(currentNavNode)
        return this.platform
    },

    //获得当前导航节点
    getCurrentNavNode:function(){
        var worldPos = this.node.convertToWorldSpaceAR(this.navPosNode.getPosition())
        var node = GM.mapManager.getNavNodeByPos(worldPos)
        return node
    },

});
