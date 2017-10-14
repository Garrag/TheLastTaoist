cc.Class({
    extends: cc.Component,

    properties: {
        targetNode: cc.Node,
    },

    // use this for initialization
    onLoad: function() {
    },

    // called every frame, uncomment this function to activate update callback
    update: function (dt) {
        this.node.position = this.targetNode.convertToWorldSpaceAR(cc.p(0,0));
    },
});