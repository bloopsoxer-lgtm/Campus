const latitudeInput = document.getElementById('latitudeInput');
const longitudeInput = document.getElementById('longitudeInput');
const ipInput = document.getElementById('ipInput');
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');
const messagesContainer = document.getElementById('content');

let chatCode = new URLSearchParams(location.search).get('code');
if (!chatCode){ chatCode='CAMPUS'; location.replace(`${location.pathname}?code=${chatCode}`); }

let userName = localStorage.getItem('chatUserName');
if (!userName){ userName = prompt('Digite seu nome') || 'Guest'; localStorage.setItem('chatUserName',userName); }

const notificationsEnabled = localStorage.getItem('notifications')==='true';
const wsProto = location.protocol==='https:'?'wss':'ws';
const socket = new WebSocket(`${wsProto}://127.0.0.1:1933/ws`);
const pendingIds = new Set();

const map = L.map('map').setView([-23.55052,-46.633308],13);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{ attribution:'&copy; OpenStreetMap contributors' }).addTo(map);
let marker = L.marker([-23.55052,-46.633308]).addTo(map);

[latitudeInput,longitudeInput].forEach(input=>{
    input.addEventListener('keydown',e=>{
        if(e.key==='Enter'){
            const lat=parseFloat(latitudeInput.value.replace(',','.').trim());
            const lng=parseFloat(longitudeInput.value.replace(',','.').trim());
            if(!isNaN(lat)&&!isNaN(lng)&&lat>=-90&&lat<=90&&lng>=-180&&lng<=180){
                map.setView([lat,lng],13);
                marker.setLatLng([lat,lng]);
            }
        }
    });
    input.addEventListener('input',()=>{ input.value=input.value.replace(/[^0-9\.\-]/g,''); });
});

ipInput.addEventListener('keydown',e=>{
    if(e.key==='Enter'){
        const ip=ipInput.value.trim();
        fetch(`https://ipinfo.io/${ip}/json`).then(r=>r.json()).then(d=>{
            if(d.loc){
                const [lat,lng]=d.loc.split(',');
                latitudeInput.value=parseFloat(lat).toFixed(5);
                longitudeInput.value=parseFloat(lng).toFixed(5);
                map.setView([lat,lng],13);
                marker.setLatLng([lat,lng]);
            }
        }).catch(()=>{});
    }
});

map.on('click',e=>{
    const lat=e.latlng.lat.toFixed(5);
    const lng=e.latlng.lng.toFixed(5);
    latitudeInput.value=lat;
    longitudeInput.value=lng;
    marker.setLatLng([lat,lng]);
    if(navigator.clipboard) navigator.clipboard.writeText(`${lat},${lng}`).catch(()=>{});
});

function enviarNotificacao(titulo, msg){
    if(!notificationsEnabled) return;
    if(document.hidden && "Notification" in window){
        const opts = {
            body: msg,
            icon: '../chat.png',
        };
        if(Notification.permission === 'granted'){
            new Notification(titulo, opts);
        } else if(Notification.permission !== 'denied'){
            Notification.requestPermission().then(p => {
                if(p === 'granted') new Notification(titulo, opts);
            });
        }
    }
}


function autoCorrect(text){ text=String(text||'').trim(); if(!text) return ''; text=text[0].toUpperCase()+text.slice(1); if(!/[.!?]$/.test(text)) text+='.'; return text; }
function genId(){ return Date.now().toString(36)+Math.random().toString(36).slice(2,6); }
function escapeHtml(str){ return str.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;"); }

function adicionarMensagem(name, message, sent = false) {
    // 1. Container principal da mensagem
    const container = document.createElement('div');
    container.classList.add('messageContainer', sent ? 'sent' : 'received');
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.alignItems = sent ? 'flex-end' : 'flex-start'; // tudo (nome+bolha) à direita ou esquerda

    // 2. Nome
    const nomeDiv = document.createElement('div');
    nomeDiv.classList.add('messageName');
    nomeDiv.textContent = name || 'Guest';
    nomeDiv.style.textAlign = sent ? 'right' : 'left'; // só pra garantir

    // 3. Mensagem segura
    let safeMessage = escapeHtml(message);
    const ipRegex = /\b(?:\d{1,3}\.){3}\d{1,3}\b/g;
    const latLngRegex = /-?\d{1,2}\.\d+,\s*-?\d{1,3}\.\d+/g;

    safeMessage = safeMessage.replace(ipRegex, ip => `<span class="clickableIP"><u>${ip}</u></span>`);
    safeMessage = safeMessage.replace(latLngRegex, ll => `<span class="clickableLatLng"><u>${ll}</u></span>`);

    // 4. Bolha
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('message', sent ? 'sent' : 'received');
    msgDiv.innerHTML = safeMessage;

    // 6. Eventos de clique em IPs
    msgDiv.querySelectorAll('.clickableIP').forEach(el => {
        el.addEventListener('click', () => {
            ipInput.value = el.textContent;
            ipInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
        });
    });

    // 7. Eventos de clique em LatLng
    msgDiv.querySelectorAll('.clickableLatLng').forEach(el => {
        el.addEventListener('click', () => {
            const [lat, lng] = el.textContent.split(',');
            latitudeInput.value = lat.trim();
            longitudeInput.value = lng.trim();
            latitudeInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
        });
    });

    // 8. Montagem final
    container.appendChild(nomeDiv);
    container.appendChild(msgDiv);
    messagesContainer.appendChild(container);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}



function enviarMensagem(){
    const raw=messageInput.value;
    const msg=autoCorrect(raw);
    if(!msg) return;
    const id=genId();
    pendingIds.add(id);
    const payload={type:'message', chatCode:String(chatCode).toUpperCase(), id, name:String(userName).slice(0,64), message:String(msg).slice(0,1000)};
    if(socket.readyState===WebSocket.OPEN){
        socket.send(JSON.stringify(payload));
        adicionarMensagem(payload.name, payload.message, true);
    }else console.log('WS not open');
    messageInput.value='';
    setTimeout(()=>pendingIds.delete(id),60000);
}

sendButton.addEventListener('click',enviarMensagem);
messageInput.addEventListener('keydown',e=>{ if(e.key==='Enter') enviarMensagem(); });

socket.addEventListener('open',()=>{
    socket.send(JSON.stringify({type:'join',chatCode:String(chatCode).toUpperCase()}));
    fetch(`/chats/${String(chatCode).toUpperCase()}.json`)
    .then(r => r.ok ? r.json() : [])
    .then(arr => {
        arr.forEach(m => {
            const isSent = m.name === userName;
            adicionarMensagem(m.name || 'Guest', m.message, isSent);
        });
    })
    .catch(() => {});
});

socket.addEventListener('message', e => {
    let data;
    try { data = JSON.parse(e.data); } catch { return; }
    if(data.type !== 'message') return;
    if(String(data.chatCode).toUpperCase() !== String(chatCode).toUpperCase()) return;

    const isSent = data.name === userName;
    if(pendingIds.has(data.id)){ pendingIds.delete(data.id); return; }

    adicionarMensagem(data.name || 'Guest', data.message, isSent);

    if(!isSent) enviarNotificacao(data.name || 'Guest', data.message);
});
