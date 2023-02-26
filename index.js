const express = require("express");
const app = express();
const port = 3000;
const database = require('./src/database/connection')

const userRoute = require('./src/routes/user');
const messageRoute = require('./src/routes/message');
const friendRoute = require('./src/routes/friend');

app.use(express.urlencoded({ extended: true }));
app.use(express.json())
app.use('/api', userRoute)
app.use('/api', messageRoute)
app.use('/api', friendRoute)

const initApp = async () => { 
    console.log("Testing database connection");
    try {
        await database.sync({force:true})
        await database.authenticate();
        console.log("Berhasil connect!");
        app.listen(port, () =>
            console.log(`Example app listening on port ${port}!`)
        );
    } catch (error) {
        console.error("Tidak bisa konek database : ", error.original);
    }
 }

 initApp()
