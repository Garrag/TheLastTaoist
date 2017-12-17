//地图管理器，管理当前地图
var NavNode = require('NavNode')
var NavEdge = require('NavEdge')
var Platform = require('Platform')

cc.Class({
    extends: cc.Component,

    properties: {
        currentMap:cc.TiledMap
    },
    //初始化
    initFun:function(){
        this.navNodeList = new Array()
        this.navEdgeList = new Array()
        this.physicsBoxList = new Array()
        this.platformList = new Array()
        //缓存地图信息
        this.mapInfo = this.getCurrentMapInfo()
        //加入画笔
        var graphicsNode = new cc.Node('MapDebugNode')
        this.g = graphicsNode.addComponent(cc.Graphics)
        graphicsNode.parent = cc.director.getScene()
        //隐藏所有的地图碰撞对象
        this.hideObjLayer()
        //加载物理碰撞区域
        this.initPhysicsCollider()
        //创建导航图
        this.createNavMap()
        //创建平台
        this.createPlatforms()

        // this.navNodeList.forEach(function(node) {
        //     node.drawSelf(this.g)
        // }, this);

        // this.navEdgeList.forEach(function(edge) {
        //     edge.drawSelf(this.g)
        // }, this);

        // for (var i = 0; i < this.platformList.length; i++) {
        //     var element = this.platformList[i];
        //     element.drawSelf(this.g, new cc.Color(255, 0, 0))
        // }
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
        //获取对象数组
        var boxArr = staticBoxObj.getObjects()  
        for (var i = 0; i < boxArr.length; i++) {
            var boxNode = boxArr[i];
            var data = boxNode.getProperties();
            if(!data) continue;
            if (data.points){ //多边形
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
        var offset2 = this.getCurrentMapInfo().offset
        // var ccy = cc.winSize.height - mapSize.height;   //地图和游戏的差值
        offset.y += offset2.y;
        offset.x += offset2.x;
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
        this.physicsBoxList.push(phyCpt)
        // cc.log(phyCpt);
        phyCpt.offset = offset
        phyCpt.size = size
        phyCpt.apply()
        phyCpt.body.gravityScale = 0
        phyCpt.body.fixedRotation = true
        // phyCpt.body.type = cc.RigidBodyType.Static;
    },
    //创建一个多边形碰撞体 
    createPhyPolygon:function(args){
        args = args || {}
        var offset = args.offset
        var points = args.points
        var phyCpt = this.PhysicsStaticNode.addComponent(cc.PhysicsPolygonCollider)
        this.physicsBoxList.push(phyCpt)
        // cc.log(phyCpt);
        phyCpt.offset = offset
        var vec2Arr = []
        for (var i = 0; i < points.length; i++) {
            var point = points[i];
            vec2Arr.push(cc.p(point.x, -point.y))
        }
        phyCpt.points = vec2Arr
        phyCpt.apply()
        phyCpt.body.gravityScale = 0
        phyCpt.body.fixedRotation = true
        // phyCpt.body.type = cc.RigidBodyType.Static;
    },
    //创建导航图
    createNavMap:function(){
        //生成储存所有点
        var posList = this.getMapTilePosList();
        // cc.log(posList)
        posList.forEach(function(pos) {
            //不在碰撞内
            if(!this.isColliderContains(pos)) {
                //生成节点
                var navNode = new NavNode()
                navNode.init({  //初始化
                    pos:pos, 
                    size:cc.size(32, 32)
                })
                this.navNodeList.push(navNode)
            }else {
            }
        }, this);
        //改变碰撞体的类型
        this.physicsBoxList.forEach(function(collider) {
            collider.body.type = cc.RigidBodyType.Static;
            collider.body.linearDamping  = 1;
        }, this);
        //创建边节点
        this.navNodeList.forEach(function(node) {
            //拿到当前的节点 和附近的节点
            var nodeMap = this.getNearbyNavNode(node)
            for (var key in nodeMap) {
                if (nodeMap.hasOwnProperty(key)) {
                    var nearNode = nodeMap[key];
                    if(nearNode){
                        var edge = new NavEdge()
                        edge.init({
                            headNode: node,
                            lastNode: nearNode
                        })
                        node.setEdge(key, edge)
                        this.navEdgeList.push(edge)
                    }
                }
            }
        }, this);
    },
    //创建平台对象
    createPlatforms:function(){
        //1.找到可以搭建平台的节点
        var platformNodeList = new Array();
        this.navNodeList.forEach(function(node) {
            if(node.isHaveMidBottpm()) { //可以搭建平台
                platformNodeList.push(node)
            }
        }, this);
        // do {
        //     var pNode = platformNodeList.shift(); //拿到第一个节点
        //     var flag = true
        //     this.platformList.forEach(function(platform) {
        //         if(platform.canAdd(pNode)) {// 加入当前平台
        //             platform.addNode(pNode)
        //             flag = false
        //         }
        //     }, this);
        //     //搭建平台
        //     if(flag){
        //         var platform = new Platform()
        //         platform.addNode(pNode)
        //         this.platformList.push(platform)
        //     }
        // } while (platformNodeList.length > 0);
        do {
            //拿出所有与节点相连接的节点
            var searchFun = function(node, platform){
                platform.addNode(node)                          //加入当前的平台
                node.foreachEdge(function(type, edge){
                    for (var i = 0; i < platformNodeList.length; i++) {
                        var checkNode = platformNodeList[i];    //被check的节点
                        if(edge && edge.lastNode == checkNode){         //找到一个连接节点
                            platformNodeList.removeByValue(checkNode)
                            // cc.log(platformNodeList.length)
                            searchFun(checkNode, platform)                //沿着边继续找
                        }
                    }
                })
            }
            var pNode = platformNodeList.shift();//拿到第一个节点
            var platform = new Platform()       //创建平台 
            searchFun(pNode, platform)          //把所有相连接的点都加入该平台
            this.platformList.push(platform)
        } while (platformNodeList.length > 0);
    },
    //便利当前节点附件导航点
    getNearbyNavNode:function(selectNode){
        var width = selectNode.size.width
        var height = selectNode.size.height
        var posMap = {
            left_top      : this.getNavNodeByPos(cc.p(selectNode.pos.x+width*-1, selectNode.pos.y+height*1)),
            left_mid      : this.getNavNodeByPos(cc.p(selectNode.pos.x+width*-1, selectNode.pos.y+height*0)),
            left_bottom   : this.getNavNodeByPos(cc.p(selectNode.pos.x+width*-1, selectNode.pos.y+height*-1)),
            mid_top       : this.getNavNodeByPos(cc.p(selectNode.pos.x+width*-0, selectNode.pos.y+height*1)),
            mid_bottom    : this.getNavNodeByPos(cc.p(selectNode.pos.x+width*-0, selectNode.pos.y+height*-1)),
            right_top     : this.getNavNodeByPos(cc.p(selectNode.pos.x+width*1, selectNode.pos.y+height*1)),
            right_mid     : this.getNavNodeByPos(cc.p(selectNode.pos.x+width*1, selectNode.pos.y+height*0)),
            right_bottom  : this.getNavNodeByPos(cc.p(selectNode.pos.x+width*1, selectNode.pos.y+height*-1))
        }
        return posMap
    },
    //根据位置获取最近的导航点
    getNavNodeByPos:function(pos){
        for (var i = 0; i < this.navNodeList.length; i++) {
            var node = this.navNodeList[i];
            if(pos.sub(node.pos).magSqr() <= Math.pow(node.size.width/2, 2) ){
                return node
            }
        }
        return null
    },
    //根据节点获取所在的平台
    getPlatformByNode:function(node){
        for (var i = 0; i < this.platformList.length; i++) {
            var platform = this.platformList[i];
            if(platform.contains(node)){
                return platform
            }
        }
    },
    //判断是否在地图内
    isMapContains:function(pos){
        // pos = pos.subSelf(this.mapInfo.offset)
        var rect = this.getCurrentMapInfo().rect
        var tileSize = cc.size(0,0)//this.getCurrentMapInfo().tileSize
        if(pos.x < rect.x - tileSize.width){
            return false
        }
        if(pos.x > rect.x + rect.width + tileSize.width){
            return false
        }
        if(pos.y < rect.y - tileSize.height){
            return false
        }
        if(pos.y > rect.y + rect.height + tileSize.height){
            return false
        }
        return true
    },
    //是否在碰撞体内
    isColliderContains:function(point){
        var collider = cc.director.getPhysicsManager().testPoint(point);
        if(collider != null){
            return true
        }
        return false
    },
    //获取地图瓦片位置
    getMapTilePosList:function(){
        //记录所有的需要检测的点
        var navNodeList = new Array();
        var currentMapInfo = this.getCurrentMapInfo()
        var mapNumSize = currentMapInfo.mapNumSize
        var tileSize = currentMapInfo.tileSize
        var wideSpace = currentMapInfo.tileSize.width;
        var highSpace = currentMapInfo.tileSize.height;
        var mapSize = currentMapInfo.mapSize;
        // 寻找一个中心点
		var centerXIndex = Math.floor(mapNumSize.width/2)-0.5;
        var centerYIndex = -Math.floor(mapNumSize.height/2)+0.5;
        // 地图中心点 相对于世界坐标
        var centerPoint = cc.p(wideSpace*centerXIndex, -highSpace*centerYIndex);
        centerPoint = centerPoint.add(currentMapInfo.offset)
        // 加入中心点
        navNodeList.push(centerPoint)
		var r = 1; 	//洪水范围
        var maxR = mapNumSize.width > mapNumSize.height ? mapNumSize.width : mapNumSize.height;
        var eFun = function(o1, o2){
            if(o1.x == o2.x && o1.y == o2.y){
                return true
            }
            return false
        }
		while (r < maxR/2+2)
		{
            for (var i = 0; i < 4; i++) {   //循环4此,分别对应 x1, y1, x2, y2
                switch (i) {
                    case 0: //左边
                        for(var y=-r; y<=r; y++){
                            var pos = centerPoint.add(cc.p(-r*wideSpace, y*highSpace))                          
                            if(!navNodeList.contains(pos, eFun) && this.isMapContains(pos) ) {
                                navNodeList.push( pos ) 
                            }
                        }
                        break;
                    case 1: //右边
                        for(var y=-r; y<=r; y++){
                            var pos = centerPoint.add(cc.p(r*wideSpace, y*highSpace))
                            if(!navNodeList.contains(pos, eFun) && this.isMapContains(pos) ) {
                                navNodeList.push( pos ) 
                            }
                        }
                        break;
                    case 2: //上边
                        for(var x=-r; x<=r; x++){
                            var pos = centerPoint.add(cc.p(x*wideSpace, r*highSpace))
                            if(!navNodeList.contains(pos, eFun) && this.isMapContains(pos) ) {
                                navNodeList.push( pos ) 
                            }
                        }
                        break;
                    case 3: //下边
                        for(var x=-r; x<=r; x++){
                            var pos = centerPoint.add(cc.p(-x*wideSpace, -r*highSpace))
                            if(!navNodeList.contains(pos, eFun) && this.isMapContains(pos) ) {
                                navNodeList.push( pos ) 
                            }
                        }
                        break;
                    default:
                        break;
                }
            }
			r++;
        }
        // navNodeList.forEach(function(pos) {
        //     this.g.rect(pos.x-5, pos.y-5, 10, 10);
        // }, this);
        // this.g.stroke()
        return navNodeList
    },
    //获取地图基本信息
    getCurrentMapInfo:function(){
        var currentMapInfo = {}
        var mapInfo = this.currentMap.getMapSize()      //地图数量大小
        var tileSize = this.currentMap.getTileSize()
        var wideSpace = tileSize.width;
        var highSpace = tileSize.height;
        var mapSize = cc.size(mapInfo.width*wideSpace, mapInfo.height*highSpace);
        currentMapInfo.mapNumSize = mapInfo
        currentMapInfo.tileSize = tileSize
        currentMapInfo.mapSize = mapSize
        currentMapInfo.currentMap = this.currentMap
        currentMapInfo.firstLayer = this.currentMap.allLayers()[0];
        //相对于世界坐标的偏移量
        var offsetX = cc.winSize.width - mapSize.width
        var offsetY = cc.winSize.height - mapSize.height
        currentMapInfo.offset = cc.p(offsetX/2, offsetY/2)
        currentMapInfo.rect = cc.rect(offsetX/2, offsetY/2, mapSize.width, mapSize.height);
        return currentMapInfo
    },
    //绘制地图体调试
    darwDebugInfo:function(){
        var currentMapInfo = this.getCurrentMapInfo()
        var tileSize = this.currentMap.getTileSize()
        var offset = currentMapInfo.offset
        var graphicsNode = new cc.Node('MapDebugNode')
        var g = graphicsNode.addComponent(cc.Graphics)
        graphicsNode.parent = cc.director.getScene()
        for (var i = 0; i <= currentMapInfo.mapNumSize.width; i++) {
            g.moveTo(i*tileSize.width + offset.x, offset.y)
            g.lineTo(i*tileSize.width + offset.x, offset.y + currentMapInfo.mapSize.height)
        }
        for (var j = 0; j <= currentMapInfo.mapNumSize.height; j++) {
            g.moveTo(0 + offset.x, j*tileSize.height + offset.y)
            g.lineTo(currentMapInfo.mapSize.width + offset.x, j*tileSize.height + offset.y)
        }
        // g.strokeColor = cc.hexToColor('#ff0000');
        g.stroke()
    },
    //获取当前地图角色出生点
    getMapRolePos:function(){
        var posMap = {}
        var staticBoxObj = this.currentMap.getObjectGroup('role') //获取地图带有的对象
        if(staticBoxObj) {
            var boxArr = staticBoxObj.getObjects()
            for (var i = 0; i < boxArr.length; i++) {
                var boxNode = boxArr[i];
                var data = boxNode.getProperties();
                var pos = this.exchangePos(cc.p(data.x, data.y))
                if(data.name){
                    posMap[data.name] = pos;
                }
            }
        }
        return posMap
    },

});

