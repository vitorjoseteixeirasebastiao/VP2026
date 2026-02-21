// ===== Firebase =====
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

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
const colecao = "marcadores";

// ===== MAPA CANVAS =====
const map = L.map("map", {
  renderer: L.canvas(),
  preferCanvas: true
}).setView([0,0], 15);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution:"© OpenStreetMap"
}).addTo(map);

// ===== Cluster otimizado =====
const cluster = L.markerClusterGroup({
  showCoverageOnHover:false,
  animate:false,
  spiderfyOnMaxZoom:true,
  disableClusteringAtZoom:18
});

let marcadoresCarregados = false;

// ===== Popup padrão =====
function popupConteudo(endereco, lat, lng){
  return `
    <b>${endereco}</b><br><br>
    <a href="https://waze.com/ul?ll=${lat},${lng}&navigate=yes" target="_blank">
      Abrir no Waze
    </a>
  `;
}

// ===== Carregar marcadores somente após zoom =====
async function carregarMarcadores(){
  const snap = await getDocs(collection(db, colecao));

  snap.forEach(doc=>{
    const d = doc.data();

    const marker = L.circleMarker([d.latitude, d.longitude], {
      radius:6
    }).bindPopup(popupConteudo(d.endereco, d.latitude, d.longitude));

    cluster.addLayer(marker);
  });

  map.addLayer(cluster);
}

// ===== Controle de zoom =====
map.on("zoomend", ()=>{
  const zoom = map.getZoom();

  if(zoom >= 15 && !marcadoresCarregados){
    carregarMarcadores();
    marcadoresCarregados = true;
  }

  if(zoom < 14){
    if(map.hasLayer(camadaZonaAzul)){
      map.removeLayer(camadaZonaAzul);
    }
  } else {
    if(!map.hasLayer(camadaZonaAzul)){
      map.addLayer(camadaZonaAzul);
    }
  }
});

// ===== GPS =====
const iconeUsuario = L.divIcon({
  className:"",
  html:`<div style="width:16px;height:16px;background:#007bff;border:3px solid white;border-radius:50%;"></div>`,
  iconSize:[16,16],
  iconAnchor:[8,8]
});

const marcadorUsuario = L.marker([0,0],{icon:iconeUsuario}).addTo(map);

let posicaoAtual=null;
let primeira=true;

navigator.geolocation.watchPosition(pos=>{
  posicaoAtual={
    lat:pos.coords.latitude,
    lng:pos.coords.longitude
  };

  marcadorUsuario.setLatLng([posicaoAtual.lat,posicaoAtual.lng]);

  if(primeira){
    map.setView([posicaoAtual.lat,posicaoAtual.lng],18);
    primeira=false;
  }

},{enableHighAccuracy:true});

// ===== Centralizar =====
document.getElementById("btnCentralizar").onclick=()=>{
  if(posicaoAtual){
    map.setView([posicaoAtual.lat,posicaoAtual.lng],18);
  }
};

// ===== Busca =====
const searchInput=document.getElementById("searchInput");
const btnBuscar=document.getElementById("btnBuscar");
const suggestions=document.getElementById("suggestions");

btnBuscar.onclick=async()=>{
  const q=searchInput.value.trim();
  if(!q)return;

  const url=`https://nominatim.openstreetmap.org/search?format=json&limit=2&q=${encodeURIComponent(q)}`;
  const res=await fetch(url);
  const data=await res.json();

  suggestions.innerHTML="";

  data.forEach(item=>{
    const div=document.createElement("div");
    div.className="suggestion";
    div.textContent=item.display_name;

    div.onclick=()=>{
      map.setView([item.lat,item.lon],18);
      suggestions.innerHTML="";
    };

    suggestions.appendChild(div);
  });
};

// ===== KML Zona Azul =====
const camadaZonaAzul = omnivore.kml("ZonaAzul.kml")
.on("ready",function(){

  camadaZonaAzul.eachLayer(function(layer){

    let lat,lng;

    if(layer.getLatLng){
      const latlng=layer.getLatLng();
      lat=latlng.lat;
      lng=latlng.lng;
    }
    else if(layer.getBounds){
      const center=layer.getBounds().getCenter();
      lat=center.lat;
      lng=center.lng;
    }

    if(lat && lng){
      layer.bindPopup(`
        <b>Zona Azul</b><br><br>
        <a href="https://waze.com/ul?ll=${lat},${lng}&navigate=yes" target="_blank">
          Abrir no Waze
        </a>
      `);
    }

  });

});
