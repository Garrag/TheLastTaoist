cc.Class({
    extends: cc.Component,
    properties: {
    },
    //获取到遮罩层
    getMaskLayer(callBack) {
        cc.loader.loadRes('prefab/Common/MaskLayer', function (err, prefab) {
            if (callBack) {
                var maskLayer = cc.instantiate(prefab)
                maskLayer.getComponent(cc.Widget).left = 0
                maskLayer.getComponent(cc.Widget).right = 0
                maskLayer.getComponent(cc.Widget).bottom = 0
                maskLayer.getComponent(cc.Widget).top = 0
                var button = maskLayer.getComponent(cc.Button);
                var clickEventHandler = new cc.Component.EventHandler();
                clickEventHandler.target = this.node;           //这个node节点是你的事件处理代码组件所属的节点
                clickEventHandler.component = "BaseScript";     //这个是代码文件名
                clickEventHandler.handler = "removeTop";        //移除顶部弹框
                clickEventHandler.customEventData = "";
                button.clickEvents.push(clickEventHandler);
                callBack(maskLayer)
            }
        }.bind(this));
    },
    //添加一个弹框
    addPopupByName(path, args) {
        cc.loader.loadRes(path, function (err, prefab) {
            this.addPopup(prefab, args)
        }.bind(this));
    },
    //添加一个弹框
    addPopup(node, args) {
        args = args || {}
        var mask = args.mask || false
        var node = cc.instantiate(node)
        args.node = node
        GM.popupList.push(args)
        if (mask) {
            this.getMaskLayer(maskLayer=> {
                maskLayer.parent = cc.find('Canvas')
                node.parent = cc.find('Canvas')
                args.maskNode = maskLayer
            })
        } else {
            node.parent = cc.find('Canvas')
        }
    },
    //移除顶部弹框
    removeTop() {
        var args = GM.popupList.pop()
        if (args.node) {
            args.node.destroy()
        }
        if(args.maskNode) {
            args.maskNode.destroy()
        }
    },
    // 移除一个弹框
    removePopup(popup) {
        if (!popup) return;
        for (var i = 0; i < GM.popupList.length; i++) {
            if (GM.popupList[i].node == popup) {
                popup.destroy()
                var maskNode = GM.popupList[i].maskNode
                if (maskNode) {
                    maskNode.destroy()
                }
                GM.popupList.splice(i, 1);
                break;
            }
        }
    },
    //移除自己
    removeSelf() {
        this.removePopup(this.node)
    },
});
