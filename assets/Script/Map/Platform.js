//平台节点
cc.Class({
    ctor:function(){
        this.nodeList = []
    },

    init:function(args){
        args = args || {}
        this.pos = args.pos 
        this.size = args.size
    },
    //判断一个节点是不是平台的部分
    contains:function(node){
        return this.nodeList.contains(node);
    },
    //是否能够加入平台组成
    canAdd:function(pNode){
        for (var i = 0; i < this.nodeList.length; i++) {
            var node = this.nodeList[i];
            for (var key in node.edgeList) {
                if (node.edgeList.hasOwnProperty(key)) {
                    var edge = node.edgeList[key];
                    if(edge.lastNode == pNode) {  //是相连的
                        return true
                    }
                }
            }
        }
    },
    //加入平台中来
    addNode:function(node){
        this.nodeList.push(node)
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
        this.nodeList.forEach(function(node) {
            g.rect(node.pos.x-3, node.pos.y-3, 6, 6)
        }, this);

        g.stroke()
        g.fill()
    },
    getRandomNode:function(){
        var index = Math.floor(Math.random()*this.nodeList.length) 
        return this.nodeList[index]
    },
}) 