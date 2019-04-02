# JSONX
200行的泛JSON(P)解析器。


# 安装

    npm i json-generic

NPM: https://www.npmjs.com/package/json-generic

## 更新

### 1.1.1
- 完善文档

### 1.1.0
- 模块化适配，支持 `Common-Module`、`AMD`、`Browser`。
- `Quote` `Nest` 解析失败错误处理和定位
- 方法名称优化
- 增加`HTML`测试文件`test.html`


## 特性
- 可识别`JSON`、`JSONP`、`JavaScript`等数据格式
- 单双引号均可使用
- 破损文档的错误定位

## 使用

    const jsonx = require('json-generic');

    console.log(jsonx.parse(`null`));
    console.log(jsonx.parse(`1e3`));
    console.log(jsonx.parse(`'1e3'`));
    console.log(jsonx.parse(`"String"`));
    console.log(jsonx.parse(`[1,2,3,{a:1}]`));
