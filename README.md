# JSONX
泛JSON(P)解析器。

## 特性
- 可识别JSONP格式
- 单双引号均可使用
- 允许JS对象格式

## 使用

    const jsonx = require('./index');

    console.log(jsonx.parse(`null`));
    console.log(jsonx.parse(`1e3`));
    console.log(jsonx.parse(`'1e3'`));
    console.log(jsonx.parse(`"String"`));
    console.log(jsonx.parse(`[1,2,3,{a:1}]`));
