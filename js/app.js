import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

window.onload = function(){

  // ===== Firebase =====
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

  function mostrarMensagem(msg){
    const div = document.getElementById("mensagens");
    div.innerText = msg;
    setTimeout(()=>{ div.innerText=""; },3000);
  }

  // ===== Mapa =====
  const map = L.map("map").setView([-23.5505,-46.6333],15);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap"
  }).addTo(map);

  // ===== Ícone do usuário =====
  const iconeUsuario = L.divIcon({
    className:"",
    html:'<div style="width:16px;height:16px;background:#007bff;border:3px solid white;border-radius:50%;box-shadow:0 0 6px rgba(0,123,255,.8);"></div>',
    iconSize:[16,16],
    iconAnchor:[8,8]
  });

  const marcadorUsuario = L.marker([0,0],{icon:iconeUsuario}).addTo(map);
  let primeiraLocalizacao = true;

  navigator.geolocation.watchPosition(pos=>{
    const lat = pos.coords.latitude;
    const lng = pos.coords.longitude;
    marcadorUsuario.setLatLng([lat,lng]);
    if(primeiraLocalizacao){
      map.setView([lat,lng],18);
      primeiraLocalizacao=false;
    }
  },()=>mostrarMensagem("Erro GPS"), {enableHighAccuracy:true});

  // ===== Botão centralizar =====
  document.getElementById("btnLocalizacao").onclick = ()=>{
    navigator.geolocation.getCurrentPosition(pos=>{
      map.setView([pos.coords.latitude,pos.coords.longitude],18);
    });
  };

  // ===== Pesquisa endereço =====
  document.getElementById("btnBuscar").onclick = async ()=>{
    const q = document.getElementById("search").value;
    if(!q) return;
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}`);
    const data = await res.json();
    if(data[0]){
      map.setView([data[0].lat,data[0].lon],18);
    }
  };

  // ===== Salvar vaga =====
  document.getElementById("btnSalvar").onclick = async ()=>{
    const numero = document.getElementById("numero").value;
    if(!numero) return mostrarMensagem("Digite o número");

    navigator.geolocation.getCurrentPosition(async pos=>{
      await addDoc(collection(db,"teste"),{
        numero,
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        data: new Date()
      });
      mostrarMensagem("Vaga criada");
      document.getElementById("numero").value="";
    });
  };

  // ===== Marcadores estilo DivIcon (placa de estacionamento) =====
  const markers = {};
  onSnapshot(collection(db,"teste"), snapshot=>{
    snapshot.docs.forEach(docSnap=>{
      const v = docSnap.data();
      const id = docSnap.id;

      const iconeVaga = L.divIcon({
        className:"",
        html: `<div style="width:28px;height:28px;background:#ff5722;color:white;font-weight:bold;
                text-align:center;line-height:28px;border-radius:4px;border:2px solid white;
                box-shadow:0 0 4px rgba(0,0,0,0.5);">P</div>`,
        iconSize:[28,28],
        iconAnchor:[14,28]
      });

      if(markers[id]){
        markers[id].setLatLng([v.latitude,v.longitude])
                 .setPopupContent("<b>Número:</b> "+v.numero);
      } else {
        markers[id] = L.marker([v.latitude,v.longitude], {icon:iconeVaga})
                         .addTo(map)
                         .bindPopup("<b>Número:</b> "+v.numero);
      }
    });
  });

};
