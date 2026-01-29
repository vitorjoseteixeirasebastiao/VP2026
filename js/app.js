// ===== Firebase =====
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyByYEISjGfRIh7Xxx5j7rtJ7Fm_nmMTgRk",
  authDomain: "vpm2026-8167b.firebaseapp.com",
  projectId: "vpm2026-8167b",
  storageBucket: "vpm2026-8167b.firebasestorage.app",
  messagingSenderId: "129557498750",
  appId: "1:129557498750:web:c2a510c04946583a17412f"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const colecaoMarcadores = "marcadores";

// ===== Funções Firebase =====
async function salvarMarcador(lat, lng, titulo="Marcador") {
  try {
    await addDoc(collection(db, colecaoMarcadores), {
      titulo,
      latitude: lat,
      longitude: lng,
      criadoEm: serverTimestamp()
    });
  } catch (err) {
    console.error(err);
  }
}

async function carregarMarcadores() {
  try {
    const snapshot = await getDocs(collection(db, colecaoMarcadores));
    snapshot.forEach(doc => {
      const data = doc.data();
      L.marker([data.latitude, data.longitude])
        .addTo(map)
        .bindPopup(`<b>${data.titulo}</b><br><a href="https://waze.com/ul?ll=${data.latitude},${data.longitude}&navigate=yes" target="_blank">Abrir no Waze</a>`);
    });
  } catch (err) {
    console.error(err);
  }
}

// ===== Inicializa mapa =====
const map = L.map("map").setView([0,0], 15);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap"
}).addTo(map);

// ===== Marcador azul do usuário =====
const iconeUsuario = L.divIcon({
  className:"",
  html:'<div style="width:16px;height:16px;background:#007bff;border:3px solid white;border-radius:50%;box-shadow:0 0 6px rgba(0,123,255,.8);"></div>',
  iconSize:[16,16],
  iconAnchor:[8,8]
});
const marcadorUsuario = L.marker([0,0], {icon:iconeUsuario}).addTo(map);

let posicaoAtual = null;
let primeiraLocalizacao = true;

// ===== Geolocalização =====
if (navigator.geolocation) {
  navigator.geolocation.watchPosition(pos => {
    posicaoAtual = {lat: pos.coords.latitude, lng: pos.coords.longitude};
    marcadorUsuario.setLatLng([posicaoAtual.lat,posicaoAtual.lng]);
    if(primeiraLocalizacao) {
      map.setView([posicaoAtual.lat,posicaoAtual.lng],18);
      primeiraLocalizacao = false;
    }
  }, err => console.error(err), {enableHighAccuracy:true});
}

// ===== Botões existentes =====
document.getElementById("btnCentralizar").onclick = ()=>{
  if(posicaoAtual) map.setView([posicaoAtual.lat,posicaoAtual.lng],18);
};

document.getElementById("btnAdicionarMarcador").onclick = ()=>{
  if(posicaoAtual) {
    const {lat,lng} = posicaoAtual;
    L.marker([lat,lng])
      .addTo(map)
      .bindPopup(`<b>Marcador do Usuário</b><br><a href="https://waze.com/ul?ll=${lat},${lng}&navigate=yes" target="_blank">Abrir no Waze</a>`)
      .openPopup();
    salvarMarcador(lat,lng,"Marcador do Usuário");
  } else {
    alert("Localização não disponível.");
  }
};

// ===== Pesquisa de endereço com botão =====
document.getElementById("btnBuscar").onclick = async () => {
  const inputEndereco = document.getElementById("inputEndereco");
  const query = inputEndereco.value.trim();
  if (!query) return;

  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`);
    const data = await res.json();
    if (data.length === 0) {
      alert("Endereço não encontrado.");
      return;
    }

    const local = data[0];
    const lat = parseFloat(local.lat);
    const lng = parseFloat(local.lon);

    map.setView([lat,lng],18); // centraliza no endereço
    inputEndereco.value = "";

  } catch(err) {
    console.error(err);
    alert("Erro ao buscar endereço.");
  }
};

// ===== Carrega marcadores salvos =====
carregarMarcadores();
