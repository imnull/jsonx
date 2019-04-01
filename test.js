const jsonx = require('./index');

console.log(jsonx.parse(`null`));
console.log(jsonx.parse(`1e3`));
console.log(jsonx.parse(`'1e3'`));
console.log(jsonx.parse(`"String"`));
console.log(jsonx.parse(`[1,2,3,{a:1}]`));

console.log(jsonx.parse(`callback([1, {
    '  
      123456    ':1234,
    1234567:'JSONP here',
    "12345678":"1123456",
},null]);
`));


console.log(jsonx.parse(`{ 'a': 'abc' }`));
console.log(jsonx.parse(`{ aaaaa : 'abc' }`));