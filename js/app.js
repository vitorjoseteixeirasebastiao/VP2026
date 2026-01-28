import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, doc, updateDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

/* ================= FIREBASE ================= */
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

/* ================= HELPERS ================= */
function mostrarMensagem(msg){
  const el = document.getElementById("mensagens");
  el.innerText = msg;
  setTimeout(()=> el.innerText="", 4000);
}

/* ================= MAPA ================= */
const map = L.map("map").setView([-23.5505, -46.6333], 18);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);

/* 🔵 Ícone usuário (círculo azul) */
const iconeUsuario = L.divIcon({
  className: "usuario-icon",
  html: "<div></div>",
  iconSize: [20,20],
  iconAnchor: [10,10]
});

/* 🏍️ Ícone vagas */
const iconeMoto = L.icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
  iconSize: [40,40],
  iconAnchor: [20,40]
});

const marcadorUsuario = L.marker([0,0], { icon: iconeUsuario }).addTo(map);

/* ================= MINHA LOCALIZAÇÃO ================= */
document.getElementById("btnMinhaLocalizacao").addEventListener("click", ()=>{
  navigator.geolocation.getCurrentPosition(pos=>{
    const { latitude, longitude } = pos.coords;
    marcadorUsuario.setLatLng([latitude, longitude]);
    map.setView([latitude, longitude], 18, { animate:true });
  }, ()=> mostrarMensagem("Erro ao obter GPS"), { enableHighAccuracy:true });
});

/* ================= BUSCAR ENDEREÇO ================= */
document.getElementById("btnBuscarEndereco").addEventListener("click", async ()=>{
  const q = document.getElementById("searchEndereco").value;
  if(!q) return;

  const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}`);
  const data = await res.json();

  if(data.length === 0){
    mostrarMensagem("Endereço não encontrado");
    return;
  }

  map.setView([data[0].lat, data[0].lon], 18, { animate:true });
});

/* ================= SALVAR VAGA ================= */
document.getElementById("btnSalvar").addEventListener("click", ()=>{
  navigator.geolocation.getCurrentPosition(async pos=>{
    const numero = document.getElementById("numero").value;
    if(!numero) return mostrarMensagem("Informe o número");

    await addDoc(collection(db,"teste"), {
      numero,
      latitude: pos.coords.latitude,
      longitude: pos.coords.longitude,
      status: "validado",
      confirmations: 2,
      data: new Date()
    });

    mostrarMensagem("Vaga salva!");
    document.getElementById("numero").value = "";
  });
});

/* ================= VAGAS + WAZE ================= */
const markersVagas = {};

onSnapshot(collection(db,"teste"), snapshot=>{
  snapshot.forEach(docSnap=>{
    const d = docSnap.data();
    if(d.status === "validado" && !markersVagas[docSnap.id]){
      const waze = `https://waze.com/ul?ll=${d.latitude},${d.longitude}&navigate=yes`;

      markersVagas[docSnap.id] = L.marker(
        [d.latitude, d.longitude],
        { icon: iconeMoto }
      )
      .addTo(map)
      .on("click", ()=> window.open(waze, "_blank"));
    }
  });
});
