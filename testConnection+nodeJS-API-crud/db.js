
// Importa il modulo MongoClient dalla libreria mongodb
const { MongoClient } = require('mongodb');

// Variabile per memorizzare la connessione al database
let dbConnection;

// Esporta un oggetto contenente le funzioni per connettersi al database e ottenere la connessione
module.exports = {
    // Funzione per connettersi al database
    connectToDb: (cb) => {
        // Connessione al database MongoDB
        MongoClient.connect('mongodb://localhost:27017/bookstore')
            .then((client) => {
                // Memorizza la connessione al database
                dbConnection = client.db();
                // Qui c'era un errore: doveva essere chiamato cb() per eseguire il callback
                return cb(); // Correzione: chiamare il callback
            })
            .catch(err => {
                // Stampa l'errore nella console
                console.log(err);
                // Esegui il callback con l'errore
                return cb(err);
            });
    },
    // Funzione per ottenere la connessione al database
    getDb: () => dbConnection
};
