window.onload = function () {

  /* ===== FIREBASE ===== */
  firebase.initializeApp({
    apiKey: "AIzaSyByYEISjGfRIh7Xxx5j7rtJ7Fm_nmMTgRk",
    authDomain: "vpm2026-8167b.firebaseapp.com",
    projectId: "vpm2026-8167b",
    storageBucket: "vpm2026-8167b.appspot.com",
    messagingSenderId: "129557498750",
    appId: "1:129557498750:web:c2a510c04946583a17412f"
  });

  var db = firebase.firestore();

  function mostrarMensagem(msg) {
    var div = document.getElementById("mensagens");
    div.innerText = msg;
    setTimeout(function () { div.innerText = ""; }, 3000);
  }

  /* ===== MAPA ===== */
  var map = L.map("map").setView([-23.5505, -46.6333], 15);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap"
  }).addTo(map);

  /* ===== ÍCONE USUÁRIO ===== */
  var iconeUsuario = L.divIcon({
    className: "",
    html: '<div style="width:16px;height:16px;background:#007bff;border:3px solid white;border-radius:50%;box-shadow:0 0 6px rgba(0,123,255,.8);"></div>',
    iconSize: [16,16],
    iconAnchor: [8,8]
  });

  var marcadorUsuario = L.marker([0,0], {icon: iconeUsuario}).addTo(map);

  var primeiraLocalizacao = true;

  navigator.geolocation.watchPosition(
    function(pos){
      var lat = pos.coords.latitude;
      var lng = pos.coords.longitude;

      marcadorUsuario.setLatLng([lat,lng]);

      if(primeiraLocalizacao){
        map.setView([lat,lng],18);
        primeiraLocalizacao = false;
      }
    },
    function(){
      mostrarMensagem("Erro GPS");
    },
    {enableHighAccuracy:true}
  );

  /* ===== BOTÃO LOCALIZAR ===== */
  document.getElementById("btnLocalizacao").onclick = function(){
    navigator.geolocation.getCurrentPosition(function(pos){
      map.setView([pos.coords.latitude, pos.coords.longitude],18);
    });
  };

  /* ===== PESQUISA ===== */
  document.getElementById("btnBuscar").onclick = function(){
    var q = document.getElementById("search").value;
    if(!q) return;

    fetch("https://nominatim.openstreetmap.org/search?format=json&q=" + encodeURIComponent(q))
      .then(res => res.json())
      .then(data => {
        if(data[0]){
          map.setView([data[0].lat, data[0].lon],18);
        }
      });
  };

  /* ===== SALVAR VAGA ===== */
  document.getElementById("btnSalvar").onclick = function(){
    var numero = document.getElementById("numero").value;
    if(!numero) return mostrarMensagem("Digite o número");

    navigator.geolocation.getCurrentPosition(function(pos){
      db.collection("teste").add({
        numero: numero,
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        status: "pendente",
        data: new Date()
      });
      mostrarMensagem("Vaga criada");
      document.getElementById("numero").value = "";
    });
  };

  /* ===== ÍCONE DO MARCADOR ===== */
  var iconeVaga = L.icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/854/854878.png", // ícone de placa de estacionamento
    iconSize: [35,35],
    iconAnchor: [17,35]
  });

  /* ===== MARCADORES ===== */
  var markers = {};

  db.collection("teste").onSnapshot(function(snapshot){
    snapshot.docChanges().forEach(function(change){
      var doc = change.doc;
      var v = doc.data();
      var id = doc.id;

      if(markers[id]) return; // já existe

      markers[id] = L.marker([v.latitude,v.longitude], {icon: iconeVaga})
        .addTo(map)
        .bindPopup("<b>Número:</b> " + v.numero + "<br>Status: " + v.status);
    });
  });

};
