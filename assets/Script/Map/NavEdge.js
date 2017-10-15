//导航边
cc.Class({
    
    ctor:function(){
        this.headNode = null;
        this.lastNode = null;
    },
    init:function(args){
        args = args || {}
        this.headNode = args.headNode
        this.lastNode = args.lastNode
    },
    //画出自己来
    drawSelf:function(g){
        g.fillColor = cc.hexToColor('#000000');
        g.strokeColor = cc.hexToColor('#000000');
        g.moveTo(this.headNode.pos.x, this.headNode.pos.y)
        g.lineTo(this.lastNode.pos.x, this.lastNode.pos.y)
        g.stroke()
        g.fill()
    }

}) 