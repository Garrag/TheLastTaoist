//地图管理器，管理当前地图

cc.Class({
    extends: cc.Component,

    properties: {
        currentMap:cc.TiledMap
    },
    onLoad: function() {
        // var groundLayer = this.currentMap.getLayer('ground');
        // this.initFun()                  //初始化
        // this.initPhysicsCollider()      //创建物理节点
    },
    //初始化
    initFun:function(){
        this.hideObjLayer()
        this.initPhysicsCollider()
    },
    //隐藏地图所有的对象节点
    hideObjLayer:function(){
        var objGroups = this.currentMap.getObjectGroups();
        for (var i = 0; i < objGroups.length; ++i) {
            var ps = objGroups[i].getObjects()
            for (var j = 0; j < ps.length; j++) {
                var element = ps[j];
                element.sgNode.visible = false; 
            }   
        }
    },
    //创建物理节点
    initPhysicsCollider:function(){
        this.PhysicsStaticNode = new cc.Node('PhysicsStatic');  
        this.PhysicsStaticNode.parent = cc.director.getScene();

        var staticBoxObj = this.currentMap.getObjectGroup('static') //获取地图带有的对象
        if(!staticBoxObj)return;

        var boxArr = staticBoxObj.getObjects()            
        for (var i = 0; i < boxArr.length; i++) {
            var boxNode = boxArr[i];
            var data = boxNode.getProperties();
            // cc.log(data)
            if(data.points){ //多边形
                var offset = this.exchangePos(cc.p(data.x, data.y))
                this.createPhyPolygon({offset:offset, points:data.points})
            }else { //盒子
                var offset = this.exchangePos(cc.p(data.x, data.y))
                var size = cc.size(data.width, data.height);
                this.createPhyBox({offset :offset, size : size });
            }
        }
    },
    //地图坐标转换
    exchangePos:function(pos){
        var mapSize = this.currentMap.node.getContentSize()
        var offset = cc.p(pos.x, mapSize.height - pos.y)  //对于地图左下角的偏移量
        //转化对世界左边的偏移量
        var ccy = cc.winSize.height - mapSize.height;   //地图和游戏的差值
        offset.y += ccy/2;
        return offset
    },
    //创建一个矩形碰撞体 
    createPhyBox:function(args){
        args = args || {}
        var offset = args.offset
        var size = args.size
        offset.x += size.width/2;
        offset.y -= size.height/2;
        var phyCpt = this.PhysicsStaticNode.addComponent(cc.PhysicsBoxCollider)   //
        // cc.log(phyCpt);
        phyCpt.offset = offset
        phyCpt.size = size
        phyCpt.apply()
        phyCpt.body.type = cc.RigidBodyType.Static;
    },
    //创建一个多边形碰撞体 
    createPhyPolygon:function(args){
        args = args || {}
        var offset = args.offset
        var points = args.points
        var phyCpt = this.PhysicsStaticNode.addComponent(cc.PhysicsPolygonCollider)
        // cc.log(phyCpt);
        phyCpt.offset = offset
        var vec2Arr = []
        for (var i = 0; i < points.length; i++) {
            var point = points[i];
            vec2Arr.push(cc.p(point.x, -point.y))
        }
        phyCpt.points = vec2Arr
        phyCpt.apply()
        phyCpt.body.type = cc.RigidBodyType.Static;
    },
    //创建导航图
    createNavMap:function(){
        return null;
    },
    //获取当前地图角色出生点
    getMapRolePos:function(){
        var posMap = {}
        var staticBoxObj = this.currentMap.getObjectGroup('role') //获取地图带有的对象
        var boxArr = staticBoxObj.getObjects()
        for (var i = 0; i < boxArr.length; i++) {
            var boxNode = boxArr[i];
            var data = boxNode.getProperties();
            var pos = this.exchangePos(cc.p(data.x, data.y))
            posMap[data.name] = pos;
        }
        return posMap
    },

});
