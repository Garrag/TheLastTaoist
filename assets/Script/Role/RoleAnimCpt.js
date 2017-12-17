//角色动画组件,检查角色的属性，来控制角色的动画
cc.Class({
    extends: cc.Component,

    properties: {
        aniNode:cc.Node,
    },

    // use this for initialization
    onLoad: function () {
        this.defScaleX = this.aniNode.scaleX;
        this.rigidBody = this.getComponent(cc.RigidBody);
        this.anim = this.aniNode.getComponent(cc.Animation);
        this.anim.play("role_1001_idel")
    },

    update: function (dt) {
        var rigVec = this.rigidBody.getLinearVelocityFromWorldPoint(this.rigidBody.getWorldCenter());
        // cc.log(rigVec);
        if(rigVec.x > 0.1) {
            this.aniNode.scaleX = this.defScaleX;
        }else if(rigVec.x < -0.1) {
            this.aniNode.scaleX = -this.defScaleX;
        }
        if(Math.abs(rigVec.x) > 3 ){
            // cc.log(this.anim.defaultClip);
            if('role_1001_walk' != this.anim.currentClip.name){
                this.anim.play("role_1001_walk")
            }
        }else {
            if('role_1001_idel' != this.anim.currentClip.name){
                this.anim.play("role_1001_idel")
            }
        }
    },
});
