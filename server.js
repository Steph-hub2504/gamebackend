const WebSocket = require('ws');
const admin = require('firebase-admin');
const express = require('express');
const http = require('http');
const app = express();

// 🔐 Sécuriser le chargement du JSON des identifiants Firebase
let serviceAccount;
try {
  if (!process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
    throw new Error("La variable d'environnement GOOGLE_APPLICATION_CREDENTIALS_JSON est absente.");
  }
  serviceAccount = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
} catch (error) {
  console.error("❌ Erreur lors du chargement de la configuration Firebase :", error.message);
  process.exit(1); // Quitte proprement l'application
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const firestore = admin.firestore();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let secretNumber = Math.floor(Math.random() * 100) + 1;
let players = [];

console.log("🎮 Serveur WebSocket démarré");
console.log(`🤫 Nombre secret : ${secretNumber}`);

function broadcast(data) {
  players.forEach(player => {
    if (player.readyState === WebSocket.OPEN) {
      player.send(JSON.stringify(data));
    }
  });
}

async function updateGameStatus(status) {
  try {
    await firestore.collection("statut_50").doc("m1Xyo8eh9FXAsbGgEgf8").set({
      valeur_statut: status
    }, { merge: true });
    console.log(`📝 Firestore mis à jour : statut = ${status}`);
  } catch (error) {
    console.error("🔥 Erreur mise à jour Firestore :", error);
  }
}

wss.on('connection', socket => {
  console.log("👤 Un joueur connecté");
  players.push(socket);

  socket.on('message', async message => {
    const data = JSON.parse(message);

    if (data.type === "guess") {
      const guess = parseInt(data.number);
      let response = { type: "hint" };

      if (guess === secretNumber) {
        console.log(`🏆 Victoire de ${data.player} avec le nombre ${secretNumber}`);

        response = { type: "win", winner: data.player };

        await updateGameStatus("enattente");
        broadcast(response);

        const delay = 10000;
        const now = Date.now();
        const startAt = now + delay;

        setTimeout(async () => {
          secretNumber = Math.floor(Math.random() * 100) + 1;
          console.log(`🔄 Nouveau nombre secret : ${secretNumber}`);

          await updateGameStatus("encours");

          broadcast({
            type: "new_game",
            startAt: startAt,
            serverTime: now
          });
        }, delay);
      } else if (guess < secretNumber) {
        response.message = "🔼 Trop petit !";
        socket.send(JSON.stringify(response));
      } else {
        response.message = "🔽 Trop grand !";
        socket.send(JSON.stringify(response));
      }
    }
  });

  socket.on('close', () => {
    players = players.filter(p => p !== socket);
    console.log("❌ Un joueur s'est déconnecté.");
  });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`🚀 Serveur WebSocket/HTTP actif sur le port ${PORT}`);
});
