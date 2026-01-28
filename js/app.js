import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { 
  getFirestore, collection, addDoc, getDocs, onSnapshot 
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

// ===== Config Firebase =====
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

// ===== Mensagem =====
function mostrarMensagem(texto){
  const div = document.getElementById("mensagens");
  div.innerText = texto;
  setTimeout(()=>{ div.innerText=""; },4000);
}

// ===== Inicializa mapa =====
const map = L.map("map").setView([-23.5505,-46.6333], 17);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{attribution:"© OpenStreetMap"}).addTo(map);

// ===== Marcador do usuário =====
const marcadorUsuario = L.circleMarker([0,0], {
  radius: 14,
  color: '#007bff',
  fillColor: '#007bff',
  fillOpacity: 0.6
}).addTo(map);

if(navigator.geolocation){
  navigator.geolocation.watchPosition((pos)=>{
    const lat = pos.coords.latitude;
    const lng = pos.coords.longitude;
    marcadorUsuario.setLatLng([lat,lng]);
    map.setView([lat,lng],18);
  });
}

// ===== Salvar vaga =====
async function salvarVaga(){
  const numero = document.getElementById("numero").value;
  if(!numero){ mostrarMensagem("Digite o número do local"); return; }

  if(!navigator.geolocation){ mostrarMensagem("GPS não disponível"); return; }

  navigator.geolocation.getCurrentPosition(async (pos)=>{
    const lat = pos.coords.latitude;
    const lng = pos.coords.longitude;

    try{
      await addDoc(collection(db,"teste"),{
        numero,
        latitude: lat,
        longitude: lng,
        status: "pendente",
        confirmations: 1,
        data: new Date()
      });
      mostrarMensagem("Local registrado com sucesso!");
      document.getElementById("numero").value = "";
    } catch(err){
      mostrarMensagem("Erro ao salvar: "+err.message);
    }
  });
}

document.getElementById("btnSalvar").addEventListener("click", salvarVaga);

// ===== Exibir vagas validadas =====
const iconeMoto = L.icon({
  iconUrl:"https://cdn-icons-png.flaticon.com/512/684/684908.png",
  iconSize:[35,35],
  iconAnchor:[17,35]
});

const markersVagas = {};

onSnapshot(collection(db,"teste"), snapshot=>{
  snapshot.docChanges().forEach(change=>{
    const d = change.doc.data();
    if(d.status === "validado"){
      if(!markersVagas[change.doc.id]){
        markersVagas[change.doc.id] = L.marker([d.latitude,d.longitude], {icon: iconeMoto})
          .addTo(map)
          .bindPopup(`<p>Número: ${d.numero}</p>
                      <a href="https://waze.com/ul?ll=${d.latitude},${d.longitude}&navigate=yes" target="_blank">Abrir no Waze</a>`);
      }
    }
  });
});
