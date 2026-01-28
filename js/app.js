import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

window.onload = function() {

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

  // ===== Inicializa mapa =====
  const map = L.map("map").setView([0,0], 15);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap"
  }).addTo(map);

  // ===== Ícone azul do usuário =====
  const iconeUsuario = L.divIcon({
    className: "",
    html: '<div style="width:16px;height:16px;background:#007bff;border:3px solid white;border-radius:50%;box-shadow:0 0 6px rgba(0,123,255,.8);"></div>',
    iconSize: [16,16],
    iconAnchor: [8,8]
  });

  const marcadorUsuario = L.marker([0,0], { icon: iconeUsuario }).addTo(map);

  let primeiraLocalizacao = true;
  let posicaoAtual = null;

  // ===== Atualiza localização do usuário =====
  if(navigator.geolocation){
    navigator.geolocation.watchPosition(pos=>{
      posicaoAtual = {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude
      };

      marcadorUsuario.setLatLng([posicaoAtual.lat, posicaoAtual.lng]);

      if(primeiraLocalizacao){
        map.setView([posicaoAtual.lat, posicaoAtual.lng],18);
        primeiraLocalizacao = false;
      }

    }, err=>{
      console.log("Erro GPS:", err.message);
      alert("Erro ao obter GPS: " + err.message);
    }, { enableHighAccuracy:true });
  } else {
    alert("GPS não disponível");
  }

  // ===== Botão adicionar marcador na posição atual e salvar no Firebase =====
  const btn = document.getElementById("btnMarcador");
  btn.disabled = true;

  const habilitarBotao = setInterval(()=>{
    if(posicaoAtual){
      btn.disabled = false;
      clearInterval(habilitarBotao);
    }
  }, 100);

  btn.onclick = async ()=>{
    if(posicaoAtual){
      // Adiciona marcador no mapa
      L.marker([posicaoAtual.lat, posicaoAtual.lng])
        .addTo(map)
        .bindPopup("Marcador na posição atual").openPopup();

      // Salva no Firebase
      try {
        await addDoc(collection(db,"teste"),{
          latitude: posicaoAtual.lat,
          longitude: posicaoAtual.lng,
          data: new Date()
        });
        mostrarMensagem("Marcador salvo no Firebase!");
      } catch(err){
        console.error("Erro ao salvar:", err);
        mostrarMensagem("Erro ao salvar no Firebase");
      }
    }
  }

};
