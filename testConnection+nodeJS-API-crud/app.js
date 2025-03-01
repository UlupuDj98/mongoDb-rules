// Importa il modulo 'express', che è un framework per costruire applicazioni web in Node.js
const express = require('express');
// Importa la funzione 'connectToDb' e 'getDb' dal modulo 'db'
const { connectToDb, getDb } = require('./db'); // Assicurati che getDb sia definito nel modulo db
const { ObjectId } = require('mongodb');


// Crea un'applicazione Express
const app = express();
app.use(express.json())

let db; // Variabile per memorizzare la connessione al database

// Connessione al database
connectToDb((err) => {
    if (!err) {
        // Avvia il server e ascolta sulla porta 3000
        app.listen(3000, () => {
            // Quando il server è in ascolto, stampa un messaggio nella console
            console.log('app listening on port 3000');
        });
        // Ottieni la connessione al database
        db = getDb(); 
    } else {
        // Gestione dell'errore di connessione al database
        console.error('Failed to connect to the database:', err);
    }
});

// Definisce le route dell'applicazione

//viene effettuata una richiesta GET all'endpoint '/books'
app.get('/books', (req, res) => {

    //current page
    const page = req.query.p || 0  // imposto page che corrispondera'a p all interno del path
    const booksPerPage = 3  //imposto il numero di libri per pagina che voglio visualizzare

    // Inizializza un array per memorizzare i libri
    let books = [];

    // Esegui la query per trovare i libri
    db.collection('books')
       .find()  
       .sort({ author: 1 }) // Ordina i risultati per autore in ordine crescente
       .skip(page * booksPerPage)
       .limit(booksPerPage)
       .toArray() // Correzione: usa toArray() per ottenere i risultati come array
       .then((results) => {
           // Aggiungi i risultati all'array books
           books = results; // Puoi assegnare direttamente i risultati a books
           res.status(200).json(books); // Invia i risultati come risposta JSON
       })
       .catch((err) => {
           console.error('Error fetching documents:', err); // Log dell'errore
           res.status(500).json({ error: 'Could not fetch the documents' }); // Risposta di errore
       });
});

//esempio di funzionamento della paginazione implementata con i metodi .skip() e  .limit()
//page = 0 e booksPerPage = 3
// 0 * 3  = salto 0 documenti e ne restituisco 3
// 1 * 3 = salto i primi 3 e restituisco i secondi 3 , e cosi' via

app.get('/books/:id', (req, res) => {
    // Controlla se l'ID fornito è valido
    if (ObjectId.isValid(req.params.id)) {
        // Usa db.collection() invece di db.connection()
        db.collection('books')
            .findOne({ _id: new ObjectId(req.params.id) }) // Trova il documento con l'ID specificato
            .then(doc => {
                if (doc) {
                    // Se il documento esiste, restituiscilo
                    res.status(200).json(doc);
                } else {
                    // Se il documento non esiste, restituisci un errore 404
                    res.status(404).json({ error: "Document not found" });
                }
            })
            .catch(err => {
                // Gestisci eventuali errori durante la ricerca
                console.error('Error fetching document:', err);
                res.status(500).json({ error: "Could not fetch the document" });
            });
    } else {
        // Se l'ID non è valido, restituisci un errore 400
        res.status(400).json({ error: 'Not a valid document id' });
    }
});

app.post('/books' , (req, res) => {
  const book = req.body
  //prepariamo la variabile che conterra' una body request
  db.collection('books') //selezione della collection
  .insertOne(book) //query di aggiunta del document
  .then(result => {
    res.status(201).json(result) //Esito positivo
  })
  .catch(err => {
    res.status(500).json({err : 'Could not create document'}) //esito negativo
  })
})

app.delete('/books/:id', (req, res) => {
    //controllo della validita' dell ID
    if (ObjectId.isValid(req.params.id)) {
        db.collection('books') //selezione della collection
            .deleteOne({ _id: new ObjectId(req.params.id) })
            .then(result => {
                if (result.deletedCount === 0) {
                    return res.status(404).json({ error: "Document not found" }); //caso in cui non viene trovata la risorsa
                }
                res.status(200).json({ message: "Document deleted successfully" }); // caso di successo
            })
            .catch(err => {
                res.status(500).json({ error: "Could not delete the document" }); //caso in cui non possiamo modificare il documento
            });
    } else {
        res.status(400).json({ error: 'Not a valid document id' }); //caso in cui inseriamo dati non validi
    }
});

app.patch('/books/:id' , (req,res) => {
    const update = req.body
    //preparo la variabile che conterra' la body request
    if (ObjectId.isValid(req.params.id)) {
        db.collection('books') //seleziono la collection
            .updateOne({ _id: new ObjectId(req.params.id)} , {$set: update }) //query di update
            .then(result => {
                res.status(200).json(result); //risposta in caso di successo
            })
            .catch(err => {
                res.status(500).json({ error: "Could not update the document" });
            });
    } else {
        res.status(400).json({ error: 'Not a valid document id' });
    }
    

})
