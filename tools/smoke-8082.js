const http = require('http');
const base = 'http://localhost:8082';
const paths = ['/', '/admin', '/api/health', '/widget.html'];
paths.forEach(p => {
  http.get(base + p, res => {
    let b = '';
    res.setEncoding('utf8');
    res.on('data', c => b += c);
    res.on('end', () => console.log(p, res.statusCode, 'len', b.length));
  }).on('error', e => console.log(p, 'ERR', e.message));
});
