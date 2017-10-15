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
        cc.director.getPhysicsManager().enabled = true;
        // cc.director.getPhysicsManager().gravity = cc.v2(0, -320*3);
        cc.director.getPhysicsManager().debugDrawFlags = 
        // cc.PhysicsManager.DrawBits.e_aabbBit |
        // cc.PhysicsManager.DrawBits.e_pairBit |
        // cc.PhysicsManager.DrawBits.e_centerOfMassBit |
        cc.PhysicsManager.DrawBits.e_jointBit |
        cc.PhysicsManager.DrawBits.e_shapeBit ;
        //加载地图
        this.mapManager.initFun()
        GM.mapManager = this.mapManager
        //加载敌人
        this.enemyManager.initFun()
        GM.enemyManager = this.enemyManager
        //暴露自己
        GM.gameManager = this.gameManager
    },

});