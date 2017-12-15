var MapManager = require('MapManager')
var EnemyManager = require('EnemyManager')

cc.Class({
    extends: cc.Component,

    properties: {
        enemyManager:EnemyManager,
        mapManager:MapManager,
    },

    // use this for initialization
    onLoad: function() {
        //开启物理模式
        cc.director.getPhysicsManager().enabled = true;
        //初始化管理器
        GM.mapManager = this.mapManager
        GM.enemyManager = this.enemyManager
        GM.gameManager = this
        // cc.director.getPhysicsManager().gravity = cc.v2(0, -320*3);
        // cc.director.getPhysicsManager().debugDrawFlags = 
        // // cc.PhysicsManager.DrawBits.e_aabbBit |
        // // cc.PhysicsManager.DrawBits.e_pairBit |
        // // cc.PhysicsManager.DrawBits.e_centerOfMassBit |
        // cc.PhysicsManager.DrawBits.e_jointBit |
        // cc.PhysicsManager.DrawBits.e_shapeBit ;
        //加载地图
        this.mapManager.initFun()
        //加载敌人
        this.enemyManager.initFun()
        //加载玩家
        this.initPlayer()
    },
    //加载玩家
    initPlayer:function () {
    },
    //重新设置游戏
    resetGame:function () {
    },
    //暂停游戏
    pauseGame:function () {
    },
    //打开游戏设置
    openSetting:function(){
    },
});