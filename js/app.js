import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import {
  getFirestore, collection, addDoc, onSnapshot
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

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
  const m = document.getElementById("mensagens");
  m.innerText = msg;
  setTimeout(()=>m.innerText="",4000);
}

/* MAPA */
const map = L.map("map").setView([-23.5505, -46.6333], 17);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap"
}).addTo(map);

/* 🔵 ÍCONE USUÁRIO (100% VISÍVEL) */
const iconeUsuario = L.icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/149/149071.png",
  iconSize: [28,28],
  iconAnchor: [14,14]
});

/* 🅿️ ÍCONE VAGA */
const iconeVaga = L.icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684831.png",
  iconSize: [40,40],
  iconAnchor: [20,40]
});

/* Marcador usuário */
const marcadorUsuario = L.marker([-23.5505,-46.6333], {
  icon: iconeUsuario
}).addTo(map);

/* Atualiza posição SEM travar */
if(navigator.geolocation){
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

/* Pesquisa endereço */
async function pesquisarEndereco(){
  const q = document.getElementById("search").value;
  if(!q) return mostrarMensagem("Digite um endereço");

  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}`
  );
  const data = await res.json();

  if(!data.length) return mostrarMensagem("Não encontrado");

  map.setView([data[0].lat, data[0].lon], 19);
}

document.getElementById("btnPesquisar").onclick = pesquisarEndereco;

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
