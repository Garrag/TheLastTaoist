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
        this.darwDebugInfo()
        this.createNavMap()
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
        //生成储存所有点
        var tileNodeList = new Array()
        var currentMapInfo = this.getCurrentMapInfo()
        var mapNumSize = currentMapInfo.mapNumSize
        var tileSize = currentMapInfo.tileSize
        var wideSpace = currentMapInfo.tileSize.width;
        var highSpace = currentMapInfo.tileSize.height;
        var mapSize = currentMapInfo.mapSize;
        // cc.log(mapSize);
        // cc.log(tileSize);

        // 寻找一个中心点
		var centerXIndex = Math.floor(mapNumSize.width/2)+0.5;
        var centerYIndex = -Math.floor(mapNumSize.height/2)+0.5;
        // cc.log(centerXIndex, centerYIndex)
		var centerPoint = cc.p(wideSpace*centerXIndex, highSpace*centerYIndex);
		// // //记录所有的需要检测的点
		// var r = 0; 	//洪水范围
		// // bool haveNext = true;
		// var maxR = this.currentMap.NumTilesWide > this.currentMap.NumTilesHigh ? this.currentMap.NumTilesWide : this.currentMap.NumTilesHigh;
		// while (r < maxR)
		// {
		// 	for (var i = -r; i <= r; i++)
		// 	{
		// 		for (var j = -r; j <= r; j++)
		// 		{
		// 			var pos = cc.p(wideSpace*(i+centerXIndex), highSpace*(centerYIndex-j));
		// 			if(!this.checkPosIsOut(pos) && !mapPosList.Contains(pos) ) {	//是否超出边界
		// 				mapPosList.Add(pos);
		// 			}
		// 		}
		// 	}
		// 	r++;
		// }
        return null;
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
        var boxArr = staticBoxObj.getObjects()
        for (var i = 0; i < boxArr.length; i++) {
            var boxNode = boxArr[i];
            var data = boxNode.getProperties();
            var pos = this.exchangePos(cc.p(data.x, data.y))
            if(data.name){
                posMap[data.name] = pos;
            }
        }
        return posMap
    },

});
