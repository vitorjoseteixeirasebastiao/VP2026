window.onload = function() {

  // ===== Import Firebase =====
  import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
  import { getFirestore, collection, addDoc, getDocs, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

  // ===== Configuração Firebase =====
  const firebaseConfig = {
    apiKey: "AIzaSyByYEISjGfRIh7Xxx5j7rtJ7Fm_nmMTgRk",
    authDomain: "vpm2026-8167b.firebaseapp.com",
    projectId: "vpm2026-8167b",
    storageBucket: "vpm2026-8167b.firebasestorage.app",
    messagingSenderId: "129557498750",
    appId: "1:129557498750:web:c2a510c04946583a17412f"
  };

  // Inicializa Firebase
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  const colecaoMarcadores = "marcadores";

  // ===== Funções Firebase =====
  async function salvarMarcador(lat, lng, titulo="Marcador") {
    try {
      const docRef = await addDoc(collection(db, colecaoMarcadores), {
        titulo,
        latitude: lat,
        longitude: lng,
        criadoEm: serverTimestamp()
      });
      console.log("Marcador salvo com ID:", docRef.id);
    } catch (error) {
      console.error("Erro ao salvar marcador:", error);
    }
  }

  // ===== Função de geocoding reverso =====
  async function obterEndereco(lat, lng) {
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`;
      const response = await fetch(url);
      const data = await response.json();
      return data.display_name || "Endereço não encontrado";
    } catch (error) {
      console.error("Erro ao obter endereço:", error);
      return "Endereço não encontrado";
    }
  }

  // ===== Função para criar marcador na posição do usuário =====
  async function criarMarcadorUsuario(lat, lng, titulo="Marcador do Usuário") {
    const endereco = await obterEndereco(lat, lng);
    const linkWaze = `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`;
    
    const popupContent = `
      <b>${titulo}</b><br>
      ${endereco}<br>
      <a href="${linkWaze}" target="_blank">Abrir no Waze</a>
    `;
    
    L.marker([lat, lng]).addTo(map)
      .bindPopup(popupContent)
      .openPopup();
    
    salvarMarcador(lat, lng, titulo);
  }

  // ===== Inicializa Mapa =====
  const map = L.map("map").setView([0,0],15);
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
  if(navigator.geolocation){
    navigator.geolocation.watchPosition(pos=>{
      posicaoAtual = {lat: pos.coords.latitude, lng: pos.coords.longitude};
      marcadorUsuario.setLatLng([posicaoAtual.lat,posicaoAtual.lng]);
      if(primeiraLocalizacao){
        map.setView([posicaoAtual.lat,posicaoAtual.lng],18);
        primeiraLocalizacao=false;
      }
    }, err=>{
      console.error("Erro GPS:", err.message);
    }, {enableHighAccuracy:true});
  } else {
    console.error("GPS não disponível");
  }

  // ===== Botão centralizar =====
  const btnCentralizar = document.getElementById("btnCentralizar");
  btnCentralizar.onclick = ()=>{
    if(posicaoAtual){
      map.setView([posicaoAtual.lat,posicaoAtual.lng],18);
    } else {
      alert("Localização não disponível ainda.");
    }
  };

  // ===== Botão adicionar marcador na posição atual =====
  const btnAdicionarMarcador = document.getElementById("btnAdicionarMarcador");
  btnAdicionarMarcador.onclick = ()=>{
    if(posicaoAtual){
      const {lat, lng} = posicaoAtual;
      criarMarcadorUsuario(lat, lng);
    } else {
      alert("Localização não disponível ainda.");
    }
  };

  // ===== Carrega marcadores salvos do Firebase =====
  async function carregarMarcadores() {
    try {
      const querySnapshot = await getDocs(collection(db, colecaoMarcadores));
      for (const doc of querySnapshot.docs) {
        const data = doc.data();
        const endereco = await obterEndereco(data.latitude, data.longitude);
        const linkWaze = `https://waze.com/ul?ll=${data.latitude},${data.longitude}&navigate=yes`;
        const popupContent = `
          <b>${data.titulo}</b><br>
          ${endereco}<br>
          <a href="${linkWaze}" target="_blank">Abrir no Waze</a>
        `;
        L.marker([data.latitude, data.longitude])
          .addTo(map)
          .bindPopup(popupContent);
      }
    } catch (error) {
      console.error("Erro ao carregar marcadores:", error);
    }
  }

  // ===== Inicializa carregamento =====
  carregarMarcadores();

}; // fim window.onload
