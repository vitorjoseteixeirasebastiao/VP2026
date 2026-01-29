// ===== Firebase =====
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

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
const colecaoMarcadores = "marcadores";

// ===== Funções Firebase =====
async function salvarMarcador(lat, lng, titulo="Marcador") {
  try {
    await addDoc(collection(db, colecaoMarcadores), {
      titulo,
      latitude: lat,
      longitude: lng,
      criadoEm: serverTimestamp()
    });
  } catch (err) {
    console.error("Erro ao salvar marcador:", err);
  }
}

async function carregarMarcadores() {
  try {
    const snapshot = await getDocs(collection(db, colecaoMarcadores));
    snapshot.forEach(doc => {
      const data = doc.data();
      const lat = parseFloat(data.latitude);
      const lng = parseFloat(data.longitude);
      const titulo = data.titulo || "Marcador";
      
      L.marker([lat, lng])
        .addTo(map)
        .bindPopup(`<b>${titulo}</b><br><a href="https://waze.com/ul?ll=${lat},${lng}&navigate=yes" target="_blank">Abrir no Waze</a>`);
    });
  } catch (err) {
    console.error("Erro ao carregar marcadores:", err);
  }
}

// ===== Inicializa mapa =====
const map = L.map("map").setView([0,0], 15);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap"
}).addTo(map);

// ===== Marcador azul do usuário =====
const iconeUsuario = L.divIcon({
  className:"",
  html:'<div style="width:16px;height:16px;background:#007bff;border:3px solid white;border-radius:50%;box-shadow:0 0 6px rgba(0,123,255,.8);"></div>',
  iconSize:[16,16],
  iconAnchor:[8,8]
});
const marcadorUsuario = L.marker([0,0], {icon:iconeUsuario}).addTo(map);

let posicaoAtual = null;
let primeiraLocalizacao = true;

// ===== Geolocalização =====
if (navigator.geolocation) {
  navigator.geolocation.watchPosition(pos => {
    posicaoAtual = {lat: pos.coords.latitude, lng: pos.coords.longitude};
    marcadorUsuario.setLatLng([posicaoAtual.lat,posicaoAtual.lng]);
    if(primeiraLocalizacao) {
      map.setView([posicaoAtual.lat,posicaoAtual.lng],18);
      primeiraLocalizacao = false;
    }
  }, err => console.error("Erro GPS:", err), {enableHighAccuracy:true});
}

// ===== Botões existentes =====
document.getElementById("btnCentralizar").onclick = ()=>{
  if(posicaoAtual) map.setView([posicaoAtual.lat,posicaoAtual.lng],18);
};

document.getElementById("btnAdicionarMarcador").onclick = async ()=>{
  if(posicaoAtual) {
    const {lat,lng} = posicaoAtual;

    // Busca endereço via Nominatim para exibir no pop-up
    let endereco = "Marcador do Usuário";
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      const data = await res.json();
      if(data.display_name) endereco = data.display_name;
    } catch(err){ console.error(err); }

    L.marker([lat,lng])
      .addTo(map)
      .bindPopup(`<b>${endereco}</b><br><a href="https://waze.com/ul?ll=${lat},${lng}&navigate=yes" target="_blank">Abrir no Waze</a>`)
      .openPopup();

    salvarMarcador(lat,lng,endereco);
  } else {
    alert("Localização não disponível.");
  }
};

// ===== Pesquisa de endereço com até 2 sugestões =====
const inputEndereco = document.getElementById("inputEndereco");
const sugestoesDiv = document.getElementById("sugestoes");

inputEndereco.addEventListener("input", async () => {
  const query = inputEndereco.value.trim();
  if(!query) {
    sugestoesDiv.innerHTML = "";
    return;
  }

  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=2&q=${encodeURIComponent(query)}`);
    const data = await res.json();
    sugestoesDiv.innerHTML = "";
    data.forEach(item => {
      const div = document.createElement("div");
      div.textContent = item.display_name;
      div.onclick = () => {
        map.setView([parseFloat(item.lat), parseFloat(item.lon)],18);
        sugestoesDiv.innerHTML = "";
        inputEndereco.value = "";
      };
      sugestoesDiv.appendChild(div);
    });
  } catch(err){
    console.error(err);
  }
});

// ===== Carrega marcadores salvos =====
carregarMarcadores();
