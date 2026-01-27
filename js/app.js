import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

// Configurações do Firebase
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

// Função para mostrar mensagem
function mostrarMensagem(texto){
  const div = document.getElementById("mensagens");
  div.innerText = texto;
  setTimeout(()=>{ div.innerText=""; },4000);
}

// Função para salvar vaga
async function salvarVaga(){
  const numero = document.getElementById("numero").value;
  if(!numero){
    mostrarMensagem("Digite o número do local");
    return;
  }

  mostrarMensagem("Buscando localização...");
  if(!navigator.geolocation){
    mostrarMensagem("GPS não disponível");
    return;
  }

  navigator.geolocation.getCurrentPosition(async (pos)=>{
    const lat = pos.coords.latitude;
    const lng = pos.coords.longitude;

    try{
      const docRef = await addDoc(collection(db, "teste"), {
        numero,
        latitude: lat,
        longitude: lng,
        status: "pendente",
        confirmations: 1,
        data: new Date()
      });

      console.log("Documento criado com ID:", docRef.id);
      mostrarMensagem("Local registrado com sucesso!");
      document.getElementById("numero").value = "";

    }catch(err){
      console.error("Erro ao salvar no Firebase:", err);
      mostrarMensagem("Erro ao salvar: "+err.message);
    }

  },
  (err)=>{
    mostrarMensagem("Erro GPS: "+err.message);
  },
  { enableHighAccuracy:true });
}

// Adiciona evento ao botão
document.getElementById("btnSalvar").addEventListener("click", salvarVaga);
