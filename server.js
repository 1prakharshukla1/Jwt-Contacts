require('dotenv').config()

const express = require('express');
const app = express();

const jwt = require('jsonwebtoken');
app.use(express.json())

var post = [
    {
        name:'Apoorv',
        regno:'19BCE1055'
    }
]

app.get("/post",authenticateToken,(req,res)=>{
    console.log(req.user);
    res.json(post.filter(post => post.name === req.user.name));
})

app.post('/login',(req,res)=>{
    const username = req.body.username;
    const user = {name:username};
    
    const accessToken = jwt.sign(user,process.env.ACCESS_TOKEN_SECRET)
    
    res.status(200).json({accessToken:accessToken})
})

function authenticateToken(req,res,next){
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    if(token==null){
        return res.sendStatus(401)
    }

    jwt.verify(token,process.env.ACCESS_TOKEN_SECRET, (err,user)=>{
        if(err) return res.sendStatus(403)
        req.user = user
        next()
    })
}

app.listen(4000,(req,res)=>{
    console.log("Server started");
})