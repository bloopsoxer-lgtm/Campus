const http = require('http');
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');

const PORT = 1933;
const CHAT_DIR = path.join(__dirname,'chats');
if(!fs.existsSync(CHAT_DIR)) fs.mkdirSync(CHAT_DIR);

const clients = new Map();
const rateLimit = {};
const RATE_LIMIT_TIME = 200;

const server = http.createServer((req,res)=>{
    const url = req.url.split('?')[0];
    if(url.startsWith('/chats/')){
        const file = path.join(__dirname,url);
        if(!fs.existsSync(file)) { res.writeHead(200,{'Content-Type':'application/json'}); res.end('[]'); return; }
        res.writeHead(200,{'Content-Type':'application/json'});
        fs.createReadStream(file).pipe(res);
        return;
    }
    let filePath = path.join(__dirname,'home',url==='/'?'chat.html':url);
    if(fs.existsSync(filePath) && fs.statSync(filePath).isFile()){
        const ext = path.extname(filePath);
        let type='text/plain';
        if(ext==='.html') type='text/html';
        else if(ext==='.js') type='text/javascript';
        else if(ext==='.css') type='text/css';
        else if(ext==='.png') type='image/png';
        res.writeHead(200,{'Content-Type':type});
        fs.createReadStream(filePath).pipe(res);
    } else { res.writeHead(404); res.end('404'); }
});

const wss = new WebSocket.Server({ server, path:'/ws' });

wss.on('connection', ws=>{
    ws.on('message', msg=>{
        let data;
        try{ data = JSON.parse(msg); }catch{return;}
        const ip = ws._socket.remoteAddress;
        if(rateLimit[ip] && Date.now()-rateLimit[ip]<RATE_LIMIT_TIME) return;
        rateLimit[ip] = Date.now();
        if(!data.type || !data.chatCode) return;
        const chatCode = String(data.chatCode).toUpperCase().slice(0,6);
        const chatFile = path.join(CHAT_DIR,`${chatCode}.json`);
        if(data.type==='join'){ clients.set(ws, chatCode); return; }
        if(data.type!=='message') return;
        if(!data.id || !data.name || !data.message) return;
        const entry = {
            type:'message',
            chatCode,
            id:String(data.id),
            name:String(data.name).slice(0,64),
            message:String(data.message).slice(0,1000),
            time:Date.now()
        };
        let messages = [];
        if(fs.existsSync(chatFile)){
            try{ messages = JSON.parse(fs.readFileSync(chatFile,'utf8')); }catch{}
        }
        messages.push(entry);
        try{ fs.writeFileSync(chatFile,JSON.stringify(messages,null,2)); }catch(e){ console.error(e); }
        for(let [client, code] of clients.entries()){
            if(client.readyState===WebSocket.OPEN && code===chatCode){
                client.send(JSON.stringify(entry));
            }
        }
    });
    ws.on('close', ()=>{ clients.delete(ws); });
});

server.listen(PORT,'0.0.0.0',()=>console.log(`Servidor HTTP+WS rodando em http://127.0.0.1:${PORT}`));
