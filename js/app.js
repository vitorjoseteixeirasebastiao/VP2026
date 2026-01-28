import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import {
  getFirestore, collection, addDoc, onSnapshot
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

/* ===== FIREBASE ===== */
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

/* ===== MENSAGENS ===== */
function mostrarMensagem(msg) {
  const div = document.getElementById("mensagens");
  div.innerText = msg;
  setTimeout(() => div.innerText = "", 4000);
}

/* ===== MAPA ===== */
const map = L.map("map").setView([-23.5505, -46.6333], 15);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap"
}).addTo(map);

/* ===== ÍCONE USUÁRIO (CÍRCULO AZUL) ===== */
const iconeUsuario = L.divIcon({
  className: "",
  html: `
    <div style="
      width:18px;
      height:18px;
      background:#007bff;
      border:3px solid white;
      border-radius:50%;
      box-shadow:0 0 8px rgba(0,123,255,.9);
    "></div>
  `,
  iconSize: [18,18],
  iconAnchor: [9,9]
});

const marcadorUsuario = L.marker([0,0], {
  icon: iconeUsuario
}).addTo(map);

/* ===== GPS ===== */
let primeiraLocalizacao = true;

navigator.geolocation.watchPosition(
  pos => {
    const lat = pos.coords.latitude;
    const lng = pos.coords.longitude;

    marcadorUsuario.setLatLng([lat, lng]);

    if (primeiraLocalizacao) {
      map.setView([lat, lng], 18);
      primeiraLocalizacao = false;
    }
  },
  err => console.error(err),
  { enableHighAccuracy: true }
);

/* ===== BOTÃO CENTRALIZAR ===== */
document.getElementById("btnLocalizacao").onclick = () => {
  navigator.geolocation.getCurrentPosition(pos => {
    map.setView(
      [pos.coords.latitude, pos.coords.longitude],
      18,
      { animate: true }
    );
  });
};

/* ===== PESQUISA ENDEREÇO ===== */
async function buscarEndereco() {
  const q = document.getElementById("search").value;
  if (!q) return;

  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${q}`
  );
  const data = await res.json();

  if (data[0]) {
    map.setView([data[0].lat, data[0].lon], 18);
  }
}

document.getElementById("btnBuscar").onclick = buscarEndereco;
document.getElementById("btnLimpar").onclick = () => {
  document.getElementById("search").value = "";
};

/* ===== SALVAR VAGA ===== */
document.getElementById("btnSalvar").onclick = async () => {
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
};

/* ===== VAGAS VALIDAS ===== */
const markers = {};
onSnapshot(collection(db, "teste"), snap => {
  snap.forEach(d => {
    const v = d.data();
    if (v.status === "validado" && !markers[d.id]) {
      markers[d.id] = L.marker([v.latitude, v.longitude])
        .addTo(map)
        .bindPopup(`Número: ${v.numero}`);
    }
  });
});
