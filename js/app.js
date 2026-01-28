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

/* Util */
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
  const a = Math.sin(Δφ/2)**2 +
            Math.cos(φ1)*Math.cos(φ2)*
            Math.sin(Δλ/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

/* Mapa */
const map = L.map("map").setView([-23.5505,-46.6333],16);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{
  attribution:"© OpenStreetMap"
}).addTo(map);

/* Ícones */
const iconeVaga = L.icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/1483/1483336.png",
  iconSize: [36, 36],
  iconAnchor: [18, 36]
});

const iconeUsuario = L.divIcon({
  className: "usuario-icon",
  iconSize: [22, 22],
  iconAnchor: [11, 11]
});

/* Usuário */
const marcadorUsuario = L.marker([0,0], { icon: iconeUsuario }).addTo(map);

if(navigator.geolocation){
  navigator.geolocation.watchPosition(pos=>{
    marcadorUsuario.setLatLng([
      pos.coords.latitude,
      pos.coords.longitude
    ]);
  });
}

/* Botão Minha localização */
document.getElementById("btnLocalizacao").onclick = ()=>{
  navigator.geolocation.getCurrentPosition(pos=>{
    map.setView(
      [pos.coords.latitude, pos.coords.longitude],
      18
    );
  });
};

/* Pesquisa endereço */
async function pesquisarEndereco(){
  const q = document.getElementById("search").value;
  if(!q){ mostrarMensagem("Digite um endereço"); return; }

  try{
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}`
    );
    const data = await res.json();

    if(!data.length){
      mostrarMensagem("Endereço não encontrado");
      return;
    }

    map.setView([data[0].lat, data[0].lon], 18);
  }catch(err){
    mostrarMensagem("Erro na pesquisa");
  }
}

document.getElementById("btnPesquisar")
  .addEventListener("click", pesquisarEndereco);

document.getElementById("search")
  .addEventListener("keydown", e=>{
    if(e.key === "Enter") pesquisarEndereco();
  });

/* Salvar vaga */
async function salvarVaga(){
  const numero = document.getElementById("numero").value;
  if(!numero){ mostrarMensagem("Digite o número do local"); return; }

  navigator.geolocation.getCurrentPosition(async pos=>{
    const lat = pos.coords.latitude;
    const lng = pos.coords.longitude;

    try{
      const snapshot = await getDocs(collection(db,"teste"));
      let encontrouProximo = false;

      for(const docSnap of snapshot.docs){
        const d = docSnap.data();
        if(d.status === "pendente"){
          const dist = calcularDistancia(lat,lng,d.latitude,d.longitude);
          if(dist <= 10){
            encontrouProximo = true;
            const novas = (d.confirmations||1)+1;
            if(novas >= 2){
              await updateDoc(doc(db,"teste",docSnap.id),{
                confirmations:novas,
                status:"validado"
              });
              mostrarMensagem("Vaga VALIDADA!");
            }else{
              await updateDoc(doc(db,"teste",docSnap.id),{
                confirmations:novas
              });
              mostrarMensagem("Confirmação registrada!");
            }
            break;
          }
        }
      }

      if(!encontrouProximo){
        await addDoc(collection(db,"teste"),{
          numero,
          latitude:lat,
          longitude:lng,
          status:"pendente",
          confirmations:1,
          data:new Date()
        });
        mostrarMensagem("Vaga pendente criada!");
      }

      document.getElementById("numero").value = "";
    }catch(err){
      mostrarMensagem("Erro Firebase");
    }
  });
}

document.getElementById("btnSalvar")
  .addEventListener("click", salvarVaga);

/* Vagas em tempo real */
const markersVagas = {};
const vagasRef = collection(db,"teste");

onSnapshot(vagasRef, snapshot=>{
  snapshot.docChanges().forEach(change=>{
    const d = change.doc.data();
    const id = change.doc.id;

    if(d.status === "validado"){
      const waze =
        `https://waze.com/ul?ll=${d.latitude},${d.longitude}&navigate=yes`;

      const popup =
        `<p>Número: ${d.numero}</p>
         <a href="${waze}" target="_blank">Abrir no Waze</a>`;

      if(markersVagas[id]){
        markersVagas[id].setLatLng([d.latitude,d.longitude]);
        markersVagas[id].bindPopup(popup);
      }else{
        markersVagas[id] = L.marker(
          [d.latitude,d.longitude],
          { icon: iconeVaga }
        ).addTo(map).bindPopup(popup);
      }
    }
  });
});
