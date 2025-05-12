 const WebSocket = require('ws');

const server = new WebSocket.Server({ port: 8080 });
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

server.on('connection', socket => {
    console.log("👤 Un joueur s'est connecté !");
    players.push(socket);

    socket.on('message', message => {
        let data = JSON.parse(message);

        if (data.type === "guess") {
            let guess = parseInt(data.number);
            let response = { type: "hint" };

            if (guess === secretNumber) {
                response = { type: "win", winner: data.player };
                console.log(`🏆 Le joueur ${data.player} a gagné avec ${secretNumber}`);

                broadcast(response);

                const now = Date.now();
                const delay = 10000;
                const startAt = now + delay;

                setTimeout(() => {
                    secretNumber = Math.floor(Math.random() * 100) + 1;
                    console.log(`🔄 Nouveau nombre : ${secretNumber}`);

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
