import http from 'node:http';
import {stat} from 'node:fs/promises';
import {createReadStream} from 'node:fs';
import {resolve,extname,sep} from 'node:path';
const [directory,port]=process.argv.slice(2);const root=resolve(directory);
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.ico':'image/x-icon','.woff2':'font/woff2','.json':'application/json'};
http.createServer(async(req,res)=>{
 try {
  const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  if(pathname.split('/').some(part=>part.startsWith('.')&&part!=='')){res.writeHead(403);res.end();return;}
  let path=resolve(root,'.'+pathname);if(path!==root&&!path.startsWith(root+sep)){res.writeHead(403);res.end();return;}
  let info=await stat(path);if(info.isDirectory()){path=resolve(path,'index.html');info=await stat(path);}
  res.writeHead(200,{'Content-Type':types[extname(path)]||'application/octet-stream','Content-Length':info.size,'Cache-Control':'no-store'});
  if(req.method==='HEAD'){res.end();return;}
  const stream=createReadStream(path);stream.on('error',()=>res.destroy());stream.pipe(res);
 }catch{res.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'});res.end('Not found');}
}).listen({port:Number(port),host:'127.0.0.1',backlog:128},()=>console.log(`Preview ready: http://localhost:${port} — ${root}`));
