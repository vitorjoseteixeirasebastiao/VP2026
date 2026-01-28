import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import {
  getFirestore, collection, addDoc, getDocs, doc,
  updateDoc, onSnapshot
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

/* Mensagens */
function mostrarMensagem(txt) {
  const m = document.getElementById("mensagens");
  m.innerText = txt;
  setTimeout(() => m.innerText = "", 4000);
}

/* Mapa */
const map = L.map("map").setView([-23.5505, -46.6333], 18);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);

/* Corrige bug do mapa invisível */
setTimeout(() => map.invalidateSize(), 300);

/* Ícones */
const iconeMoto = L.icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
  iconSize: [40, 40],
  iconAnchor: [20, 40]
});

const iconeUsuario = L.divIcon({
  className: "usuario-icon",
  html: "<div></div>",
  iconSize: [22, 22],
  iconAnchor: [11, 11]
});

/* Marcador do usuário */
let marcadorUsuario = L.marker([0,0], { icon: iconeUsuario }).addTo(map);

/* GPS (não trava o mapa) */
navigator.geolocation.watchPosition(pos => {
  marcadorUsuario.setLatLng([pos.coords.latitude, pos.coords.longitude]);
});

/* Botão centralizar */
document.getElementById("btnLocalizacao").onclick = () => {
  navigator.geolocation.getCurrentPosition(pos => {
    map.setView([pos.coords.latitude, pos.coords.longitude], 19);
  });
};

/* Pesquisa de endereço */
document.getElementById("search").addEventListener("keydown", async e => {
  if (e.key === "Enter") {
    const q = e.target.value;
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${q}`);
    const data = await res.json();
    if (data[0]) {
      map.setView([data[0].lat, data[0].lon], 19);
    }
  }
});

/* Vagas */
const markersVagas = {};
const vagasRef = collection(db, "teste");

onSnapshot(vagasRef, snap => {
  snap.docChanges().forEach(change => {
    const d = change.doc.data();
    const id = change.doc.id;

    if (d.status === "validado") {
      const waze = `https://waze.com/ul?ll=${d.latitude},${d.longitude}&navigate=yes`;

      if (!markersVagas[id]) {
        markersVagas[id] = L.marker(
          [d.latitude, d.longitude],
          { icon: iconeMoto }
        ).addTo(map).on("click", () => {
          window.open(waze, "_blank");
        });
      }
    }
  });
});

/* Salvar vaga */
document.getElementById("btnSalvar").onclick = async () => {
  const numero = document.getElementById("numero").value;
  if (!numero) return mostrarMensagem("Digite o número");

  navigator.geolocation.getCurrentPosition(async pos => {
    await addDoc(collection(db,"teste"), {
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
