 
const WebSocket = require('ws');//permet d'importer la bibliotheque du websocket

const server = new WebSocket.Server({ port: 8080 });//Crée un server qui écoute sur le port 8080

let secretNumber = Math.floor(Math.random() * 100) + 1;//génère un nombre secret entre 1 et 100
let players = [];//renger les utilisateurs connectés dans un tableau

console.log("🎮 Serveur WebSocket démarré sur ws://localhost:8080");
console.log(`🤫 Nombre secret généré : ${secretNumber}`);

server.on('connection', socket => { //Lorsqu'un client se connecte
    console.log("👤 Un joueur s'est connecté !");
    players.push(socket);//insertion du joueur connecté dans un club

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

                // Générer un nouveau nombre pour la prochaine partie
                secretNumber = Math.floor(Math.random() * 100) + 1;
                console.log(`🔄 Nouveau nombre secret généré : ${secretNumber}`);
                // Après avoir généré un nouveau nombre secret :
                players.forEach(player => {
                player.send(JSON.stringify({ type: "new_game" }));
              });
            } else if (guess < secretNumber) {
                response.message = "🔼 Trop petit ! Essayez un nombre plus grand.";
            } else {
                response.message = "🔽 Trop grand ! Essayez un nombre plus petit.";
            }

            // Envoyer la réponse uniquement au joueur qui a deviné
            socket.send(JSON.stringify(response));
        }
    });

    socket.on('close', () => {
        players = players.filter(p => p !== socket);
        console.log("❌ Un joueur s'est déconnecté.");
    });
});
