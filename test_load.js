const WebSocket = require('ws');

const SERVER_URL = 'ws://localhost:8080'; // Adresse de ton serveur WebSocket
const TOTAL_CONNECTIONS = 1000; // Nombre de connexions à tester
const clients = [];
let connectedClients = 0;
let successfulMessages = 0;

console.log(`🔍 Test de charge : Connexion de ${TOTAL_CONNECTIONS} clients WebSocket...`);

for (let i = 0; i < TOTAL_CONNECTIONS; i++) {
    const ws = new WebSocket(SERVER_URL);

    ws.on('open', () => {
        connectedClients++;
        console.log(`✅ Client ${connectedClients}/${TOTAL_CONNECTIONS} connecté`);
        ws.send(JSON.stringify({ type: "guess", player: `Bot_${i}`, number: Math.floor(Math.random() * 100) + 1 }));
    });

    ws.on('message', (message) => {
        successfulMessages++;
        console.log(`📩 Message reçu (${successfulMessages}) : ${message}`);
    });

    ws.on('error', (err) => {
        console.error(`❌ Erreur sur client ${i}:`, err.message);
    });

    ws.on('close', () => {
        console.log(`🔴 Client ${i} déconnecté`);
    });

    clients.push(ws);
}

// Vérifier les connexions après 10 secondes
setTimeout(() => {
    console.log(`📊 Résumé du test :`);
    console.log(`✅ Connexions établies : ${connectedClients}`);
    console.log(`📩 Messages reçus : ${successfulMessages}`);
    console.log(`🚪 Fermeture de toutes les connexions...`);
    
    clients.forEach(client => client.close());
    process.exit(0);
}, 10000);
