const connectToMongo = require('./db');

connectToMongo();

const express = require('express')
const app = express()
const port = 5000;
const cors = require('cors');


// If you want to use req.body you have to use middle-ware here:
app.use(cors());
app.use(express.json());

// Available Routes:
app.use('/api/auth',require('./routes/auth'));
app.use('/api/notes',require('./routes/notes'));



app.listen(port, () => {
    console.log(`Example app listening on port ${port} and you can connect using http://localhost:27017/api/auth`)
})

