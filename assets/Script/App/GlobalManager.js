window.GM = GM || {}
var GM = window.GM
GM.gameManager = null
GM.mapManager = null
GM.enemyManager = null

GM.popupList = []           //弹框容器

//注册全局方法
Array.prototype.contains = function (obj, fun) {
    var i = this.length;
    while (i--) {
        if (fun) {
            if (fun(this[i], obj)) {
                return true;
            }
        } else {
            if (this[i] === obj) {
                return true;
            }
        }
    }
    return false;
}

Array.prototype.removeByValue = function (val) {
    for (var i = 0; i < this.length; i++) {
        if (this[i] == val) {
            return this.splice(i, 1);
            break;
        }
    }
}