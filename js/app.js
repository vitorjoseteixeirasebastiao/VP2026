window.onload = function() {

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

  // ===== Atualiza localização do usuário =====
  if(navigator.geolocation){
    navigator.geolocation.watchPosition(pos=>{
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;

      marcadorUsuario.setLatLng([lat,lng]);

      // centraliza mapa na primeira localização, depois navegação livre
      if(primeiraLocalizacao){
        map.setView([lat,lng],18);
        primeiraLocalizacao = false;
      }

    }, err=>{
      console.log("Erro GPS:", err.message);
    }, { enableHighAccuracy:true });
  } else {
    alert("GPS não disponível");
  }

};
