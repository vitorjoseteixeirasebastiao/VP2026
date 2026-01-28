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
  let posicaoAtual = null; // null até receber GPS real

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

  // ===== Botão adicionar marcador na posição atual =====
  const btn = document.getElementById("btnMarcador");
  btn.disabled = true; // desabilitado até receber posição

  const habilitarBotao = setInterval(()=>{
    if(posicaoAtual){
      btn.disabled = false;
      clearInterval(habilitarBotao);
    }
  }, 100);

  btn.onclick = ()=>{
    if(posicaoAtual){
      L.marker([posicaoAtual.lat, posicaoAtual.lng])
        .addTo(map)
        .bindPopup("Marcador na posição atual").openPopup();
    }
  }

};
