cc.Class({
    extends: cc.Component,

    properties: {
        updateNode:cc.Node,
    },
    onLoad(){
        this.updateNode.active = false;
    },
    start() {

    },
    //进入游戏
    joinGame(params) {
        cc.director.loadScene('Test')
    },
    //打开设置菜单
    openSetting(params) {
    },
    //打开热更新面板
    openHotUpdateNode(){
        this.updateNode.active = true;
    }
});
