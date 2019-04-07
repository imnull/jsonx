const jsonx = require('./jsonx');

const samples = [
  `null`,
  `1e3`,
  `'1e3'`,
  `"String"`,
  `[1,2,3,{a:1}]`,
  `callback([1, {
        '  
          123456    ':1234,
        1234567:'JSONP here',
        "12345678":"1123456",
    },null]);
  `,
  `{ 'a': 'abc' }`,
  `{ aaaaa : 'abc' }`,
  `{ 555 : 666 }`,
  `{
    aaa:[
      1,
      2,
      3,
      '4'
  }`
];

const test = (s) => {
  try {
    let v = jsonx.parse(s);
    let t = Object.prototype.toString.call(v);
    let j = JSON.stringify(v);
    console.log({ s, v, t, j });
  } catch(error){
    console.log({ s, error: error })
  }
  
}

samples.forEach(s => test(s));

console.log('\n### TEST END ###\n')