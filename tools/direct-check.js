const http = require('http');
const checks = [
  { name: 'backend /api/health', url: 'http://localhost:3001/api/health' },
  { name: 'admin /', url: 'http://localhost:3000/' },
  { name: 'frontend /', url: 'http://localhost:5174/' },
];

function runCheck(c){
  return new Promise((resolve)=>{
    const req = http.get(c.url, res=>{
      let b=''; res.setEncoding('utf8'); res.on('data',d=>b+=d); res.on('end',()=>resolve({name:c.name, ok:true, status:res.statusCode, len:b.length}));
    });
    req.on('error',e=>resolve({name:c.name, ok:false, err:e.message}));
    req.setTimeout(5000,()=>{ req.abort(); resolve({name:c.name, ok:false, err:'timeout'}); });
  });
}

(async()=>{
  for(const c of checks){
    const r = await runCheck(c);
    if(r.ok) console.log(`${r.name} -> ${r.status} len=${r.len}`);
    else console.log(`${r.name} -> ERROR ${r.err}`);
  }
})();
