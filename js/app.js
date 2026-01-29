// ===== Import Firebase =====
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, serverTimestamp } 
from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

// ===== Configuração Firebase =====
const firebaseConfig = {
  apiKey: "AIzaSyByYEISjGfRIh7Xxx5j7rtJ7Fm_nmMTgRk",
  authDomain: "vpm2026-8167b.firebaseapp.com",
  projectId: "vpm2026-8167b",
  storageBucket: "vpm2026-8167b.firebasestorage.app",
  messagingSenderId: "129557498750",
  appId: "1:129557498750:web:c2a510c04946583a17412f"
};

// ===== Firebase Init =====
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const colecaoMarcadores = "marcadores";

// ===== Mapa =====
const map = L.map("map").setView([0, 0], 15);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap"
}).addTo(map);

// ===== Ícone usuário =====
const iconeUsuario = L.divIcon({
  className: "",
  html: `
    <div style="
      width:16px;
      height:16px;
      background:#007bff;
      border:3px solid white;
      border-radius:50%;
      box-shadow:0 0 6px rgba(0,123,255,.8);
    "></div>
  `,
  iconSize: [16,16],
  iconAnchor: [8,8]
});

const marcadorUsuario = L.marker([0,0], { icon: iconeUsuario }).addTo(map);

let posicaoAtual = null;
let primeiraLocalizacao = true;

// ===== Geolocalização =====
if (navigator.geolocation) {
  navigator.geolocation.watchPosition(
    pos => {
      posicaoAtual = {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude
      };

      marcadorUsuario.setLatLng([posicaoAtual.lat, posicaoAtual.lng]);

      if (primeiraLocalizacao) {
        map.setView([posicaoAtual.lat, posicaoAtual.lng], 18);
        primeiraLocalizacao = false;
      }
    },
    err => console.error("Erro GPS:", err.message),
    { enableHighAccuracy: true }
  );
}

// ===== Firebase =====
async function salvarMarcador(lat, lng) {
  await addDoc(collection(db, colecaoMarcadores), {
    latitude: lat,
    longitude: lng,
    criadoEm: serverTimestamp()
  });
}

async function carregarMarcadores() {
  const querySnapshot = await getDocs(collection(db, colecaoMarcadores));
  querySnapshot.forEach(doc => {
    const d = doc.data();
    L.marker([d.latitude, d.longitude])
      .addTo(map)
      .bindPopup("Vaga registrada");
  });
}

// ===== Clique no mapa COM confirmação =====
map.on("click", e => {
  const { lat, lng } = e.latlng;

  const popupConfirmacao = L.popup()
    .setLatLng([lat, lng])
    .setContent(`
      <strong>Adicionar marcador aqui?</strong><br><br>
      <button id="confirmarMarcador">✅ Sim</button>
      <button id="cancelarMarcador">❌ Não</button>
    `)
    .openOn(map);

  setTimeout(() => {
    document.getElementById("confirmarMarcador").onclick = async () => {
      L.marker([lat, lng])
        .addTo(map)
        .bindPopup("Vaga registrada")
        .openPopup();

      await salvarMarcador(lat, lng);
      map.closePopup();
    };

    document.getElementById("cancelarMarcador").onclick = () => {
      map.closePopup();
    };
  }, 100);
});

// ===== Botão centralizar =====
document.getElementById("btnCentralizar").onclick = () => {
  if (posicaoAtual) {
    map.setView([posicaoAtual.lat, posicaoAtual.lng], 18);
  }
};

// ===== Carrega marcadores =====
carregarMarcadores();
