// Inicializa o mapa (posição neutra inicial)
const map = L.map("map").setView([-23.5505, -46.6333], 16);

// Camada do mapa
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap"
}).addTo(map);

// 🔵 Ícone do usuário (circleMarker = nunca falha)
const userMarker = L.circleMarker([0, 0], {
  radius: 8,
  fillColor: "#1e88e5",
  color: "#ffffff",
  weight: 3,
  fillOpacity: 1
}).addTo(map);

let primeiraCentralizacao = true;

// Localização em tempo real
if (navigator.geolocation) {
  navigator.geolocation.watchPosition(
    pos => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;

      userMarker.setLatLng([lat, lng]);

      // Centraliza SOMENTE na primeira vez
      if (primeiraCentralizacao) {
        map.setView([lat, lng], 18);
        primeiraCentralizacao = false;
      }
    },
    err => {
      console.error("Erro GPS:", err.message);
    },
    { enableHighAccuracy: true }
  );
}
