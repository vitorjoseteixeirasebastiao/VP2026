import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

// ===== Firebase =====
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

async function salvarMarcador(lat, lng, titulo="Marcador") {
  try {
    await addDoc(collection(db, colecaoMarcadores), {
      titulo,
      latitude: lat,
      longitude: lng,
      criadoEm: serverTimestamp()
    });
  } catch (err) { console.error(err); }
}

// ===== Inicializa Mapa =====
const map = L.map("map").setView([0,0], 15);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap"
}).addTo(map);

// ===== Marcador usuário =====
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
if(navigator.geolocation){
  navigator.geolocation.watchPosition(pos=>{
    posicaoAtual = {lat: pos.coords.latitude, lng: pos.coords.longitude};
    marcadorUsuario.setLatLng([posicaoAtual.lat,posicaoAtual.lng]);
    if(primeiraLocalizacao){
      map.setView([posicaoAtual.lat,posicaoAtual.lng],18);
      primeiraLocalizacao=false;
    }
  }, err=>console.error(err), {enableHighAccuracy:true});
}

// ===== Botões existentes =====
document.getElementById("btnCentralizar").onclick = ()=>{
  if(posicaoAtual) map.setView([posicaoAtual.lat,posicaoAtual.lng],18);
};
document.getElementById("btnAdicionarMarcador").onclick = async ()=>{
  if(posicaoAtual){
    const {lat,lng} = posicaoAtual;
    L.marker([lat,lng]).addTo(map)
      .bindPopup(`Marcador do Usuário<br><a href="https://waze.com/ul?ll=${lat},${lng}&navigate=yes" target="_blank">Abrir no Waze</a>`)
      .openPopup();
    salvarMarcador(lat,lng,"Marcador do Usuário");
  }
};

// ===== Pesquisa de endereços com autocomplete =====
const inputEndereco = document.getElementById("inputEndereco");
const provider = new window.GeoSearch.OpenStreetMapProvider();

inputEndereco.addEventListener("input", async () => {
  const query = inputEndereco.value;
  if(query.length < 3) return;

  const results = await provider.search({ query });
  let lista = document.getElementById("autocomplete-list");
  if(lista) lista.remove();

  lista = document.createElement("div");
  lista.id = "autocomplete-list";
  lista.className = "autocomplete-sugestao";

  results.forEach(r => {
    const div = document.createElement("div");
    div.textContent = r.label;
    div.onclick = () => {
      map.setView([r.y, r.x], 18);
      L.marker([r.y, r.x]).addTo(map)
        .bindPopup(`<b>${r.label}</b><br><a href="https://waze.com/ul?ll=${r.y},${r.x}&navigate=yes" target="_blank">Abrir no Waze</a>`)
        .openPopup();
      salvarMarcador(r.y, r.x, r.label);
      lista.remove();
      inputEndereco.value = "";
    };
    lista.appendChild(div);
  });

  inputEndereco.parentNode.appendChild(lista);
});
