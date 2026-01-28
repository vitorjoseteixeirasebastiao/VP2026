import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { 
  getFirestore, collection, addDoc, getDocs, doc, updateDoc, onSnapshot 
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

// ===== Funções auxiliares =====
function mostrarMensagem(texto){
  const div = document.getElementById("mensagens");
  div.innerText = texto;
  setTimeout(()=>{ div.innerText=""; },4000);
}

function calcularDistancia(lat1, lon1, lat2, lon2){
  const R = 6371e3;
  const φ1 = lat1*Math.PI/180;
  const φ2 = lat2*Math.PI/180;
  const Δφ = (lat2-lat1)*Math.PI/180;
  const Δλ = (lon2-lon1)*Math.PI/180;
  const a = Math.sin(Δφ/2)**2 + Math.cos(φ1)*Math.cos(φ2)*Math.sin(Δλ/2)**2;
  const c = 2*Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R*c;
}

// ===== Inicializa mapa =====
const map = L.map("map").setView([-23.5505,-46.6333],17); // zoom maior
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{attribution:"© OpenStreetMap"}).addTo(map);

// ===== Marcadores =====
const iconeMoto = L.icon({ iconUrl:"https://cdn-icons-png.flaticon.com/512/684/684908.png", iconSize:[35,35], iconAnchor:[17,35] });
const iconePendente = L.icon({ iconUrl:"https://cdn-icons-png.flaticon.com/512/1946/1946429.png", iconSize:[30,30], iconAnchor:[15,30] });

// Marcador do usuário
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
    map.setView([lat,lng],18,{animate:true}); // zoom mais próximo
  }, (err)=>{ console.log("Erro GPS:", err.message); }, { enableHighAccuracy:true, maximumAge:1000 });
}

// ===== Botão salvar =====
async function salvarVaga(){
  const numero = document.getElementById("numero").value;
  if(!numero){ mostrarMensagem("Digite o número do local"); return; }

  mostrarMensagem("Buscando localização...");
  if(!navigator.geolocation){ mostrarMensagem("GPS não disponível"); return; }

  navigator.geolocation.getCurrentPosition(async (pos)=>{
    const lat = pos.coords.latitude;
    const lng = pos.coords.longitude;

    try{
      const snapshot = await getDocs(collection(db,"teste"));
      let encontrouProximo = false;

      for(const docSnap of snapshot.docs){
        const d = docSnap.data();
        if(d.status === "pendente"){
          const distancia = calcularDistancia(lat,lng,d.latitude,d.longitude);
          if(distancia <= 10){
            encontrouProximo = true;
            const novasConfirmacoes = (d.confirmations||1)+1;
            if(novasConfirmacoes >= 2){
              await updateDoc(doc(db,"teste",docSnap.id), { confirmations: novasConfirmacoes, status: "validado" });
              mostrarMensagem("Vaga VALIDADA automaticamente!");
            } else {
              await updateDoc(doc(db,"teste",docSnap.id), { confirmations: novasConfirmacoes });
              mostrarMensagem("Confirmação registrada!");
            }
            break;
          }
        }
      }

      if(!encontrouProximo){
        await addDoc(collection(db,"teste"), {
          numero,
          latitude: lat,
          longitude: lng,
          status: "pendente",
          confirmations: 1,
          data: new Date()
        });
        mostrarMensagem("Vaga pendente criada!");
      }

      document.getElementById("numero").value = "";

    }catch(err){
      mostrarMensagem("Erro Firebase: "+err.message);
      console.error(err);
    }

  }, (err)=>{ mostrarMensagem("Erro GPS: "+err.message); }, { enableHighAccuracy:true });
}

document.getElementById("btnSalvar").addEventListener("click", salvarVaga);

// ===== Marcadores =====
const markersVagas = {};

function criarOuAtualizarMarcador(id,d){
  const urlWaze = `https://waze.com/ul?ll=${d.latitude},${d.longitude}&navigate=yes`;

  if(markersVagas[id]){
    markersVagas[id].setLatLng([d.latitude,d.longitude]);
    return;
  }

  const icone = d.status === "validado" ? iconeMoto : iconePendente;
  const popup = `<p>Número: ${d.numero} ${d.status==="pendente"?"(pendente)":""}</p>
                 <a href="${urlWaze}" target="_blank">Abrir no Waze</a>`;

  markersVagas[id] = L.marker([d.latitude,d.longitude], {icon: icone})
                       .addTo(map)
                       .bindPopup(popup);
}

// Carrega todos os documentos existentes
async function carregarVagasIniciais(){
  const snapshot = await getDocs(collection(db,"teste"));
  snapshot.docs.forEach(docSnap => criarOuAtualizarMarcador(docSnap.id, docSnap.data()));
}
carregarVagasIniciais();

// Atualização em tempo real
onSnapshot(collection(db,"teste"), snapshot=>{
  snapshot.docChanges().forEach(change=>{
    criarOuAtualizarMarcador(change.doc.id, change.doc.data());
  });
});
