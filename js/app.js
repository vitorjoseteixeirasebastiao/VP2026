window.onload = function() {

  // ===== Mapa =====
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

  // ===== Watch position =====
  if(navigator.geolocation){
    navigator.geolocation.watchPosition(pos=>{
      posicaoAtual = {lat: pos.coords.latitude, lng: pos.coords.longitude};
      marcadorUsuario.setLatLng([posicaoAtual.lat,posicaoAtual.lng]);
      // Ajusta a primeira visualização
      if(map.getZoom() < 5){
        map.setView([posicaoAtual.lat,posicaoAtual.lng],18);
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
      alert("Aguardando localização do GPS...");
    }
  };

  // ===== Botão adicionar marcador =====
  const btnMarcador = document.getElementById("btnMarcador");
  btnMarcador.onclick = ()=>{
    if(!posicaoAtual){
      alert("Aguardando localização do GPS...");
      return;
    }
    // Adiciona marcador padrão Leaflet
    L.marker([posicaoAtual.lat,posicaoAtual.lng])
     .addTo(map)
     .bindPopup("Marcador adicionado").openPopup();
  };

};
