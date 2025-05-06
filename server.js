const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });
let secretNumber = generateNumber();

function generateNumber() {
  return Math.floor(Math.random() * 100) + 1;
}

function broadcast(data) {
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}

wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    const data = JSON.parse(message);
    
    if (data.type === 'guess') {
      if (data.number === secretNumber) {
        broadcast({
          type: 'win',
          winner: data.player,
        });

        // 🔁 Nouveau nombre secret
        secretNumber = generateNumber();

        // Informer les joueurs que la partie recommence
        broadcast({ type: 'new_game' });
      } else {
        const hint = data.number < secretNumber ? 'Trop petit' : 'Trop grand';
        ws.send(JSON.stringify({
          type: 'hint',
          message: hint,
        }));
      }
    }
  });
});
