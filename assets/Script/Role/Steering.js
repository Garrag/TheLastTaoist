//行为执行脚本
cc.Class({
    extends: cc.Component,
    properties: {
        maxSpeed:1000,
    },
    onLoad: function () {
        this.rigidBody = this.getComponent(cc.RigidBody)
        var mouseNode = new cc.Node('MouseNode')
        mouseNode.parent = cc.director.getScene()
        // cc.log()
        mouseNode.width = cc.winSize.width
        mouseNode.height = cc.winSize.height
        mouseNode.x = cc.winSize.width/2
        mouseNode.y = cc.winSize.height/2
        // mouseNode.on(cc.Node.EventType.MOUSE_ENTER, this.updateTargetPos, this);
        // mouseNode.on(cc.Node.EventType.MOUSE_MOVE, this.updateTargetPos, this);
        // mouseNode.on(cc.Node.EventType.MOUSE_LEAVE, this.updateTargetPos, this);
    },
    //更新目标点
    updateTargetPos:function(event){
        var pos = event.getLocation()
        this.targetPos = cc.v2(pos.x, pos.y);
    },
    setTargetPos:function(targetPos){
        this.targetPos = targetPos;
    },
    start:function(){
        // cc.log(this.rigidBody);
    },
    update: function (dt) {
        if(this.targetPos){
            this.rigidBody.applyLinearImpulse(this.arrive(this.targetPos), this.rigidBody.getLocalCenter() )
        }else {
            // cc.log(this.targetPos)
        }
        // this.rigidBody.applyForceToCenter(cc.v2(1000, 0))
        // cc.log(this.rigidBody.linearVelocity)
    },
    //靠近
    seek:function(targetPos){
        var desiredVelocity = targetPos.sub(this.rigidBody.getWorldPosition()).normalize().mul(this.maxSpeed)   //).normalized * maxSpeed;
        return desiredVelocity.sub(this.rigidBody.linearVelocity);
    },
    //离开
    flee:function(targetPos){
        var panicDisSq = 100*100;
        if( this.rigidBody.getWorldPosition().sub(targetPos).magSqr() > panicDisSq ){
           return cc.v2(0, 0); 
        }
        var desiredVelocity = this.rigidBody.getWorldPosition().sub(targetPos).normalize().mul(this.maxSpeed)   //).normalized * maxSpeed;
        return desiredVelocity.sub(this.rigidBody.linearVelocity);
    },
    //抵达
    arrive:function(targetPos){
        var toTarget = targetPos.sub(this.rigidBody.getWorldPosition())
        var dist = toTarget.mag()
        if(dist > 0){
            var deceleration = 0.2;
            var speed = dist/deceleration*1;  //根据距离 计算当前的速度
            speed = Math.min(speed, this.maxSpeed)
            var desiredVelocity = toTarget.mul(speed/dist)
            return  desiredVelocity.sub(this.rigidBody.linearVelocity)
        }
        return cc.v2(0, 0);
    }

});
