// ===== Firebase =====
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

// Config Firebase
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

// ===== MAPA =====
const map = L.map("map").setView([0, 0], 15);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap"
}).addTo(map);

// ===== USUÁRIO =====
const iconeUsuario = L.divIcon({
  className: "",
  html: `
    <div style="
      width:18px;
      height:18px;
      background:#007bff;
      border:3px solid white;
      border-radius:50%;
      box-shadow:0 0 6px rgba(0,123,255,.8);
    "></div>
  `,
  iconSize: [18,18],
  iconAnchor: [9,9]
});

const marcadorUsuario = L.marker([0,0], { icon: iconeUsuario }).addTo(map);

let posicaoAtual = null;
let primeira = true;

// GPS
if (navigator.geolocation) {
  navigator.geolocation.watchPosition(
    pos => {
      posicaoAtual = {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude
      };

      marcadorUsuario.setLatLng([posicaoAtual.lat, posicaoAtual.lng]);

      if (primeira) {
        map.setView([posicaoAtual.lat, posicaoAtual.lng], 18);
        primeira = false;
      }
    },
    err => console.error("Erro GPS:", err.message),
    { enableHighAccuracy: true }
  );
}

// ===== ENDEREÇO =====
async function obterEndereco(lat, lng) {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
  );
  const data = await res.json();
  return data.display_name || "Endereço não encontrado";
}

function popupConteudo(lat, lng, endereco) {
  const waze = `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`;
  return `
    <strong>${endereco}</strong><br><br>
    <a href="${waze}" target="_blank">🧭 Abrir no Waze</a>
  `;
}

// ===== FIREBASE =====
async function salvarMarcador(lat, lng) {
  await addDoc(collection(db, colecao), {
    latitude: lat,
    longitude: lng,
    criadoEm: serverTimestamp()
  });
}

async function carregarMarcadores() {
  const snapshot = await getDocs(collection(db, colecao));
  snapshot.forEach(async doc => {
    const d = doc.data();
    const endereco = await obterEndereco(d.latitude, d.longitude);

    L.marker([d.latitude, d.longitude])
      .addTo(map)
      .bindPopup(popupConteudo(d.latitude, d.longitude, endereco));
  });
}

carregarMarcadores();

// ===== CLIQUE NO MAPA COM CONFIRMAÇÃO =====
map.on("click", e => {
  const { lat, lng } = e.latlng;

  const popup = L.popup()
    .setLatLng([lat, lng])
    .setContent(`
      <strong>Adicionar marcador aqui?</strong><br><br>
      <button id="confirmar">✅ Sim</button>
      <button id="cancelar">❌ Não</button>
    `)
    .openOn(map);

  setTimeout(() => {
    document.getElementById("confirmar").onclick = async () => {
      const endereco = await obterEndereco(lat, lng);

      L.marker([lat, lng])
        .addTo(map)
        .bindPopup(popupConteudo(lat, lng, endereco))
        .openPopup();

      await salvarMarcador(lat, lng);
      map.closePopup();
    };

    document.getElementById("cancelar").onclick = () => {
      map.closePopup();
    };
  }, 100);
});

// ===== BUSCA =====
document.getElementById("btnBuscar").onclick = async () => {
  const texto = document.getElementById("inputBusca").value;
  if (!texto) return;

  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${texto}&limit=1`
  );
  const data = await res.json();

  if (data.length) {
    map.setView([data[0].lat, data[0].lon], 18);
  }
};

// ===== CENTRALIZAR =====
document.getElementById("btnCentralizar").onclick = () => {
  if (posicaoAtual) {
    map.setView([posicaoAtual.lat, posicaoAtual.lng], 18);
  }
};
