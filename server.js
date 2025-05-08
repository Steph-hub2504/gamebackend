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
                response = { type: "win", winner: data.player };
                console.log(`🏆 Le joueur ${data.player} a trouvé le bon nombre : ${secretNumber}`);

                // Envoyer le message de victoire à tous les joueurs
                players.forEach(player => {
                    player.send(JSON.stringify(response));
                });

                // Attendre 10 secondes avant de lancer une nouvelle partie
                setTimeout(() => {
                    secretNumber = Math.floor(Math.random() * 100) + 1;
                    console.log(`🔄 Nouveau nombre secret généré : ${secretNumber}`);

                    players.forEach(player => {
                        player.send(JSON.stringify({ type: "new_game" }));
                    });
                }, 10000); // 10 secondes de pause
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
