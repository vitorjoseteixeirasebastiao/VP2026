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
  let primeiraLocalizacao = true;

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
    }
  };

};
