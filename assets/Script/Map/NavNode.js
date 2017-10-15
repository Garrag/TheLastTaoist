//导航图节点
cc.Class({
    ctor:function() {
        this.edgeList = {}
    },
    init:function(args){
        args = args || {}
        this.pos = args.pos 
        this.size = args.size
    },

    //画出自己来
    drawSelf:function(g, color){
        if(color) {
            g.fillColor = color;
            g.strokeColor = color;
        }else {
            g.fillColor = cc.hexToColor('#000000');
            g.strokeColor = cc.hexToColor('#000000');
        }
        g.rect(this.pos.x-3, this.pos.y-3, 6, 6)
        g.stroke()
        g.fill()
    },
    //设置边
    setEdge:function(type, edge){
        // cc.log(type)
        this.edgeList[type] = edge;
    },
    //判断下面的边是否可以搭建
    isHaveMidBottpm:function(){
        var rs = this.edgeList['mid_bottom'] ? true : false
        return !rs
    },
    //遍历边
    foreachEdge:function(func){
        for (var key in this.edgeList) {
            var edge = this.edgeList[key];
            if (edge) {
                func(key, edge)
            }
        }
    },
}) 