var BaseScript = require('BaseScript')
cc.Class({
    extends: BaseScript,
    properties: {
    },
    onLoad(){
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
        this.addPopupByName('prefab/Common/UpdateNode', {mask:true})
    }
});
