cc.Class({
    extends: cc.Component,
    
    properties: {
        roleLayer:cc.Node,
        rolePrefab_1:cc.Prefab,
    },

    onLoad: function() {
    },
    initFun:function(){
        this.initEnemy()
    },
    //加载敌人
    initEnemy:function(){
        var data = GM.mapManager.getMapRolePos()
        if(data.pos1) {
            var role_1 = cc.instantiate(this.rolePrefab_1)
            role_1.parent = this.roleLayer;
            var pos = this.roleLayer.convertToNodeSpaceAR(data.pos1)
            role_1.setPosition(pos);
        }
        if(data.pos2) {
            var role_1 = cc.instantiate(this.rolePrefab_1)
            role_1.parent = this.roleLayer;
            var pos = this.roleLayer.convertToNodeSpaceAR(data.pos2)
            role_1.setPosition(pos);
        }
    },
});
