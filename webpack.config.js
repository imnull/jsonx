var webpack = require("webpack");
let env = process.argv[2] || '';
env = env.substr(env.indexOf('=') + 1)

let output = {
    library: 'jsonx',
    path: __dirname,
};

let minimize;

if(env === 'window'){
    output.filename = 'jsonx.min.js';
    output.libraryTarget = 'window';
    minimize = true;
} else {
    output.filename = 'jsonx.min.common.js';
    output.libraryTarget = 'commonjs2';
    minimize = true;
}

module.exports = {
    entry: {
        bundle : './jsonx.js'
    },
    output: output,
    module: {
        rules: [
           
        ]
    },
    resolve:{
        extensions:['.js']  //用于配置程序可以自行补全哪些文件后缀
    },

    optimization: {
        minimize: minimize
    },
};