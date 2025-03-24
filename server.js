const express=require("express")
const jwt=require("jsonwebtoken")
const sqlite3=require("sqlite3")
const cors=require("cors")  
const Database = require('better-sqlite3');



require("dotenv").config({ path: "./.env" });
const app=express();
const PORT=process.env.PORT || 5000;
const SECRET_KEY = process.env.SECRET_KEY || "default_secret_key";

app.use(express.json())
app.use(cors({ origin: "http://localhost:3000", credentials: true }))

//initialize DB and Server
const path = require("path");
const db = new Database(path.join(__dirname, "database.db"));

console.log("Connected to DB");

//Create user Table

db.exec(`CREATE TABLE IF NOT EXISTS users(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT
)`);
//Insert default user(sudheer,sudheer@123)
db.prepare(`INSERT OR IGNORE INTO users(username,password) VALUES (?, ?)`)
  .run("sudheer", "sudheer@123");


//Login APi
app.post("/login", (req, res) => {
    const { username, password } = req.body;

    const user = db.prepare(`SELECT * FROM users WHERE username = ?`).get(username);

    if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid Credentials" });
    }

    const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: "1d" });
    res.json({ token });
});


//Middleware to verify jwt token
const verifyToken=(req,res,next)=>{
    const token=req.headers['authorization'];
    if(!token){
        return res.status(403).json({message:'User not logged in'});
    }
    jwt.verify(token,SECRET_KEY,(err,decoded)=>{
        if(err){
            return res.status(401).json({message:'unauthorized'});
        }
        req.user=decoded;
        next();
    });
};

//Protected DashboardAPI
app.get("/dashboard",verifyToken,(req,res)=>{
    res.json({message:'Dashboard'});
});

//Protected Map API
app.get("/map",verifyToken,(req,res)=>{
    res.json({message:'Map'});
})

app.listen(PORT,()=>console.log(`server running at port ${PORT}`));