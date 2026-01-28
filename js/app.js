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
function mostrarMensagem(msg) {
  const el = document.getElementById("mensagens");
  el.innerText = msg;
  setTimeout(() => el.innerText = "", 4000);
}

let map;
let marcadorUsuario;

/* 🚀 INICIALIZAÇÃO PELO GPS */
navigator.geolocation.getCurrentPosition(
  pos => {
    const lat = pos.coords.latitude;
    const lng = pos.coords.longitude;

    /* MAPA inicia na localização do usuário */
    map = L.map("map").setView([lat, lng], 18);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap"
    }).addTo(map);

    /* 🔵 Usuário = círculo azul */
    marcadorUsuario = L.circleMarker([lat, lng], {
      radius: 10,
      fillColor: "#1e90ff",
      color: "#ffffff",
      weight: 3,
      fillOpacity: 1
    }).addTo(map);

    /* Atualização em tempo real (sem travar o mapa) */
    navigator.geolocation.watchPosition(pos => {
      marcadorUsuario.setLatLng([
        pos.coords.latitude,
        pos.coords.longitude
      ]);
    });

  },
  err => {
    console.error(err);
    mostrarMensagem("Erro ao obter localização");
  },
  { enableHighAccuracy: true }
);

/* 📍 Botão centralizar */
document.getElementById("btnLocalizacao").onclick = () => {
  navigator.geolocation.getCurrentPosition(pos => {
    map.setView(
      [pos.coords.latitude, pos.coords.longitude],
      18
    );
  });
};

/* 🔍 Pesquisa de endereço */
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

/* Salvar vaga */
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

/* Vagas validadas */
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
