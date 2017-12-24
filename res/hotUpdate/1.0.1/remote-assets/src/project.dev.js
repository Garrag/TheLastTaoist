require = function e(t, n, r) {
  function s(o, u) {
    if (!n[o]) {
      if (!t[o]) {
        var a = "function" == typeof require && require;
        if (!u && a) return a(o, !0);
        if (i) return i(o, !0);
        var f = new Error("Cannot find module '" + o + "'");
        throw f.code = "MODULE_NOT_FOUND", f;
      }
      var l = n[o] = {
        exports: {}
      };
      t[o][0].call(l.exports, function(e) {
        var n = t[o][1][e];
        return s(n || e);
      }, l, l.exports, e, t, n, r);
    }
    return n[o].exports;
  }
  var i = "function" == typeof require && require;
  for (var o = 0; o < r.length; o++) s(r[o]);
  return s;
}({
  BaseScript: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "392adYIU69G1Jv7+qGzBgSw", "BaseScript");
    "use strict";
    cc.Class({
      extends: cc.Component,
      properties: {},
      start: function start() {}
    });
    cc._RF.pop();
  }, {} ],
  CameraManager: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "b639aop9klG3pzN3xsen90F", "CameraManager");
    "use strict";
    cc.Class({
      extends: cc.Component,
      properties: {
        targetNode: cc.Node
      },
      onLoad: function onLoad() {},
      update: function update(dt) {
        this.node.position = this.targetNode.convertToWorldSpaceAR(cc.p(0, 0));
      }
    });
    cc._RF.pop();
  }, {} ],
  EnemyManager: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "968c24moNVKDJLZQGoSUDha", "EnemyManager");
    "use strict";
    cc.Class({
      extends: cc.Component,
      properties: {
        roleLayer: cc.Node,
        rolePrefab_1: cc.Prefab
      },
      onLoad: function onLoad() {},
      initFun: function initFun() {
        this.initEnemy();
      },
      initEnemy: function initEnemy() {
        var data = GM.mapManager.getMapRolePos();
        if (data.pos1) {
          var role_1 = cc.instantiate(this.rolePrefab_1);
          role_1.parent = this.roleLayer;
          var pos = this.roleLayer.convertToNodeSpaceAR(data.pos1);
          role_1.setPosition(pos);
        }
        if (data.pos2) {
          var role_1 = cc.instantiate(this.rolePrefab_1);
          role_1.parent = this.roleLayer;
          var pos = this.roleLayer.convertToNodeSpaceAR(data.pos2);
          role_1.setPosition(pos);
        }
      }
    });
    cc._RF.pop();
  }, {} ],
  GameManager: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "0eb4464hsxM9rD5772ppchg", "GameManager");
    "use strict";
    var MapManager = require("MapManager");
    var EnemyManager = require("EnemyManager");
    cc.Class({
      extends: cc.Component,
      properties: {
        enemyManager: EnemyManager,
        mapManager: MapManager
      },
      onLoad: function onLoad() {
        cc.director.getPhysicsManager().enabled = true;
        GM.mapManager = this.mapManager;
        GM.enemyManager = this.enemyManager;
        GM.gameManager = this;
        this.mapManager.initFun();
        this.enemyManager.initFun();
        this.initPlayer();
      },
      initPlayer: function initPlayer() {},
      resetGame: function resetGame() {},
      pauseGame: function pauseGame() {},
      openSetting: function openSetting() {}
    });
    cc._RF.pop();
  }, {
    EnemyManager: "EnemyManager",
    MapManager: "MapManager"
  } ],
  HotUpdate: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "47ab53yke1OBag+6XVnUoTN", "HotUpdate");
    "use strict";
    cc.Class({
      extends: cc.Component,
      properties: {
        manifestUrl: cc.RawAsset,
        versionLabel: cc.Label,
        byteLabel: cc.Label,
        byteProgress: cc.ProgressBar,
        fileLabel: cc.Label,
        fileProgress: cc.ProgressBar,
        info: cc.Label,
        _updating: false,
        _canRetry: false,
        _canUpdate: false,
        _needRestart: false,
        _storagePath: "",
        _versionCode: ""
      },
      checkCb: function checkCb(event) {
        cc.log("checkCb Code: " + event.getEventCode());
        var isContinue = true;
        switch (event.getEventCode()) {
         case jsb.EventAssetsManager.ERROR_NO_LOCAL_MANIFEST:
          this.info.string = "没有找到本地热更新配置.";
          isContinue = false;
          break;

         case jsb.EventAssetsManager.ERROR_DOWNLOAD_MANIFEST:
          this.info.string = "下载热更新配置失败.";
          break;

         case jsb.EventAssetsManager.ERROR_PARSE_MANIFEST:
          this.info.string = "解析热更新配置失败.";
          isContinue = false;
          break;

         case jsb.EventAssetsManager.ALREADY_UP_TO_DATE:
          this.info.string = "已经是最新版本了";
          break;

         case jsb.EventAssetsManager.NEW_VERSION_FOUND:
          this.info.string = "有新版本发现,请更新游戏";
          this.fileProgress.progress = 0;
          this.byteProgress.progress = 0;
          this._canUpdate = true;
          isContinue = false;
          break;

         default:
          return;
        }
        if (false == isContinue) {
          this.cleanCheckListener();
          this._updating = false;
          this._canUpdate = true;
          this._canRetry = false;
          this.updatePanel();
        }
      },
      updateCb: function updateCb(event) {
        var needRestart = false;
        var failed = false;
        cc.log("updateCb Code: " + event.getEventCode());
        switch (event.getEventCode()) {
         case jsb.EventAssetsManager.ERROR_NO_LOCAL_MANIFEST:
          this.info.string = "没有找到本地更新配置";
          failed = true;
          break;

         case jsb.EventAssetsManager.UPDATE_PROGRESSION:
          this.byteProgress.progress = event.getPercent();
          this.fileProgress.progress = event.getPercentByFile();
          this.fileLabel.string = "文件:(" + event.getDownloadedFiles() + "/" + event.getTotalFiles() + ")";
          this.byteLabel.string = "字节:(" + event.getDownloadedBytes() + "/" + event.getTotalBytes() + ")";
          var msg = event.getMessage();
          msg && (this.info.string = "更新文件: " + msg);
          break;

         case jsb.EventAssetsManager.ERROR_DOWNLOAD_MANIFEST:
         case jsb.EventAssetsManager.ERROR_PARSE_MANIFEST:
          this.info.string = "配置文件出错";
          failed = true;
          break;

         case jsb.EventAssetsManager.ALREADY_UP_TO_DATE:
          this.info.string = "已经是最后一个版本了";
          failed = true;
          break;

         case jsb.EventAssetsManager.UPDATE_FINISHED:
          this.info.string = "更新结束. " + event.getMessage();
          needRestart = true;
          break;

         case jsb.EventAssetsManager.UPDATE_FAILED:
          this.info.string = "更新失败. " + event.getMessage();
          this._canRetry = true;
          break;

         case jsb.EventAssetsManager.ERROR_UPDATING:
          this.info.string = "资源更新错误: " + event.getAssetId() + ", " + event.getMessage();
          break;

         case jsb.EventAssetsManager.ERROR_DECOMPRESS:
          this.info.string = event.getMessage();
        }
        if (failed) {
          this.cleanUpdateListener();
          this._updating = false;
          this.updatePanel();
        }
      },
      restartGame: function restartGame() {
        this.cleanUpdateListener();
        var searchPaths = jsb.fileUtils.getSearchPaths();
        var newPaths = this._am.getLocalManifest().getSearchPaths();
        cc.log("hotUpdate path:", newPaths);
        Array.prototype.unshift(searchPaths, newPaths);
        cc.log("searchPaths path:", searchPaths);
        cc.sys.localStorage.setItem("HotUpdateSearchPaths", JSON.stringify(searchPaths));
        jsb.fileUtils.setSearchPaths(searchPaths);
        cc.audioEngine.stopAll();
        cc.game.restart();
      },
      loadCustomManifest: function loadCustomManifest() {
        if (this._am.getState() === jsb.AssetsManager.State.UNINITED) {
          var manifest = null;
          if (false == jsb.fileUtils.isFileExist(this._storagePath + "project.manifest")) {
            var rawManifestStr = this.manifestUrl;
            var rawManifest = JSON.parse(jsb.fileUtils.getStringFromFile(this.manifestUrl));
            this._versionCode = rawManifest.version;
            manifest = new jsb.Manifest(rawManifestStr, this._storagePath);
            this.info.string = "使用本地的资源";
          } else {
            var localManifest = JSON.parse(jsb.fileUtils.getStringFromFile(this._storagePath + "project.manifest"));
            var rawManifest = JSON.parse(jsb.fileUtils.getStringFromFile(this.manifestUrl));
            var ret = this.versionCompareHandle(rawManifest.version, localManifest.version);
            if (ret > 0) {
              this._versionCode = rawManifest.version;
              manifest = new jsb.Manifest(rawManifestStr, this._storagePath);
              this.info.string = "使用远程版本";
            } else if (ret <= 0) {
              this._versionCode = localManifest.version;
              manifest = new jsb.Manifest(localManifest, this._storagePath);
              this.info.string = "使用本地版本";
            }
          }
          null != manifest && this._am.loadLocalManifest(manifest, this._storagePath);
          this.versionLabel && (this.versionLabel.string = "V" + this._versionCode);
        }
      },
      retry: function retry() {
        if (!this._updating && this._canRetry) {
          this._canRetry = false;
          this.info.string = "Retry failed Assets...";
          this._am.downloadFailedAssets();
        }
      },
      cleanCheckListener: function cleanCheckListener() {
        if (null != this._checkListener) {
          cc.eventManager.removeListener(this._checkListener);
          this._checkListener = null;
        }
      },
      checkUpdate: function checkUpdate() {
        if (this._updating) {
          this.info.string = "检查是否有更新";
          return;
        }
        this._am.getState() === jsb.AssetsManager.State.UNINITED && this._am.loadLocalManifest(this.manifestUrl);
        if (!this._am.getLocalManifest() || !this._am.getLocalManifest().isLoaded()) {
          this.info.string = "Failed to load local manifest ...";
          return;
        }
        this.cleanCheckListener();
        this._checkListener = new jsb.EventListenerAssetsManager(this._am, this.checkCb.bind(this));
        cc.eventManager.addListener(this._checkListener, 1);
        this._updating = true;
        this._am.checkUpdate();
      },
      cleanUpdateListener: function cleanUpdateListener() {
        if (this._updateListener) {
          cc.eventManager.removeListener(this._updateListener);
          this._updateListener = null;
        }
      },
      hotUpdate: function hotUpdate() {
        if (this._am && !this._updating && this._canUpdate) {
          this._canUpdate = false;
          this._updateListener = new jsb.EventListenerAssetsManager(this._am, this.updateCb.bind(this));
          cc.eventManager.addListener(this._updateListener, 1);
          this._am.getState() === jsb.AssetsManager.State.UNINITED && this._am.loadLocalManifest(this.manifestUrl);
          this._failCount = 0;
          this._am.update();
          this._updating = true;
        }
      },
      show: function show() {
        cc.log("this.node.active:", this.node.active);
        false === this.node.active && (this.node.active = true);
      },
      hide: function hide() {
        cc.log("this.node.active:", this.node.active);
        true === this.node.active && (this.node.active = false);
      },
      updatePanel: function updatePanel() {
        this.versionLabel && (this.versionLabel.string = "V" + (this._versionCode || " null"));
        this._needRestart && this.restartGame();
      },
      versionCompareHandle: function versionCompareHandle(versionA, versionB) {
        cc.log("JS Custom Version Compare: version A is " + versionA + ", version B is " + versionB);
        var vA = versionA.split(".");
        var vB = versionB.split(".");
        for (var i = 0; i < vA.length; ++i) {
          var a = parseInt(vA[i]);
          var b = parseInt(vB[i] || 0);
          if (a === b) continue;
          return a - b;
        }
        return vB.length > vA.length ? -1 : 0;
      },
      onLoad: function onLoad() {
        if (!cc.sys.isNative) return;
        if (null == this.manifestUrl) return;
        this._checkListener = null;
        this._updateListener = null;
        this._storagePath = (jsb.fileUtils ? jsb.fileUtils.getWritablePath() : "/") + "remote-asset";
        cc.log("this._storagePath", this._storagePath);
        this.init();
        this._am.setVerifyCallback(function(path, asset) {
          var compressed = asset.compressed;
          var expectedMD5 = asset.md5;
          var relativePath = asset.path;
          var size = asset.size;
          if (compressed) {
            this.info.string = "Verification passed : " + relativePath;
            return true;
          }
          this.info.string = "Verification passed : " + relativePath + " (" + expectedMD5 + ")";
          return true;
        }.bind(this));
        cc.sys.os === cc.sys.OS_ANDROID && this._am.setMaxConcurrentTask(2);
      },
      init: function init() {
        cc.log("init AssetsManager for remote asset : " + this._storagePath);
        this.fileProgress.progress = 0;
        this.byteProgress.progress = 0;
        this.byteLabel.string = "";
        this.fileLabel.string = "";
        this.info.string = "";
        this._canRetry = false;
        this._needRestart = false;
        this._canUpdate = true;
        this._updating = false;
        if (this._am && !cc.sys.ENABLE_GC_FOR_NATIVE_OBJECTS) {
          this._am.release();
          this._am = null;
        }
        this._am = new jsb.AssetsManager("", this._storagePath, this.versionCompareHandle);
        cc.sys.ENABLE_GC_FOR_NATIVE_OBJECTS || this._am.retain();
        this.loadCustomManifest();
        this.updatePanel();
      },
      onEnable: function onEnable() {
        this.init();
      },
      onDestroy: function onDestroy() {
        if (this._updateListener) {
          cc.eventManager.removeListener(this._updateListener);
          this._updateListener = null;
        }
        this._am && !cc.sys.ENABLE_GC_FOR_NATIVE_OBJECTS && this._am.release();
      }
    });
    cc._RF.pop();
  }, {} ],
  MainMenu: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "0b6297CZahBfYVM+tzQf/9q", "MainMenu");
    "use strict";
    cc.Class({
      extends: cc.Component,
      properties: {
        updateNode: cc.Node
      },
      onLoad: function onLoad() {
        this.updateNode.active = false;
      },
      start: function start() {},
      joinGame: function joinGame(params) {
        cc.director.loadScene("Test");
      },
      openSetting: function openSetting(params) {},
      openHotUpdateNode: function openHotUpdateNode() {
        this.updateNode.active = true;
      }
    });
    cc._RF.pop();
  }, {} ],
  MapManager: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "280c3rsZJJKnZ9RqbALVwtK", "MapManager");
    "use strict";
    var NavNode = require("NavNode");
    var NavEdge = require("NavEdge");
    var Platform = require("Platform");
    cc.Class({
      extends: cc.Component,
      properties: {
        currentMap: cc.TiledMap
      },
      initFun: function initFun() {
        this.navNodeList = new Array();
        this.navEdgeList = new Array();
        this.physicsBoxList = new Array();
        this.platformList = new Array();
        this.mapInfo = this.getCurrentMapInfo();
        var graphicsNode = new cc.Node("MapDebugNode");
        this.g = graphicsNode.addComponent(cc.Graphics);
        graphicsNode.parent = cc.director.getScene();
        this.hideObjLayer();
        this.initPhysicsCollider();
        this.createNavMap();
        this.createPlatforms();
      },
      hideObjLayer: function hideObjLayer() {
        var objGroups = this.currentMap.getObjectGroups();
        for (var i = 0; i < objGroups.length; ++i) {
          var ps = objGroups[i].getObjects();
          for (var j = 0; j < ps.length; j++) {
            var element = ps[j];
            element.sgNode.visible = false;
          }
        }
      },
      initPhysicsCollider: function initPhysicsCollider() {
        this.PhysicsStaticNode = new cc.Node("PhysicsStatic");
        this.PhysicsStaticNode.parent = cc.director.getScene();
        var staticBoxObj = this.currentMap.getObjectGroup("static");
        if (!staticBoxObj) return;
        var boxArr = staticBoxObj.getObjects();
        for (var i = 0; i < boxArr.length; i++) {
          var boxNode = boxArr[i];
          var data = boxNode.getProperties();
          if (!data) continue;
          if (data.points) {
            var offset = this.exchangePos(cc.p(data.x, data.y));
            this.createPhyPolygon({
              offset: offset,
              points: data.points
            });
          } else {
            var offset = this.exchangePos(cc.p(data.x, data.y));
            var size = cc.size(data.width, data.height);
            this.createPhyBox({
              offset: offset,
              size: size
            });
          }
        }
      },
      exchangePos: function exchangePos(pos) {
        var mapSize = this.currentMap.node.getContentSize();
        var offset = cc.p(pos.x, mapSize.height - pos.y);
        var offset2 = this.getCurrentMapInfo().offset;
        offset.y += offset2.y;
        offset.x += offset2.x;
        return offset;
      },
      createPhyBox: function createPhyBox(args) {
        args = args || {};
        var offset = args.offset;
        var size = args.size;
        offset.x += size.width / 2;
        offset.y -= size.height / 2;
        var phyCpt = this.PhysicsStaticNode.addComponent(cc.PhysicsBoxCollider);
        this.physicsBoxList.push(phyCpt);
        phyCpt.offset = offset;
        phyCpt.size = size;
        phyCpt.apply();
        phyCpt.body.gravityScale = 0;
        phyCpt.body.fixedRotation = true;
      },
      createPhyPolygon: function createPhyPolygon(args) {
        args = args || {};
        var offset = args.offset;
        var points = args.points;
        var phyCpt = this.PhysicsStaticNode.addComponent(cc.PhysicsPolygonCollider);
        this.physicsBoxList.push(phyCpt);
        phyCpt.offset = offset;
        var vec2Arr = [];
        for (var i = 0; i < points.length; i++) {
          var point = points[i];
          vec2Arr.push(cc.p(point.x, -point.y));
        }
        phyCpt.points = vec2Arr;
        phyCpt.apply();
        phyCpt.body.gravityScale = 0;
        phyCpt.body.fixedRotation = true;
      },
      createNavMap: function createNavMap() {
        var posList = this.getMapTilePosList();
        posList.forEach(function(pos) {
          if (!this.isColliderContains(pos)) {
            var navNode = new NavNode();
            navNode.init({
              pos: pos,
              size: cc.size(32, 32)
            });
            this.navNodeList.push(navNode);
          }
        }, this);
        this.physicsBoxList.forEach(function(collider) {
          collider.body.type = cc.RigidBodyType.Static;
          collider.body.linearDamping = 1;
        }, this);
        this.navNodeList.forEach(function(node) {
          var nodeMap = this.getNearbyNavNode(node);
          for (var key in nodeMap) if (nodeMap.hasOwnProperty(key)) {
            var nearNode = nodeMap[key];
            if (nearNode) {
              var edge = new NavEdge();
              edge.init({
                headNode: node,
                lastNode: nearNode
              });
              node.setEdge(key, edge);
              this.navEdgeList.push(edge);
            }
          }
        }, this);
      },
      createPlatforms: function createPlatforms() {
        var platformNodeList = new Array();
        this.navNodeList.forEach(function(node) {
          node.isHaveMidBottpm() && platformNodeList.push(node);
        }, this);
        do {
          var searchFun = function searchFun(node, platform) {
            platform.addNode(node);
            node.foreachEdge(function(type, edge) {
              for (var i = 0; i < platformNodeList.length; i++) {
                var checkNode = platformNodeList[i];
                if (edge && edge.lastNode == checkNode) {
                  platformNodeList.removeByValue(checkNode);
                  searchFun(checkNode, platform);
                }
              }
            });
          };
          var pNode = platformNodeList.shift();
          var platform = new Platform();
          searchFun(pNode, platform);
          this.platformList.push(platform);
        } while (platformNodeList.length > 0);
      },
      getNearbyNavNode: function getNearbyNavNode(selectNode) {
        var width = selectNode.size.width;
        var height = selectNode.size.height;
        var posMap = {
          left_top: this.getNavNodeByPos(cc.p(selectNode.pos.x + -1 * width, selectNode.pos.y + 1 * height)),
          left_mid: this.getNavNodeByPos(cc.p(selectNode.pos.x + -1 * width, selectNode.pos.y + 0 * height)),
          left_bottom: this.getNavNodeByPos(cc.p(selectNode.pos.x + -1 * width, selectNode.pos.y + -1 * height)),
          mid_top: this.getNavNodeByPos(cc.p(selectNode.pos.x + -0 * width, selectNode.pos.y + 1 * height)),
          mid_bottom: this.getNavNodeByPos(cc.p(selectNode.pos.x + -0 * width, selectNode.pos.y + -1 * height)),
          right_top: this.getNavNodeByPos(cc.p(selectNode.pos.x + 1 * width, selectNode.pos.y + 1 * height)),
          right_mid: this.getNavNodeByPos(cc.p(selectNode.pos.x + 1 * width, selectNode.pos.y + 0 * height)),
          right_bottom: this.getNavNodeByPos(cc.p(selectNode.pos.x + 1 * width, selectNode.pos.y + -1 * height))
        };
        return posMap;
      },
      getNavNodeByPos: function getNavNodeByPos(pos) {
        for (var i = 0; i < this.navNodeList.length; i++) {
          var node = this.navNodeList[i];
          if (pos.sub(node.pos).magSqr() <= Math.pow(node.size.width / 2, 2)) return node;
        }
        return null;
      },
      getPlatformByNode: function getPlatformByNode(node) {
        for (var i = 0; i < this.platformList.length; i++) {
          var platform = this.platformList[i];
          if (platform.contains(node)) return platform;
        }
      },
      isMapContains: function isMapContains(pos) {
        var rect = this.getCurrentMapInfo().rect;
        var tileSize = cc.size(0, 0);
        if (pos.x < rect.x - tileSize.width) return false;
        if (pos.x > rect.x + rect.width + tileSize.width) return false;
        if (pos.y < rect.y - tileSize.height) return false;
        if (pos.y > rect.y + rect.height + tileSize.height) return false;
        return true;
      },
      isColliderContains: function isColliderContains(point) {
        var collider = cc.director.getPhysicsManager().testPoint(point);
        if (null != collider) return true;
        return false;
      },
      getMapTilePosList: function getMapTilePosList() {
        var navNodeList = new Array();
        var currentMapInfo = this.getCurrentMapInfo();
        var mapNumSize = currentMapInfo.mapNumSize;
        var tileSize = currentMapInfo.tileSize;
        var wideSpace = currentMapInfo.tileSize.width;
        var highSpace = currentMapInfo.tileSize.height;
        var mapSize = currentMapInfo.mapSize;
        var centerXIndex = Math.floor(mapNumSize.width / 2) - .5;
        var centerYIndex = .5 - Math.floor(mapNumSize.height / 2);
        var centerPoint = cc.p(wideSpace * centerXIndex, -highSpace * centerYIndex);
        centerPoint = centerPoint.add(currentMapInfo.offset);
        navNodeList.push(centerPoint);
        var r = 1;
        var maxR = mapNumSize.width > mapNumSize.height ? mapNumSize.width : mapNumSize.height;
        var eFun = function eFun(o1, o2) {
          if (o1.x == o2.x && o1.y == o2.y) return true;
          return false;
        };
        while (r < maxR / 2 + 2) {
          for (var i = 0; i < 4; i++) switch (i) {
           case 0:
            for (var y = -r; y <= r; y++) {
              var pos = centerPoint.add(cc.p(-r * wideSpace, y * highSpace));
              !navNodeList.contains(pos, eFun) && this.isMapContains(pos) && navNodeList.push(pos);
            }
            break;

           case 1:
            for (var y = -r; y <= r; y++) {
              var pos = centerPoint.add(cc.p(r * wideSpace, y * highSpace));
              !navNodeList.contains(pos, eFun) && this.isMapContains(pos) && navNodeList.push(pos);
            }
            break;

           case 2:
            for (var x = -r; x <= r; x++) {
              var pos = centerPoint.add(cc.p(x * wideSpace, r * highSpace));
              !navNodeList.contains(pos, eFun) && this.isMapContains(pos) && navNodeList.push(pos);
            }
            break;

           case 3:
            for (var x = -r; x <= r; x++) {
              var pos = centerPoint.add(cc.p(-x * wideSpace, -r * highSpace));
              !navNodeList.contains(pos, eFun) && this.isMapContains(pos) && navNodeList.push(pos);
            }
          }
          r++;
        }
        return navNodeList;
      },
      getCurrentMapInfo: function getCurrentMapInfo() {
        var currentMapInfo = {};
        var mapInfo = this.currentMap.getMapSize();
        var tileSize = this.currentMap.getTileSize();
        var wideSpace = tileSize.width;
        var highSpace = tileSize.height;
        var mapSize = cc.size(mapInfo.width * wideSpace, mapInfo.height * highSpace);
        currentMapInfo.mapNumSize = mapInfo;
        currentMapInfo.tileSize = tileSize;
        currentMapInfo.mapSize = mapSize;
        currentMapInfo.currentMap = this.currentMap;
        currentMapInfo.firstLayer = this.currentMap.allLayers()[0];
        var offsetX = cc.winSize.width - mapSize.width;
        var offsetY = cc.winSize.height - mapSize.height;
        currentMapInfo.offset = cc.p(offsetX / 2, offsetY / 2);
        currentMapInfo.rect = cc.rect(offsetX / 2, offsetY / 2, mapSize.width, mapSize.height);
        return currentMapInfo;
      },
      darwDebugInfo: function darwDebugInfo() {
        var currentMapInfo = this.getCurrentMapInfo();
        var tileSize = this.currentMap.getTileSize();
        var offset = currentMapInfo.offset;
        var graphicsNode = new cc.Node("MapDebugNode");
        var g = graphicsNode.addComponent(cc.Graphics);
        graphicsNode.parent = cc.director.getScene();
        for (var i = 0; i <= currentMapInfo.mapNumSize.width; i++) {
          g.moveTo(i * tileSize.width + offset.x, offset.y);
          g.lineTo(i * tileSize.width + offset.x, offset.y + currentMapInfo.mapSize.height);
        }
        for (var j = 0; j <= currentMapInfo.mapNumSize.height; j++) {
          g.moveTo(0 + offset.x, j * tileSize.height + offset.y);
          g.lineTo(currentMapInfo.mapSize.width + offset.x, j * tileSize.height + offset.y);
        }
        g.stroke();
      },
      getMapRolePos: function getMapRolePos() {
        var posMap = {};
        var staticBoxObj = this.currentMap.getObjectGroup("role");
        if (staticBoxObj) {
          var boxArr = staticBoxObj.getObjects();
          for (var i = 0; i < boxArr.length; i++) {
            var boxNode = boxArr[i];
            var data = boxNode.getProperties();
            var pos = this.exchangePos(cc.p(data.x, data.y));
            data.name && (posMap[data.name] = pos);
          }
        }
        return posMap;
      }
    });
    cc._RF.pop();
  }, {
    NavEdge: "NavEdge",
    NavNode: "NavNode",
    Platform: "Platform"
  } ],
  NavEdge: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "685beQ1VDZJLo8v2snchX06", "NavEdge");
    "use strict";
    cc.Class({
      ctor: function ctor() {
        this.headNode = null;
        this.lastNode = null;
      },
      init: function init(args) {
        args = args || {};
        this.headNode = args.headNode;
        this.lastNode = args.lastNode;
      },
      drawSelf: function drawSelf(g) {
        g.fillColor = cc.hexToColor("#000000");
        g.strokeColor = cc.hexToColor("#000000");
        g.moveTo(this.headNode.pos.x, this.headNode.pos.y);
        g.lineTo(this.lastNode.pos.x, this.lastNode.pos.y);
        g.stroke();
        g.fill();
      }
    });
    cc._RF.pop();
  }, {} ],
  NavNode: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "43680o0gWVLArz5mzc/0YX5", "NavNode");
    "use strict";
    cc.Class({
      ctor: function ctor() {
        this.edgeList = {};
      },
      init: function init(args) {
        args = args || {};
        this.pos = args.pos;
        this.size = args.size;
      },
      drawSelf: function drawSelf(g, color) {
        if (color) {
          g.fillColor = color;
          g.strokeColor = color;
        } else {
          g.fillColor = cc.hexToColor("#000000");
          g.strokeColor = cc.hexToColor("#000000");
        }
        g.rect(this.pos.x - 3, this.pos.y - 3, 6, 6);
        g.stroke();
        g.fill();
      },
      setEdge: function setEdge(type, edge) {
        this.edgeList[type] = edge;
      },
      isHaveMidBottpm: function isHaveMidBottpm() {
        var rs = !!this.edgeList["mid_bottom"];
        return !rs;
      },
      foreachEdge: function foreachEdge(func) {
        for (var key in this.edgeList) {
          var edge = this.edgeList[key];
          edge && func(key, edge);
        }
      }
    });
    cc._RF.pop();
  }, {} ],
  Platform: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "c319de4T0BPHrK15SV7H8B3", "Platform");
    "use strict";
    cc.Class({
      ctor: function ctor() {
        this.nodeList = [];
      },
      init: function init(args) {
        args = args || {};
        this.pos = args.pos;
        this.size = args.size;
      },
      contains: function contains(node) {
        return this.nodeList.contains(node);
      },
      canAdd: function canAdd(pNode) {
        for (var i = 0; i < this.nodeList.length; i++) {
          var node = this.nodeList[i];
          for (var key in node.edgeList) if (node.edgeList.hasOwnProperty(key)) {
            var edge = node.edgeList[key];
            if (edge.lastNode == pNode) return true;
          }
        }
      },
      addNode: function addNode(node) {
        this.nodeList.push(node);
      },
      drawSelf: function drawSelf(g, color) {
        if (color) {
          g.fillColor = color;
          g.strokeColor = color;
        } else {
          g.fillColor = cc.hexToColor("#000000");
          g.strokeColor = cc.hexToColor("#000000");
        }
        this.nodeList.forEach(function(node) {
          g.rect(node.pos.x - 3, node.pos.y - 3, 6, 6);
        }, this);
        g.stroke();
        g.fill();
      },
      getRandomNode: function getRandomNode() {
        var index = Math.floor(Math.random() * this.nodeList.length);
        return this.nodeList[index];
      }
    });
    cc._RF.pop();
  }, {} ],
  RoleAnimCpt: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "0c017ODUlBKKKzRKGT2STQE", "RoleAnimCpt");
    "use strict";
    cc.Class({
      extends: cc.Component,
      properties: {
        aniNode: cc.Node
      },
      onLoad: function onLoad() {
        this.defScaleX = this.aniNode.scaleX;
        this.rigidBody = this.getComponent(cc.RigidBody);
        this.anim = this.aniNode.getComponent(cc.Animation);
        this.anim.play("role_1001_idel");
      },
      update: function update(dt) {
        var rigVec = this.rigidBody.getLinearVelocityFromWorldPoint(this.rigidBody.getWorldCenter());
        rigVec.x > .1 ? this.aniNode.scaleX = this.defScaleX : rigVec.x < -.1 && (this.aniNode.scaleX = -this.defScaleX);
        Math.abs(rigVec.x) > 3 ? "role_1001_walk" != this.anim.currentClip.name && this.anim.play("role_1001_walk") : "role_1001_idel" != this.anim.currentClip.name && this.anim.play("role_1001_idel");
      }
    });
    cc._RF.pop();
  }, {} ],
  RoleAttribute: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "75a33lzNahHuY6h+5T1omT9", "RoleAttribute");
    "use strict";
    cc.Class({
      extends: cc.Component,
      properties: {},
      start: function start() {}
    });
    cc._RF.pop();
  }, {} ],
  RoleCpt: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "fe5e6Pg1OFAnYoVOoA3Hd00", "RoleCpt");
    "use strict";
    cc.Class({
      extends: cc.Component,
      properties: {
        navPosNode: cc.Node
      },
      onLoad: function onLoad() {
        var graphicsNode = new cc.Node("MapDebugNode");
        this.g = graphicsNode.addComponent(cc.Graphics);
        graphicsNode.parent = cc.director.getScene();
        this.targetNavNode = null;
        this.schedule(function() {
          if (this.getCurrentNavNode() == this.targetNavNode && this.platform) {
            this.targetNavNode = this.platform.getRandomNode();
            this.getComponent("Steering").setTargetPos(this.targetNavNode.pos);
          } else this.updateCurrentPlatform();
        }, 2);
      },
      updateCurrentPlatform: function updateCurrentPlatform() {
        var currentNavNode = this.getCurrentNavNode();
        this.targetNavNode = currentNavNode;
        this.platform = GM.mapManager.getPlatformByNode(currentNavNode);
        return this.platform;
      },
      getCurrentNavNode: function getCurrentNavNode() {
        var worldPos = this.node.convertToWorldSpaceAR(this.navPosNode.getPosition());
        var node = GM.mapManager.getNavNodeByPos(worldPos);
        return node;
      }
    });
    cc._RF.pop();
  }, {} ],
  Steering: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "2f9acz5dIpDKZ4szWtl39hx", "Steering");
    "use strict";
    cc.Class({
      extends: cc.Component,
      properties: {
        maxSpeed: 1e3
      },
      onLoad: function onLoad() {
        this.rigidBody = this.getComponent(cc.RigidBody);
        var mouseNode = new cc.Node("MouseNode");
        mouseNode.parent = cc.director.getScene();
        mouseNode.width = cc.winSize.width;
        mouseNode.height = cc.winSize.height;
        mouseNode.x = cc.winSize.width / 2;
        mouseNode.y = cc.winSize.height / 2;
      },
      updateTargetPos: function updateTargetPos(event) {
        var pos = event.getLocation();
        this.targetPos = cc.v2(pos.x, pos.y);
      },
      setTargetPos: function setTargetPos(targetPos) {
        this.targetPos = targetPos;
      },
      start: function start() {},
      update: function update(dt) {
        this.targetPos && this.rigidBody.applyLinearImpulse(this.arrive(this.targetPos), this.rigidBody.getLocalCenter());
      },
      seek: function seek(targetPos) {
        var desiredVelocity = targetPos.sub(this.rigidBody.getWorldPosition()).normalize().mul(this.maxSpeed);
        return desiredVelocity.sub(this.rigidBody.linearVelocity);
      },
      flee: function flee(targetPos) {
        var panicDisSq = 1e4;
        if (this.rigidBody.getWorldPosition().sub(targetPos).magSqr() > panicDisSq) return cc.v2(0, 0);
        var desiredVelocity = this.rigidBody.getWorldPosition().sub(targetPos).normalize().mul(this.maxSpeed);
        return desiredVelocity.sub(this.rigidBody.linearVelocity);
      },
      arrive: function arrive(targetPos) {
        var toTarget = targetPos.sub(this.rigidBody.getWorldPosition());
        var dist = toTarget.mag();
        if (dist > 0) {
          var deceleration = .2;
          var speed = dist / deceleration * 1;
          speed = Math.min(speed, this.maxSpeed);
          var desiredVelocity = toTarget.mul(speed / dist);
          return desiredVelocity.sub(this.rigidBody.linearVelocity);
        }
        return cc.v2(0, 0);
      }
    });
    cc._RF.pop();
  }, {} ]
}, {}, [ "MainMenu", "CameraManager", "EnemyManager", "GameManager", "MapManager", "BaseScript", "NavEdge", "NavNode", "Platform", "RoleAnimCpt", "RoleAttribute", "RoleCpt", "Steering", "HotUpdate" ]);