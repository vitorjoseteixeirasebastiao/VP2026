import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

/* ================= FIREBASE ================= */
const firebaseConfig = {
  apiKey: "AIzaSyByYEISjGfRIh7Xxx5j7rtJ7Fm_nmMTgRk",
  authDomain: "vpm2026-8167b.firebaseapp.com",
  projectId: "vpm2026-8167b",
  storageBucket: "vpm2026-8167b.appspot.com",
  messagingSenderId: "129557498750",
  appId: "1:129557498750:web:c2a510c04946583a17412f"
};

initializeApp(firebaseConfig);
const db = getFirestore();

/* ================= MENSAGENS ================= */
function mostrarMensagem(msg) {
  const el = document.getElementById("mensagens");
  el.innerText = msg;
  setTimeout(() => el.innerText = "", 4000);
}

/* ================= MAPA ================= */
const map = L.map("map");

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap"
}).addTo(map);

/* ================= USUÁRIO (CÍRCULO AZUL) ================= */
const marcadorUsuario = L.circleMarker([0, 0], {
  radius: 10,
  fillColor: "#1e90ff",
  color: "#ffffff",
  weight: 3,
  fillOpacity: 1
}).addTo(map);

/* ================= LOCALIZAÇÃO INICIAL ================= */
// Centraliza o mapa APENAS UMA VEZ
map.locate({
  setView: true,
  maxZoom: 18,
  enableHighAccuracy: true
});

// Quando encontrar a localização inicial
map.on("locationfound", e => {
  marcadorUsuario.setLatLng(e.latlng);
});

// Erro de localização
map.on("locationerror", () => {
  mostrarMensagem("Erro ao acessar GPS");
  map.setView([-23.5505, -46.6333], 13);
});

/* ================= ATUALIZAÇÃO EM TEMPO REAL ================= */
// Atualiza SOMENTE o ícone (não move o mapa)
navigator.geolocation.watchPosition(
  pos => {
    marcadorUsuario.setLatLng([
      pos.coords.latitude,
      pos.coords.longitude
    ]);
  },
  err => console.error("Erro GPS:", err),
  { enableHighAccuracy: true }
);

/* ================= BOTÃO CENTRALIZAR ================= */
document.getElementById("btnLocalizacao").onclick = () => {
  map.locate({
    setView: true,
    maxZoom: 18,
    enableHighAccuracy: true
  });
};

/* ================= PESQUISA DE ENDEREÇO ================= */
document.getElementById("search").addEventListener("keydown", async e => {
  if (e.key === "Enter") {
    const q = e.target.value;
    if (!q) return;

    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}`
    );
    const data = await res.json();

    if (data[0]) {
      map.setView([data[0].lat, data[0].lon], 18);
    } else {
      mostrarMensagem("Endereço não encontrado");
    }
  }
});

/* ================= SALVAR VAGA ================= */
document.getElementById("btnSalvar").onclick = () => {
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

/* ================= VAGAS VALIDADAS ================= */
const markersVagas = {};
onSnapshot(collection(db, "teste"), snap => {
  snap.forEach(docSnap => {
    const d = docSnap.data();

    if (d.status === "validado" && !markersVagas[docSnap.id]) {
      markersVagas[docSnap.id] = L.marker(
        [d.latitude, d.longitude]
      ).addTo(map);
    }
  });
});
