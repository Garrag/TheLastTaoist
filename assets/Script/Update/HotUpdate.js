// Custom manifest removed the following assets:
// 1. res/raw-assets/textures/UI/chat/button_orange.png
// 2. res/raw-assets/textures/UI/chat/gb_inputbox.png
// So when custom manifest used, you should be able to find them in downloaded remote assets
cc.Class({
    extends: cc.Component,
    properties: {
        panel_: cc.Node,//更新面板ui对象
        manifestUrl: cc.RawAsset,//客户端原始的配置文件
        versionLabel: cc.Label,//版本号文本
        _updating: false,//是否更新状态位
        _canRetry: false,//是否能重试
        _canUpdate: false,//是否可以更新
        _needRestart: false,//是否需要重启,来使热更新生效
        _storagePath: '',
        _versionCode: '',//版本code
    },
    //检测热更新的结果回调
    checkCb: function (event) {
        cc.log('checkCb Code: ' + event.getEventCode());
        var isContinue = true;
        switch (event.getEventCode()) {
            //没有本地描述文件来初始化资源管理器
            case jsb.EventAssetsManager.ERROR_NO_LOCAL_MANIFEST:
                this.panel.info.string = "No local manifest file found, hot update skipped.";
                isContinue = false;
                cc.log("No local manifest file found, hot update skipped.");
                break;
            //下载描述文件失败
            case jsb.EventAssetsManager.ERROR_DOWNLOAD_MANIFEST:
            //解析描述文件失败
            case jsb.EventAssetsManager.ERROR_PARSE_MANIFEST:
                this.panel.info.string = "Fail to download manifest file, hot update skipped.";
                isContinue = false;
                cc.log("Fail to download manifest file, hot update skipped.");
                break;
            //已经是最新版本
            case jsb.EventAssetsManager.ALREADY_UP_TO_DATE:
                this.panel.info.string = "Already up to date with the latest remote version.";
                cc.log("Already up to date with the latest remote version.");
                break;
            //有新版本发现
            case jsb.EventAssetsManager.NEW_VERSION_FOUND:
                this.panel.info.string = 'New version found, please try to update.';
                cc.log('New version found, please try to update.')
                //this.panel.checkBtn.active = false;//显示去更新按钮
                this.panel.fileProgress.progress = 0;
                this.panel.byteProgress.progress = 0;
                this._canUpdate = true;
                isContinue = false;
                break;
            default:
                return;
        }
        if (isContinue == false) {
            this.cleanCheckListener();
            this._updating = false;
            this._canUpdate = true;
            this._canRetry = false;
            this.updatePanel();
        }
    },
    //资源管理器 事件 更新回调
    updateCb: function (event) {
        var needRestart = false;
        var failed = false;
        cc.log('updateCb Code: ' + event.getEventCode());
        switch (event.getEventCode()) {
            //没有本地描述文件
            case jsb.EventAssetsManager.ERROR_NO_LOCAL_MANIFEST:
                this.panel.info.string = 'No local manifest file found, hot update skipped.';
                cc.log('No local manifest file found, hot update skipped.')
                failed = true;
                break;
            //更新进度事件
            case jsb.EventAssetsManager.UPDATE_PROGRESSION:
                //设置进度条
                this.panel.byteProgress.progress = event.getPercent();
                this.panel.fileProgress.progress = event.getPercentByFile();
                //设置进度条文本
                this.panel.fileLabel.string = `files:(${event.getDownloadedFiles()}/${event.getTotalFiles()})`;
                this.panel.byteLabel.string = `bytes:(${event.getDownloadedBytes()}/${event.getTotalBytes()})`;
                //当前状态文本
                var msg = event.getMessage();
                if (msg) {
                    this.panel.info.string = 'Updated file: ' + msg;
                    // cc.log(event.getPercent()/100 + '% : ' + msg);
                }
                break;
            //下载配置文件失败
            case jsb.EventAssetsManager.ERROR_DOWNLOAD_MANIFEST:
            //解析配置文件失败
            case jsb.EventAssetsManager.ERROR_PARSE_MANIFEST:
                this.panel.info.string = 'Fail to download manifest file, hot update skipped.';
                failed = true;
                break;
            //已经是最新版本
            case jsb.EventAssetsManager.ALREADY_UP_TO_DATE:
                this.panel.info.string = 'Already up to date with the latest remote version.';
                failed = true;
                break;
            //更新结束
            case jsb.EventAssetsManager.UPDATE_FINISHED:
                this.panel.info.string = 'Update finished. ' + event.getMessage();
                needRestart = true;//需要重启
                break;
            //更新失败,可以尝试下载无法下载的资源
            case jsb.EventAssetsManager.UPDATE_FAILED:
                this.panel.info.string = 'Update failed. ' + event.getMessage();
                this._canRetry = true;
                break;
            //更新错误
            case jsb.EventAssetsManager.ERROR_UPDATING:
                this.panel.info.string = 'Asset update error: ' + event.getAssetId() + ', ' + event.getMessage();
                break;
            //解压缩失败
            case jsb.EventAssetsManager.ERROR_DECOMPRESS:
                this.panel.info.string = event.getMessage();
                break;
            default:
                break;
        }
        //如果失败,移除监听器,清除正在更新标志位
        if (failed) {
            this.cleanUpdateListener();
            this._updating = false;
            this.updatePanel();
        }
        //需要重启
        this._needRestart = needRestart;
        if (this._needRestart) {
            this.updatePanel();
        }
    },
    //清理并重载 整个游戏
    restartGame: function () {
        this.cleanUpdateListener();
        // Prepend the manifest's search path
        var searchPaths = jsb.fileUtils.getSearchPaths();
        var newPaths = this._am.getLocalManifest().getSearchPaths();
        //console.log(JSON.stringify(newPaths));
        cc.log("hotUpdate path:", newPaths);
        //将新下载的本地文件下载路径,移动至文件索引器的前端(保证下载的本地文件被优先引用)
        Array.prototype.unshift(searchPaths, newPaths);
        // This value will be retrieved and appended to the default search path during game startup,
        // please refer to samples/js-tests/main.js for detailed usage.
        // !!! Re-add the search paths in main.js is very important, otherwise, new scripts won't take effect.
        cc.sys.localStorage.setItem('HotUpdateSearchPaths', JSON.stringify(searchPaths));
        //将重组好的索引路径队列设置回,文件管理器
        jsb.fileUtils.setSearchPaths(searchPaths);
        //停止音效
        cc.audioEngine.stopAll();
        //重启游戏
        cc.game.restart();
    },
    //读取本本地的 文件来初始化资源管理器(按钮驱动)
    loadCustomManifest: function () {
        if (this._am.getState() === jsb.AssetsManager.State.UNINITED) {
            var manifest = null;
            //如果本地热更新目录不存在,那么使用游戏初始配置文件
            if (jsb.fileUtils.isFileExist(this._storagePath + "\project.manifest") == false) {
                var rawManifestStr = this.manifestUrl;
                var rawManifest = JSON.parse(jsb.fileUtils.getStringFromFile(this.manifestUrl));
                this._versionCode = rawManifest.version;

                manifest = new jsb.Manifest(rawManifestStr, this._storagePath);
                this.panel.info.string = 'Using raw manifest';
            }
            else {
                //判断本地与原生版本号差异,如果原生版本号更高,那么删除本地过期热更新路径
                var localManifest = JSON.parse(jsb.fileUtils.getStringFromFile(this._storagePath + "\project.manifest"));
                var rawManifest = JSON.parse(jsb.fileUtils.getStringFromFile(this.manifestUrl));
                var ret = this.versionCompareHandle(rawManifest.version, localManifest.version);

                //原生版本高于本地版本,使用原生版本
                if (ret > 0) {
                    this._versionCode = rawManifest.version;
                    manifest = new jsb.Manifest(rawManifestStr, this._storagePath);
                    this.panel.info.string = 'Using raw manifest';
                } else if (ret <= 0) {//原生版本小于本地版本,使用本地版本
                    this._versionCode = localManifest.version;
                    manifest = new jsb.Manifest(localManifest, this._storagePath);
                    this.panel.info.string = 'Using local manifest';
                }
            }
            if (manifest != null) {
                this._am.loadLocalManifest(manifest, this._storagePath);
            }
            if (this.versionLabel) {
                this.versionLabel.string = "V" + (this._versionCode);
            }
        }
    },
    //重试
    retry: function () {
        if (!this._updating && this._canRetry) {
            //this.panel.retryBtn.active = false;
            this._canRetry = false;

            this.panel.info.string = 'Retry failed Assets...';
            this._am.downloadFailedAssets();
        }
    },
    cleanCheckListener: function () {
        if (this._checkListener != null) {
            cc.eventManager.removeListener(this._checkListener);
            this._checkListener = null;
        }
    },
    //检测热更新(按钮驱动)
    checkUpdate: function () {
        //如果正在更新返回
        if (this._updating) {
            this.panel.info.string = 'Checking or updating ...';
            return;
        }
        //资源管理器没有描述文件初始化,尝试用本地描述文件进行初始化.
        if (this._am.getState() === jsb.AssetsManager.State.UNINITED) {
            this._am.loadLocalManifest(this.manifestUrl);
        }
        //如果初始化失败,那么表明当前还买有本地描述文件(没有成功进行过一次热更新).
        if (!this._am.getLocalManifest() || !this._am.getLocalManifest().isLoaded()) {
            this.panel.info.string = 'Failed to load local manifest ...';
            return;
        }
        //注册资源管理监听器
        this.cleanCheckListener()
        this._checkListener = new jsb.EventListenerAssetsManager(this._am, this.checkCb.bind(this));
        cc.eventManager.addListener(this._checkListener, 1);
        //检测热更新
        this._updating = true;
        this._am.checkUpdate();
    },
    //
    cleanUpdateListener: function () {
        if (this._updateListener) {
            //移除监听器
            cc.eventManager.removeListener(this._updateListener);
            this._updateListener = null;
        }
    },
    //开始热更新(按钮驱动)
    hotUpdate: function () {
        if (this._am && !this._updating && this._canUpdate) {
            this._canUpdate = false;
            //注册 热更新事件监听
            this._updateListener = new jsb.EventListenerAssetsManager(this._am, this.updateCb.bind(this));
            cc.eventManager.addListener(this._updateListener, 1);

            if (this._am.getState() === jsb.AssetsManager.State.UNINITED) {
                this._am.loadLocalManifest(this.manifestUrl);
            }
            this._failCount = 0;
            this._am.update();
            //this.panel.updateBtn.active = false;
            this._updating = true;
        }
    },
    //
    show: function () {
        cc.log("this.panel.node.active:", this.panel.node.active);
        if (this.panel.node.active === false) {
            this.panel.node.active = true;
        }
    },
    //
    hide: function () {
        cc.log("this.panel.node.active:", this.panel.node.active);
        if (this.panel.node.active === true) {
            this.panel.node.active = false;
        }
        this.init();//每次关闭初始化一次.
    },
    updatePanel: function () {
        //cc.log("!!!!!!!this._canRetry:",this._canRetry,"this._updating:",this._updating,"this._canUpdate:",this._canUpdate)
        if (this.versionLabel) {
            this.versionLabel.string = "V" + (this._versionCode || " null");
        }
        if (this._updating) {
            this.panel.btnRetry.active = false;
            this.panel.btnClose.active = false;
            this.panel.btnUpdate.active = false;
            this.panel.btnCheck.active = false;
        } else {
            this.panel.btnClose.active = true;
            if (this._canRetry) {
                this.panel.btnRetry.active = true;
                this.panel.btnUpdate.active = false;
                this.panel.btnCheck.active = false;
            }
            else if (this._canUpdate) {
                this.panel.btnRetry.active = false;
                this.panel.btnUpdate.active = true;
                this.panel.btnCheck.active = false;
            }
            else {
                this.panel.btnRetry.active = false;
                this.panel.btnUpdate.active = false;
                this.panel.btnCheck.active = true;
            }
        }
        if (this._needRestart) {
            this.restartGame();//重启游戏
        }
    },
    // Setup your own version compare handler, versionA and B is versions in string
    // if the return value greater than 0, versionA is greater than B,
    // if the return value equals 0, versionA equals to B,
    // if the return value smaller than 0, versionA is smaller than B.
    //比对版本号的方法 string,string
    versionCompareHandle: function (versionA, versionB) {
        cc.log("JS Custom Version Compare: version A is " + versionA + ', version B is ' + versionB);
        var vA = versionA.split('.');
        var vB = versionB.split('.');
        for (var i = 0; i < vA.length; ++i) {
            var a = parseInt(vA[i]);
            var b = parseInt(vB[i] || 0);
            if (a === b) {
                continue;
            }
            else {
                return a - b;
            }
        }
        if (vB.length > vA.length) {
            return -1;
        }
        else {
            return 0;
        }
    },
    // use this for initialization
    onLoad: function () {
        // Hot update is only available in Native build
        //判断是否是原生环境,web环境不需要热更新.
        if (!cc.sys.isNative) {
            return;
        }
        this._checkListener = null;//检测版本的时候的监听器
        this._updateListener = null;//热更新的时候的监听器
        var panel = this.panel_.getComponent("HotUpdatePanel");
        this.panel = panel;
        //存放远程版本更新文件的路径
        this._storagePath = ((jsb.fileUtils ? jsb.fileUtils.getWritablePath() : '/') + 'remote-asset');
        cc.log("!!!!!_storagePath:", this._storagePath);
        this.init();
        // Setup the verification callback, but we don't have md5 check function yet, so only print some message
        // Return true if the verification passed, otherwise return false
        //注册资源校验回调
        this._am.setVerifyCallback(function (path, asset) {
            // When asset is compressed, we don't need to check its md5, because zip file have been deleted.
            var compressed = asset.compressed;
            // Retrieve the correct md5 value.
            var expectedMD5 = asset.md5;
            // asset.path is relative path and path is absolute.
            var relativePath = asset.path;
            // The size of asset file, but this value could be absent.
            var size = asset.size;
            //需要解压不需要校验md5
            if (compressed) {
                panel.info.string = "Verification passed : " + relativePath;
                return true;
            }
            else {
                panel.info.string = "Verification passed : " + relativePath + ' (' + expectedMD5 + ')';
                return true;
            }
        });
        //this.panel.info.stringthis.panel.info.string = 'Hot update is ready, please check or directly update.';
        if (cc.sys.os === cc.sys.OS_ANDROID) {
            // Some Android device may slow down the download process when concurrent tasks is too much.
            // The value may not be accurate, please do more test and find what's most suitable for your game.
            this._am.setMaxConcurrentTask(2);
            //this.panel.info.string = "Max concurrent tasks count have been limited to 2";
        }
    },
    init: function () {
        cc.log('init AssetsManager for remote asset : ' + this._storagePath);
        this.panel.fileProgress.progress = 0;
        this.panel.byteProgress.progress = 0;
        this.panel.byteLabel.string = "";
        this.panel.fileLabel.string = "";
        this.panel.info.string = "";
        //设置状态标志位
        this._canRetry = false;
        this._needRestart = false;
        this._canUpdate = true;
        this._updating = false;
        //清空资源管理器
        if (this._am && !cc.sys.ENABLE_GC_FOR_NATIVE_OBJECTS) {
            this._am.release();
            this._am = null;
        }
        // Init with empty manifest url for testing custom manifest
        //构建本地资源管理器,使用本地的资源描述文件
        this._am = new jsb.AssetsManager('', this._storagePath, this.versionCompareHandle);
        if (!cc.sys.ENABLE_GC_FOR_NATIVE_OBJECTS) {
            this._am.retain();
        }
        //判断本地版本与热更新目录下的版本号,如果本地版本更高,那么说明进行过大版本更细,需要清理热更新目录,
        //否则使用热更新目录下的
        this.loadCustomManifest();
        this.updatePanel();
    },
    //销毁之时 清除
    onDestroy: function () {
        if (this._updateListener) {
            cc.eventManager.removeListener(this._updateListener);
            this._updateListener = null;
        }
        if (this._am && !cc.sys.ENABLE_GC_FOR_NATIVE_OBJECTS) {
            this._am.release();
        }
    }
});
