const WebSocket = require('ws'); // Importation de la bibliothèque WebSocket

const server = new WebSocket.Server({ port: 8080 }); // Création du serveur WebSocket sur le port 8080

let secretNumber = Math.floor(Math.random() * 100) + 1; // Nombre secret initial entre 1 et 100
let players = []; // Liste des sockets des joueurs connectés

console.log("🎮 Serveur WebSocket démarré sur ws://gamebackend-render.onrender.com");
console.log(`🤫 Nombre secret généré : ${secretNumber}`);

server.on('connection', socket => {
    console.log("👤 Un joueur s'est connecté !");
    players.push(socket); // Ajouter le joueur à la liste

    socket.on('message', message => {
        let data = JSON.parse(message);

        if (data.type === "guess") {
            let guess = parseInt(data.number);
            let response = { type: "hint" };

            if (guess === secretNumber) {
                const serverTime = Date.now();
                response = {
                    type: "win",
                    winner: data.player,
                    countdownStart: serverTime + 3000 // 3 secondes plus tard
                };

                console.log(`🏆 Le joueur ${data.player} a trouvé le bon nombre : ${secretNumber}`);

                // Envoyer le message de victoire à tous les joueurs avec le temps de début du compte à rebours
                players.forEach(player => {
                    player.send(JSON.stringify(response));
                });

                // Attendre 3 secondes avant de lancer une nouvelle partie
                setTimeout(() => {
                    secretNumber = Math.floor(Math.random() * 100) + 1;
                    console.log(`🔄 Nouveau nombre secret généré : ${secretNumber}`);

                    players.forEach(player => {
                        player.send(JSON.stringify({ type: "new_game" }));
                    });
                }, 3000); // 3 secondes de pause
            } else if (guess < secretNumber) {
                response.message = "🔼 Trop petit ! Essayez un nombre plus grand.";
                socket.send(JSON.stringify(response));
            } else {
                response.message = "🔽 Trop grand ! Essayez un nombre plus petit.";
                socket.send(JSON.stringify(response));
            }
        }
    });

    socket.on('close', () => {
        players = players.filter(p => p !== socket);
        console.log("❌ Un joueur s'est déconnecté.");
    });
});
