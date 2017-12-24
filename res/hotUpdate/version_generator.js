var fs = require('fs');
var path = require('path');
var crypto = require('crypto');
var exePath = 'E:/CocosCreator_v1.7.2-beta.1/CocosCreator.exe'
var ip = '192.168.0.107:3456';
var noVersion = 'noVersion'
var src = './web-desktop';

var manifest = {
    packageUrl: `http://${ip}/hotupdate/remote-assets/`,
    remoteManifestUrl: `http://${ip}/hotupdate/remote-assets/project.manifest`,
    remoteVersionUrl: `http://${ip}/hotupdate/remote-assets/version.manifest`,
    version: '1.0.0',
    assets: {},
    searchPaths: []
};

//处理参数
var i = 2;
while (i < process.argv.length) {
    var arg = process.argv[i];
    switch (arg) {
        case '--url':
        case '-u':
            var url = process.argv[i + 1];
            manifest.packageUrl = url;
            manifest.remoteManifestUrl = url + 'project.manifest';
            manifest.remoteVersionUrl = url + 'version.manifest';
            i += 2;
            break;
        case '--version':
        case '-v':
            manifest.version = process.argv[i + 1];
            noVersion = manifest.version
            i += 2;
            break;
        case '--src':
        case '-s':
            src = process.argv[i + 1];
            i += 2;
            break;
        case '--dest':
        case '-d':
            dest = process.argv[i + 1];
            i += 2;
            break;
        default:
            i++;
            break;
    }
}

var dest = `./${noVersion}/remote-assets/`;

//递归创建目录 同步方法  
var mkdirsSync = module.exports.mkdirsSync = function (dirname) {
    //console.log(dirname);  
    if (fs.existsSync(dirname)) {
        return true;
    } else {
        if (mkdirsSync(path.dirname(dirname))) {
            fs.mkdirSync(dirname);
            return true;
        }
    }
}
//读取文件夹处理文件
var readDir = function (dir, obj) {
    var stat = fs.statSync(dir);
    if (!stat.isDirectory()) {
        return;
    }
    var subpaths = fs.readdirSync(dir), subpath, size, md5, compressed, relative;
    for (var i = 0; i < subpaths.length; ++i) {
        if (subpaths[i][0] === '.') {
            continue;
        }
        subpath = path.join(dir, subpaths[i]);
        stat = fs.statSync(subpath);
        if (stat.isDirectory()) {
            readDir(subpath, obj);
        }
        else if (stat.isFile()) {
            // Size in Bytes
            size = stat['size'];
            md5 = crypto.createHash('md5').update(fs.readFileSync(subpath, 'binary')).digest('hex');
            compressed = path.extname(subpath).toLowerCase() === '.zip';

            relative = path.relative(src, subpath);
            relative = relative.replace(/\\/g, '/');
            relative = encodeURI(relative);
            obj[relative] = {
                'size': size,
                'md5': md5
            };
            if (compressed) {
                obj[relative].compressed = true;
            }
        }
    }
}
//处理脚本
var init = function () {
    //处理资源
    readDir(path.join(src, 'src'), manifest.assets);
    readDir(path.join(src, 'res'), manifest.assets);
    //导出设置
    var destManifest = path.join(dest, 'project.manifest');
    var destVersion = path.join(dest, 'version.manifest');
    //创建到处路径
    mkdirsSync(dest)
    fs.writeFile(destManifest, JSON.stringify(manifest), (err) => {
        if (err) throw err;
        console.log('Manifest successfully generated');
    });
    delete manifest.assets;
    delete manifest.searchPaths;
    fs.writeFile(destVersion, JSON.stringify(manifest), (err) => {
        if (err) throw err;
        console.log('Version successfully generated');
    });
}

/*
 * 复制目录、子目录，及其中的文件
 * @param src {String} 要复制的目录
 * @param dist {String} 复制到目标目录
 */
function copyDir(src, dist, callback) {
    fs.access(dist, function (err) {
        if (err) {
            // 目录不存在时创建目录
            fs.mkdirSync(dist);
        }
        _copy(null, src, dist);
    });

    function _copy(err, src, dist) {
        if (err) {
            callback(err);
        } else {
            fs.readdir(src, function (err, paths) {
                if (err) {
                    callback(err)
                } else {
                    paths.forEach(function (path) {
                        var _src = src + '/' + path;
                        var _dist = dist + '/' + path;
                        fs.stat(_src, function (err, stat) {
                            if (err) {
                                callback(err);
                            } else {
                                // 判断是文件还是目录
                                if (stat.isFile()) {
                                    fs.writeFileSync(_dist, fs.readFileSync(_src));
                                } else if (stat.isDirectory()) {
                                    // 当是目录是，递归复制
                                    copyDir(_src, _dist, callback)
                                }
                            }
                        })
                    })
                }
            })
        }
    }
}
//复制res 和 src 到版本差异文件夹内
var copyResAndSrc = function () {
    copyDir(src + '/res', `./${noVersion}/remote-assets/res`)
    copyDir(src + '/src', `./${noVersion}/remote-assets/src`)
}

var exec = require('child_process').exec;
var cmd = `E:/CocosCreator_v1.7.2-beta.1/CocosCreator.exe --path ../../ --build "buildPath=./res/hotUpdate/;platform=web-desktop;"`;
console.log('======================生成原生项目===========================')
exec(cmd, function (error, stdout, stderr) {
    // 获取命令执行的输出
    console.log(stdout)
    console.log('====================================开始差异文件=======================')
    init()
    console.log('====================================复制res 和 src 到版本差异文件夹内=======================')
    copyResAndSrc()
});