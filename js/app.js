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
const colecao = "marcadores";

// ===== Mapa =====
const map = L.map("map").setView([0, 0], 15);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap"
}).addTo(map);

// ===== Ícone usuário =====
const iconeUsuario = L.divIcon({
  className: "",
  html: `<div style="width:16px;height:16px;background:#007bff;border:3px solid white;border-radius:50%;"></div>`,
  iconSize: [16,16],
  iconAnchor: [8,8]
});

const marcadorUsuario = L.marker([0,0], { icon: iconeUsuario }).addTo(map);

let posicaoAtual = null;
let primeira = true;

// ===== GPS =====
navigator.geolocation.watchPosition(pos => {
  posicaoAtual = {
    lat: pos.coords.latitude,
    lng: pos.coords.longitude
  };

  marcadorUsuario.setLatLng([posicaoAtual.lat, posicaoAtual.lng]);

  if (primeira) {
    map.setView([posicaoAtual.lat, posicaoAtual.lng], 18);
    primeira = false;
  }
}, err => {
  console.error(err);
}, { enableHighAccuracy: true });

// ===== Centralizar =====
document.getElementById("btnCentralizar").onclick = () => {
  if (posicaoAtual) {
    map.setView([posicaoAtual.lat, posicaoAtual.lng], 18);
  }
};

// ===== Salvar marcador =====
async function salvarMarcador(lat, lng, endereco) {
  await addDoc(collection(db, colecao), {
    latitude: lat,
    longitude: lng,
    endereco,
    criadoEm: serverTimestamp()
  });
}

// ===== Endereço + Waze =====
async function obterEndereco(lat, lng) {
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`;
  const res = await fetch(url);
  const data = await res.json();
  return data.display_name || "Endereço não encontrado";
}

function popupConteudo(endereco, lat, lng) {
  return `
    <b>${endereco}</b><br><br>
    <a href="https://waze.com/ul?ll=${lat},${lng}&navigate=yes" target="_blank">
      Abrir no Waze
    </a>
  `;
}

// ===== Clique no mapa (confirmar) =====
map.on("click", async (e) => {
  if (!confirm("Deseja adicionar um marcador aqui?")) return;

  const { lat, lng } = e.latlng;
  const endereco = await obterEndereco(lat, lng);

  L.marker([lat, lng])
    .addTo(map)
    .bindPopup(popupConteudo(endereco, lat, lng));

  salvarMarcador(lat, lng, endereco);
});

// ===== Carregar marcadores =====
async function carregarMarcadores() {
  const snap = await getDocs(collection(db, colecao));
  snap.forEach(doc => {
    const d = doc.data();
    L.marker([d.latitude, d.longitude])
      .addTo(map)
      .bindPopup(popupConteudo(d.endereco, d.latitude, d.longitude));
  });
}

carregarMarcadores();

// ===== Busca (2 sugestões) =====
const searchInput = document.getElementById("searchInput");
const btnBuscar = document.getElementById("btnBuscar");
const suggestions = document.getElementById("suggestions");

btnBuscar.onclick = async () => {
  const q = searchInput.value.trim();
  if (!q) return;

  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=2&q=${encodeURIComponent(q)}`;
  const res = await fetch(url);
  const data = await res.json();

  suggestions.innerHTML = "";

  data.forEach(item => {
    const div = document.createElement("div");
    div.className = "suggestion";
    div.textContent = item.display_name;

    div.onclick = () => {
      map.setView([item.lat, item.lon], 18);
      suggestions.innerHTML = "";
    };

    suggestions.appendChild(div);
  });
};
