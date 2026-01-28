import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import {
  getFirestore, collection, addDoc, onSnapshot
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

/* Firebase */
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

/* Mapa */
const map = L.map("map", {
  zoomControl: true,
  attributionControl: false
}).setView([-23.5505, -46.6333], 18);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);

/* Força recálculo (mobile safe) */
setTimeout(() => map.invalidateSize(), 500);

/* Ícones */
const iconeUsuario = L.divIcon({
  className: "usuario-icon",
  html: "<div></div>",
  iconSize: [22, 22],
  iconAnchor: [11, 11]
});

const iconeMoto = L.icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
  iconSize: [40, 40],
  iconAnchor: [20, 40]
});

/* Usuário */
const marcadorUsuario = L.marker([0, 0], { icon: iconeUsuario }).addTo(map);

/* GPS SEM travar mapa */
navigator.geolocation.watchPosition(pos => {
  marcadorUsuario.setLatLng([
    pos.coords.latitude,
    pos.coords.longitude
  ]);
});

/* Botão centralizar */
document.getElementById("btnLocalizacao").onclick = () => {
  navigator.geolocation.getCurrentPosition(pos => {
    map.setView(
      [pos.coords.latitude, pos.coords.longitude],
      19
    );
  });
};

/* Pesquisa endereço */
document.getElementById("search").addEventListener("keydown", async e => {
  if (e.key === "Enter") {
    const q = e.target.value;
    const r = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${q}`
    );
    const d = await r.json();
    if (d[0]) map.setView([d[0].lat, d[0].lon], 19);
  }
});

/* Vagas */
const vagasRef = collection(db, "teste");
const markers = {};

onSnapshot(vagasRef, snap => {
  snap.forEach(doc => {
    const d = doc.data();
    if (d.status === "validado" && !markers[doc.id]) {
      const waze = `https://waze.com/ul?ll=${d.latitude},${d.longitude}&navigate=yes`;
      markers[doc.id] = L.marker(
        [d.latitude, d.longitude],
        { icon: iconeMoto }
      ).addTo(map).on("click", () => window.open(waze));
    }
  });
});

/* Salvar vaga */
document.getElementById("btnSalvar").onclick = () => {
  const numero = document.getElementById("numero").value;
  if (!numero) return;

  navigator.geolocation.getCurrentPosition(pos => {
    addDoc(collection(db, "teste"), {
      numero,
      latitude: pos.coords.latitude,
      longitude: pos.coords.longitude,
      status: "pendente",
      confirmations: 1,
      data: new Date()
    });
    document.getElementById("numero").value = "";
  });
};
