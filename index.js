(function(factory){
	if(typeof(module) === 'object' && typeof(exports) === 'object'){
		module.exports = factory();
	} else if(typeof(define) === 'function'){
		define(factory());
	} else if(typeof(window) === 'object'){
		window.jsonx = factory();
	}
})(function(){
	/**
	 * 引号内逃逸字
	 */
	const ESC = '\\';
	/**
	 * TOKEN状态名称聚合定义
	 */
	const ST = {
		'"': 'quote',
		"'": 'quote',
		',': 'comma',
		':': 'colon',
		'{': 'nest',
		'[': 'nest',
		'(': 'nest',
	};
	/**
	 * 成对嵌套字符集
	 */
	const NESTS = { '{': '}', '[': ']', '(': ')' };
	/**
	 * 检查字符状态
	 * @param {String} c 字符
	 */
	const _st = (c) => c in ST ? ST[c] : 'plain';
	/**
	 * 去头尾空格
	 * @param {String} s 字符串
	 */
	const trim = s => s.replace(/^\s+|\s+$/g, '');
	const LnCol = (str, i) => {
		let lns = str.substr(0, i + 1).split('\n');
		return [lns.length, lns.pop().length];
	}
	/**
	 * 创建一个读取单位节点
	 * @param {String} s 原始字符串
	 * @param {Number} index 开始索引位置
	 * @param {Number} size 字符串长度
	 * @param {Object} ext 扩展属性对象
	 */
	const seg = (s, index, size, ext = {}) => {
		let status = _st(s[index]);
		let text = s.substr(index, size);
		switch(status){
			case 'quote':
				text = text.substr(1, text.length - 2);
				break;
			case 'plain':
				text = trim(text)
				break;
		}
		return { status, text, ...ext };
	};
	/**
	 * 转换节点为JS值
	 * @param {Object} n 节点
	 */
	const value = n => {
		switch(n.status){
			case 'plain':
				return JSON.parse(n.text);
			case  'nest':
				return n.left in parser ? parser[n.left](n) : n.text;
			default:
				return n.text;
		}
	};
	/**
	 * 各TOKEN读取方法
	 */
	const readers = {
		quote: (s, _i, sub) => {
			let i = _i, len = s.length, q = s[i++], c;
			for(; i < len; i++){
				c = s[i];
				if(c === ESC){
					i += 1;
				} else if(c === q){
					sub.push(seg(s, _i, i - _i + 1, { quote: q }))
					return i;
				}
			}
			let [ln, col] = LnCol(s, _i);
			throw `Quote is not closed. [${q}] at Ln ${ln} Col ${col}`;
		},
		nest: (s, _i, _sub) => {
			let i = _i, left = s[i++], right = NESTS[left], c, st;
			let j = i;
			let sub = [];
			for(; i < s.length; i++){
				c = s[i];
				st = _st(c);
				if(st in readers){
					if(i > j){
						sub.push(seg(s, j, i - j))
					}
					i = readers[st](s, i, sub);
					j = i + 1;
				} else if(c === right){
					if(i > j){
						sub.push(seg(s, j, i - j))
					}
					sub = sub.filter(n => n.status !== 'plain' || !/^\s*$/.test(n.text));
					_sub.push(seg(s, _i, i - _i + 1, { left, sub }));
					return i;
				}
			}
			let [ln, col] = LnCol(s, _i);
			throw `Nest is not closed. "${left}" at Ln ${ln} Col ${col}`;
		},
		comma: (s, i, sub) => {
			sub.push(seg(s, i, 1));
			return i;
		},
		colon: (s, i, sub) => {
			sub.push(seg(s, i, 1));
			return i;
		}
	};
	/**
	 * 读取文档，解析为节点集合。
	 * @param {String} s 原始字符串
	 * @param {Number} i 起始索引
	 * @param {Array} r 节点寄存
	 */
	const read = (s, i = 0, r = []) => {
		let j = i, len = s.length;
		for(; i < len; i++){
			let c = s[i];
			let st = _st(c);
			if(st in readers){
				if(j < i){
					r.push(seg(s, j, i - j))
				}
				i = readers[st](s, i, r);
				if(i < 0){
					return r;
				}
				j = i + 1;
			}
		}
		if(j < i){
			r.push(seg(s, j, i - j))
		}
		return r;
	};
	/**
	 * 嵌套类型值转换器（数组|对象）
	 */
	const parser = {
		'[': n => n.sub.filter(n => n.status !== 'comma').map(n => value(n)),
		'{': n => {
			let r = {};
			let i = 0, sub = n.sub.filter(n => n.status !== 'comma'), len = Math.floor(sub.length / 3) * 3;
			for(; i < len; i += 3){
				if(sub[i + 1].status !== 'colon'){
					return r;
				}
				r[sub[i + 0].text] = value(sub[i + 2]);
			}
			return r;
		}
	};
	/**
	 * 转换器
	 * @param {String} s 原始字符串
	 */
	const parse = s => {
		let [$1, $2] = read(s);
		let r;
		if($2 && $2.status === 'nest' && $1.status === 'plain'){ // JSONP
			r = $2.sub[0];
		} else {	// JSON
			r = $1;
		}
		return value(r);
	};
	return { parse };
});