//角色组件,角色控制器
cc.Class({
    extends: cc.Component,

    properties: {
        navPosNode: cc.Node,    //自己位置的确认点
    },

    onLoad: function () {
        //加入画笔
        var graphicsNode = new cc.Node('MapDebugNode')
        this.g = graphicsNode.addComponent(cc.Graphics)
        graphicsNode.parent = cc.director.getScene()
        //目标节点
        this.targetNavNode = null;
        //两秒进行一次巡逻
        this.schedule(function () {
            if (this.getCurrentNavNode() == this.targetNavNode && this.platform) {
                this.targetNavNode = this.platform.getRandomNode();
                // 给角色设定目标
                this.getComponent('Steering').setTargetPos(this.targetNavNode.pos);
            } else {
                this.updateCurrentPlatform()
            }
        }, 2);
    },

    //获得当前平台
    updateCurrentPlatform: function () {
        var currentNavNode = this.getCurrentNavNode()
        this.targetNavNode = currentNavNode;
        this.platform = GM.mapManager.getPlatformByNode(currentNavNode)
        return this.platform
    },

    //获得当前导航节点
    getCurrentNavNode: function () {
        var worldPos = this.node.convertToWorldSpaceAR(this.navPosNode.getPosition())
        var node = GM.mapManager.getNavNodeByPos(worldPos)
        return node
    },

});
