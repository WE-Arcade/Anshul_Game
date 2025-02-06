const express = require('express');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
const userRoutes = require("./routes/userRoutes"); 

const connectDB = require('./config/database'); 

dotenv.config();

//Connect to MongoDB
connectDB();


const app = express();

//Middleware
app.use(cors())
app.use(bodyParser.json())
app.use(morgan('dev')); //HTTP request logger middleware for Node.js(helps to debug and monitor the server)

//API Routes
app.get('/', (req, res) => {
    res.send('Welcome to the TalentBridge Backend!');
});

app.use("/api/users", userRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server runnning on ${PORT}`));
