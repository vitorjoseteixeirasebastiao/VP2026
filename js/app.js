import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, onSnapshot } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

window.onload = async function(){

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
    setTimeout(()=> div.innerText="", 3000);
  }

  // ===== Inicializa mapa =====
  const map = L.map("map").setView([0,0],15);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap"
  }).addTo(map);

  // ===== Ícone azul do usuário =====
  const iconeUsuario = L.divIcon({
    className:"",
    html:'<div style="width:16px;height:16px;background:#007bff;border:3px solid white;border-radius:50%;box-shadow:0 0 6px rgba(0,123,255,.8);"></div>',
    iconSize:[16,16],
    iconAnchor:[8,8]
  });

  const marcadorUsuario = L.marker([0,0],{icon:iconeUsuario}).addTo(map);

  let posicaoAtual = null;
  let primeiraLocalizacao = true;

  // ===== Atualiza localização do usuário =====
  if(navigator.geolocation){
    navigator.geolocation.watchPosition(pos=>{
      posicaoAtual = {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude
      };
      marcadorUsuario.setLatLng([posicaoAtual.lat,posicaoAtual.lng]);

      if(primeiraLocalizacao){
        map.setView([posicaoAtual.lat,posicaoAtual.lng],18);
        primeiraLocalizacao=false;
      }

    }, err=>{
      mostrarMensagem("Erro GPS: "+err.message);
      console.log(err);
    }, { enableHighAccuracy:true });
  } else {
    alert("GPS não disponível");
  }

  // ===== Botão adicionar marcador =====
  const btnMarcador = document.getElementById("btnMarcador");
  btnMarcador.disabled = true;

  const habilitarBotao = setInterval(()=>{
    if(posicaoAtual){
      btnMarcador.disabled = false;
      clearInterval(habilitarBotao);
    }
  },100);

  btnMarcador.onclick = async ()=>{
    if(!posicaoAtual) return;

    // Adiciona marcador no mapa
    L.marker([posicaoAtual.lat,posicaoAtual.lng])
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
      console.error("Erro ao salvar:",err);
      mostrarMensagem("Erro ao salvar no Firebase");
    }
  }

  // ===== Marcadores do Firebase =====
  const markers = {}; // Armazena marcadores existentes
  const colRef = collection(db,"teste");

  // 1️⃣ Carrega marcadores existentes ao iniciar
  const snapshotInicial = await getDocs(colRef);
  snapshotInicial.forEach(docSnap=>{
    const id = docSnap.id;
    const data = docSnap.data();
    markers[id] = L.marker([data.latitude,data.longitude])
                    .addTo(map)
                    .bindPopup("Marcador na posição");
  });

  // 2️⃣ Atualização automática para novos marcadores
  onSnapshot(colRef, snapshot=>{
    snapshot.docChanges().forEach(change=>{
      const id = change.doc.id;
      const data = change.doc.data();

      if(change.type === "added" && !markers[id]){
        // Novo marcador adicionado por outro usuário
        markers[id] = L.marker([data.latitude,data.longitude])
                        .addTo(map)
                        .bindPopup("Marcador na posição");
      }
    });
  });

  // ===== Botão centralizar =====
  const btnCentralizar = document.getElementById("btnCentralizar");
  btnCentralizar.onclick = ()=>{
    if(posicaoAtual){
      map.setView([posicaoAtual.lat,posicaoAtual.lng],18);
    }
  }

};
