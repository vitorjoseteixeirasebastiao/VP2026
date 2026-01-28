document.addEventListener("DOMContentLoaded", () => {

  // ===== Mapa =====
  // Inicializa no Brasil antes do GPS
  const map = L.map("map").setView([-15,-55], 4);

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

  // ===== GPS =====
  if(navigator.geolocation){
    navigator.geolocation.watchPosition(pos => {
      posicaoAtual = {lat: pos.coords.latitude, lng: pos.coords.longitude};
      marcadorUsuario.setLatLng([posicaoAtual.lat,posicaoAtual.lng]);

      // Ajusta a primeira visualização
      if(map.getZoom() < 5){
        map.setView([posicaoAtual.lat,posicaoAtual.lng], 18);
      }
    }, err => {
      console.error("Erro GPS:", err.message);
      alert("Erro ao obter localização do GPS");
    }, {enableHighAccuracy: true});
  } else {
    alert("GPS não disponível");
  }

  // ===== Botão adicionar marcador =====
  const btnMarcador = document.getElementById("btnMarcador");
  btnMarcador.onclick = () => {
    if(!posicaoAtual){
      alert("Aguardando localização do GPS...");
      return;
    }
    L.marker([posicaoAtual.lat,posicaoAtual.lng])
     .addTo(map)
     .bindPopup("Marcador adicionado")
     .openPopup();
  };

});
