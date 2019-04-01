const ESC = '\\';
const QUOTES = [`"`, `'`];
const NESTS = { '{': '}', '[': ']', '(': ')' };
const TOKEN = [':', ',']

const status = (ch) => {
    if(ch in NESTS){
        return 'nest';
    } else if(!!~QUOTES.indexOf(ch)){
        return 'quote';
    } else if(!!~TOKEN.indexOf(ch)){
        return ch === ',' ? 'comma' : 'colon';
    } else {
        return 'plain';
    }
};

const trim = s => s.replace(/^\s+|\s+$/g, '');

const seg = (s, index, size, status, ext = {}) => {
    let text = s.substr(index, size);
    switch(status){
        case 'quote':
            text = text.substr(1, text.length - 2);
            break;
        case 'plain':
            text = trim(text)
            break;
    }
    return { status, start: index, size, text, ...ext };
}

const readers = {
    quote: (s, _i, sub) => {
        let i = _i, len = s.length, q = s[i++], c;
        for(; i < len; i++){
            c = s[i];
            if(c === ESC){
                i += 1;
            } else if(c === q){
                sub.push(seg(s, _i, i - _i + 1, 'quote', { quote: q }))
                return i;
            }
        }
        return -1;
    },
    nest: (s, _i, _sub) => {
        let i = _i, len = s.length, left = s[i++], right = NESTS[left], c, st;
        let j = i;
        let sub = [];
        for(; i < len; i++){
            c = s[i];
            st = status(c);
            if(st in readers){
                if(i > j){
                    sub.push(seg(s, j, i - j, 'plain'))
                }
                i = readers[st](s, i, sub);
                if(i < 0){
                    return -1;
                }
                j = i + 1;
            } else if(c === right){
                if(i > j){
                    sub.push(seg(s, j, i - j, 'plain'))
                }
                sub = sub.filter(n => n.status !== 'plain' || !/^\s*$/.test(n.text));
                _sub.push(seg(s, _i, i - _i + 1, 'nest', { left, sub }));
                return i;
            }
        }
        return -1;
    },
    comma: (s, i, sub) => {
        sub.push(seg(s, i, 1, 'comma'));
        return i;
    },
    colon: (s, i, sub) => {
        sub.push(seg(s, i, 1, 'colon'));
        return i;
    }
};

const read = (s, i = 0, r = []) => {
    let j = i, len = s.length;
    for(; i < len; i++){
        let c = s[i];
        let st = status(c);
        if(st in readers){
            if(j < i){
                r.push(seg(s, j, i - j, 'plain'))
            }
            i = readers[st](s, i, r);
            if(i < 0){
                return r;
            }
            j = i + 1;
        }
    }
    if(j < i){
        r.push(seg(s, j, i - j, 'plain'))
    }
    return r;
};

const parse_key = n => n.text;

const nest_parser = {
    '[': n => {
        let r = [];
        n.sub.filter(n => n.status !== 'comma').forEach(n => r.push(parse_value(n)))
        return r;
    },
    '{': n => {
        let r = {};
        let i = 0, sub = n.sub.filter(n => n.status !== 'comma' && n.status !== 'colon'), len = Math.floor(sub.length / 2) * 2;
        for(; i < len; i += 2){
            let key = parse_key(sub[i + 0]);
            let val = parse_value(sub[i + 1]);
            r[key] = val;
        }
        return r;
    }
};

const parse_value = n => {
    switch(n.status){
        case 'plain':
            return JSON.parse(n.text);
        case  'nest':
            return nest_parser[n.left](n);
        default:
            return n.text;
    }
};

const parse = s => {
    let [$1, $2] = read(s);
    let r;
    // JSONP
    if($2 && $2.status === 'nest' && $1.status === 'plain'){
        r = $2.sub[0];
    } else {
        r = $1;
    }
    return parse_value(r);
};

module.exports = { parse };
