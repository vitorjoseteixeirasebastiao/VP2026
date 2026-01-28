import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

/* ===== FIREBASE ===== */
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

/* ===== MENSAGENS ===== */
function mostrarMensagem(msg) {
  var div = document.getElementById("mensagens");
  if (!div) return;
  div.innerText = msg;
  setTimeout(function () {
    div.innerText = "";
  }, 3000);
}

/* ===== MAPA ===== */
var map = L.map("map").setView([-23.5505, -46.6333], 15);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap"
}).addTo(map);

/* ===== ÍCONE USUÁRIO ===== */
var iconeUsuario = L.divIcon({
  className: "",
  html:
    '<div style="width:16px;height:16px;background:#007bff;border:3px solid white;border-radius:50%;box-shadow:0 0 6px rgba(0,123,255,.8);"></div>',
  iconSize: [16, 16],
  iconAnchor: [8, 8]
});

var marcadorUsuario = L.marker([0, 0], { icon: iconeUsuario }).addTo(map);

/* ===== GPS ===== */
var primeiraLocalizacao = true;

navigator.geolocation.watchPosition(
  function (pos) {
    var lat = pos.coords.latitude;
    var lng = pos.coords.longitude;

    marcadorUsuario.setLatLng([lat, lng]);

    if (primeiraLocalizacao) {
      map.setView([lat, lng], 18);
      primeiraLocalizacao = false;
    }
  },
  function () {
    mostrarMensagem("Erro GPS");
  },
  { enableHighAccuracy: true }
);

/* ===== BOTÃO LOCALIZAÇÃO ===== */
var btnLocalizacao = document.getElementById("btnLocalizacao");
if (btnLocalizacao) {
  btnLocalizacao.onclick = function () {
    navigator.geolocation.getCurrentPosition(function (pos) {
      map.setView(
        [pos.coords.latitude, pos.coords.longitude],
        18
      );
    });
  };
}

/* ===== BUSCA ENDEREÇO ===== */
var btnBuscar = document.getElementById("btnBuscar");
if (btnBuscar) {
  btnBuscar.onclick = function () {
    var input = document.getElementById("search");
    if (!input || !input.value) return;

    fetch(
      "https://nominatim.openstreetmap.org/search?format=json&q=" +
        encodeURIComponent(input.value)
    )
      .then(function (res) {
        return res.json();
      })
      .then(function (data) {
        if (data[0]) {
          map.setView([data[0].lat, data[0].lon], 18);
        }
      });
  };
}

var btnLimpar = document.getElementById("btnLimpar");
if (btnLimpar) {
  btnLimpar.onclick = function () {
    document.getElementById("search").value = "";
  };
}

/* ===== SALVAR VAGA ===== */
var btnSalvar = document.getElementById("btnSalvar");
if (btnSalvar) {
  btnSalvar.onclick = function () {
    var numero = document.getElementById("numero").value;
    if (!numero) {
      mostrarMensagem("Digite o número");
      return;
    }

    navigator.geolocation.getCurrentPosition(function (pos) {
      addDoc(collection(db, "teste"), {
        numero: numero,
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        status: "pendente",
        confirmations: 1,
        data: new Date()
      });

      mostrarMensagem("Vaga criada");
      document.getElementById("numero").value = "";
    });
  };
}

/* ===== MARCADORES ===== */
var markers = {};

onSnapshot(collection(db, "teste"), function (snapshot) {
  snapshot.forEach(function (docSnap) {
    var v = docSnap.data();
    var id = docSnap.id;

    if (markers[id]) return;

    markers[id] = L.marker([v.latitude, v.longitude])
      .addTo(map)
      .bindPopup(
        "<p><b>Número:</b> " + v.numero + "</p>" +
        "<p>Status: " + v.status + "</p>"
      );
  });
});
