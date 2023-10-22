const connectToMongo = require('./db');

connectToMongo();

const express = require('express')
const app = express()
const port = 5000;


// If you want to use req.body you have to use middle-ware here:
app.use(express.json());

// Available Routes:
app.use('/api/auth',require('./routes/auth'));
app.use('/api/notes',require('./routes/notes'));



app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})

