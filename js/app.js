import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import {
  getFirestore, collection, addDoc, getDocs,
  doc, updateDoc, onSnapshot
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
function mostrarMensagem(texto) {
  const div = document.getElementById("mensagens");
  div.innerText = texto;
  setTimeout(() => div.innerText = "", 4000);
}

/* Distância */
function calcularDistancia(lat1, lon1, lat2, lon2) {
  const R = 6371e3;
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(Δφ / 2) ** 2 +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/* Mapa */
const map = L.map("map").setView([-23.5505, -46.6333], 16);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap"
}).addTo(map);

/* Ícones */
const iconeMoto = L.icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
  iconSize: [35, 35],
  iconAnchor: [17, 35]
});

const iconeUsuario = L.icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/64/64113.png",
  iconSize: [30, 30],
  iconAnchor: [15, 30]
});

/* Usuário */
const marcadorUsuario = L.marker([0, 0], { icon: iconeUsuario }).addTo(map);

navigator.geolocation.watchPosition(pos => {
  marcadorUsuario.setLatLng([
    pos.coords.latitude,
    pos.coords.longitude
  ]);
});

/* 📍 Botão centralizar */
document.getElementById("btnLocalizacao").onclick = () => {
  navigator.geolocation.getCurrentPosition(pos => {
    map.setView(
      [pos.coords.latitude, pos.coords.longitude],
      18
    );
  });
};

/* 🔍 Pesquisa endereço */
document.getElementById("search").addEventListener("keydown", async e => {
  if (e.key === "Enter") {
    const q = e.target.value;
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${q}`
    );
    const data = await res.json();
    if (data[0]) {
      map.setView([data[0].lat, data[0].lon], 18);
    }
  }
});

/* Salvar vaga */
async function salvarVaga() {
  const numero = document.getElementById("numero").value;
  if (!numero) return mostrarMensagem("Digite o número");

  navigator.geolocation.getCurrentPosition(async pos => {
    await addDoc(collection(db, "teste"), {
      numero,
      latitude: pos.coords.latitude,
      longitude: pos.coords.longitude,
      status: "pendente",
      confirmations: 1,
      data: new Date()
    });
    mostrarMensagem("Vaga criada");
    document.getElementById("numero").value = "";
  });
}

document.getElementById("btnSalvar").onclick = salvarVaga;

/* Vagas validadas */
const markersVagas = {};
const vagasRef = collection(db, "teste");

onSnapshot(vagasRef, snap => {
  snap.forEach(docSnap => {
    const d = docSnap.data();
    if (d.status === "validado" && !markersVagas[docSnap.id]) {
      const waze = `https://waze.com/ul?ll=${d.latitude},${d.longitude}&navigate=yes`;
      markersVagas[docSnap.id] = L.marker(
        [d.latitude, d.longitude],
        { icon: iconeMoto }
      ).addTo(map).bindPopup(
        `<p>Número: ${d.numero}</p>
         <a href="${waze}" target="_blank">Abrir no Waze</a>`
      );
    }
  });
});
