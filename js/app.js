import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

/* Firebase */
const firebaseConfig = {
  apiKey: "AIzaSyByYEISjGfRIh7Xxx5j7rtJ7Fm_nmMTgRk",
  authDomain: "vpm2026-8167b.firebaseapp.com",
  projectId: "vpm2026-8167b",
  storageBucket: "vpm2026-8167b.appspot.com",
  messagingSenderId: "129557498750",
  appId: "1:129557498750:web:c2a510c04946583a17412f"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/* Mensagens */
function mostrarMensagem(msg){
  const el = document.getElementById("mensagens");
  el.innerText = msg;
  setTimeout(()=>el.innerText="",4000);
}

/* MAPA */
const map = L.map("map").setView([-23.5505, -46.6333], 18);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap"
}).addTo(map);

/* 🔵 USUÁRIO – circleMarker (NUNCA FALHA) */
const marcadorUsuario = L.circleMarker([-23.5505,-46.6333], {
  radius: 8,
  color: "#fff",
  weight: 3,
  fillColor: "#007bff",
  fillOpacity: 1
}).addTo(map);

/* Atualiza posição (sem travar mapa) */
if (navigator.geolocation) {
  navigator.geolocation.watchPosition(pos=>{
    marcadorUsuario.setLatLng([
      pos.coords.latitude,
      pos.coords.longitude
    ]);
  });
}

/* Botão centralizar */
document.getElementById("btnLocalizacao").onclick = ()=>{
  navigator.geolocation.getCurrentPosition(pos=>{
    map.setView(
      [pos.coords.latitude, pos.coords.longitude],
      19
    );
  });
};

/* 🔍 Pesquisa endereço */
async function pesquisarEndereco(){
  const q = document.getElementById("search").value;
  if(!q) return mostrarMensagem("Digite um endereço");

  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}`
  );
  const data = await res.json();

  if(!data.length) return mostrarMensagem("Endereço não encontrado");

  map.setView([data[0].lat, data[0].lon], 19);
}

document.getElementById("btnPesquisar").onclick = pesquisarEndereco;

/* 🅿️ ÍCONE VAGA – SVG INLINE (IMPOSSÍVEL NÃO CARREGAR) */
const iconeVaga = L.icon({
  iconUrl: `data:image/svg+xml;utf8,
  <svg xmlns='http://www.w3.org/2000/svg' width='48' height='48'>
    <rect width='48' height='48' rx='10' ry='10' fill='%23007bff'/>
    <text x='50%' y='68%' text-anchor='middle'
      font-size='28' fill='white' font-family='Arial'>P</text>
  </svg>`,
  iconSize: [40,40],
  iconAnchor: [20,40]
});

/* Salvar vaga */
async function salvarVaga(){
  const numero = document.getElementById("numero").value;
  if(!numero) return mostrarMensagem("Digite o número");

  navigator.geolocation.getCurrentPosition(async pos=>{
    await addDoc(collection(db,"teste"),{
      numero,
      latitude: pos.coords.latitude,
      longitude: pos.coords.longitude,
      status: "validado",
      data: new Date()
    });
    mostrarMensagem("Vaga salva!");
    document.getElementById("numero").value="";
  });
}

document.getElementById("btnSalvar").onclick = salvarVaga;

/* Vagas */
const markers = {};
onSnapshot(collection(db,"teste"), snap=>{
  snap.forEach(doc=>{
    const d = doc.data();
    if(!markers[doc.id]){
      markers[doc.id] = L.marker(
        [d.latitude, d.longitude],
        { icon: iconeVaga }
      ).addTo(map)
       .bindPopup(`Vaga ${d.numero}`);
    }
  });
});
