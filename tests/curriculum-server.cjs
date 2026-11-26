// Local static server with the two explicit Vercel rewrites, also usable manually.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname,'..');
const config = JSON.parse(fs.readFileSync(path.join(root,'vercel.json')));
const rewrites = config.rewrites;
function createServer() {
  return http.createServer((req,res) => {
    let name;
    const prefix=req.url.startsWith('/landing/')?'/landing':'';
    try { name=decodeURIComponent(new URL(req.url,'http://localhost').pathname).replace(/^\/landing(?=\/)/,''); }
    catch {res.writeHead(400).end();return;}
    const redirect=config.redirects?.find(r=>r.source===name);
    if(redirect){res.writeHead(redirect.permanent?308:307,{Location:prefix+redirect.destination}).end();return;}
    name=rewrites.find(r=>r.source===name)?.destination||name;
    let file=path.resolve(root,'.'+name);
    if(file!==root&&!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}
    if(fs.existsSync(file)&&fs.statSync(file).isDirectory())file=path.join(file,'index.html');
    if(!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404).end();return;}
    const type={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.xml':'application/xml','.txt':'text/plain; charset=utf-8'}[path.extname(file)]||'application/octet-stream';
    res.setHeader('Content-Type',type);fs.createReadStream(file).pipe(res);
  });
}
module.exports={createServer};
if(require.main===module)createServer().listen(4173,'127.0.0.1',()=>console.log('http://127.0.0.1:4173'));
