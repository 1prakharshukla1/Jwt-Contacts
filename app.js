// +++++++++++++++++++++++++++++++++++++++++
//            Package Imports
// +++++++++++++++++++++++++++++++++++++++++
const express = require('express');
const app = express();

const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload')
const csv = require('csv-parser')
const fs = require('fs')

const NodeCache = require('node-cache')
const myCache = new NodeCache()
const bcrypt = require('bcrypt')

// +++++++++++++++++++++++++++++++++++++++++
//          Database Connection
// +++++++++++++++++++++++++++++++++++++++++
const connectDB = require('./config/db');
connectDB();


// +++++++++++++++++++++++++++++++++++++++++
//         Special variable imports
// +++++++++++++++++++++++++++++++++++++++++
const config=require('config');
const SECRET_KEY = config.get('SECRET_KEY');

app.use(express.json())
app.use(fileUpload({
    useTempFiles : true,
    tempFileDir : '/tmp/'
}));
app.set("view engine","ejs");

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.json({extended: false}));



// +++++++++++++++++++++++++++++++++++++++++
//            Model Imports
// +++++++++++++++++++++++++++++++++++++++++
const userModel = require('./models/user')
const contact = require('./models/contact')


// +++++++++++++++++++++++++++++++++++++++++
//             Middlewares
// +++++++++++++++++++++++++++++++++++++++++

// Authentication Middleware
const auth = (req,res,next)=>{
    try {
        let token = myCache.get('token')
        
        if(token!=null){
            let user = jwt.verify(token,SECRET_KEY);
            req.userId = user.id;
            next();
        }else{
            res.status(401).json({message:"Unathorized User 1"})
        }
    } catch (error) {
        console.log(error)
        res.status(401).json({message:"Unathorized User 2"});
    }
}

// +++++++++++++++++++++++++++++++++++++++++
//            Routes
// +++++++++++++++++++++++++++++++++++++++++

// Method GET
// Route /signup
// Desc  Displays the sign up page
app.get('/signup',(req,res)=>{
    res.render('signup')
})

// Method POST
// Route /signup
// Desc  Signs up the user
app.post('/signup',async (req,res)=>{
    const { username,email,password} = req.body;
    try {
        const existing = await userModel.findOne({email:email});
        if(existing){
            return res.status(400).json({message:"User already exists"});
        }

        const hashedPass = await bcrypt.hash(password,10);
        const result = await userModel.create({
            email:email,
            password:hashedPass,
            username:username
        })
        const token = jwt.sign({email:result.email,id:result._id},SECRET_KEY);
        // res.status(201).json({user:result,token:token})
        res.redirect('/signin')
    } catch (error) {
        res.status(500).json({message:"Something went wrong"});
    }
})

// Method GET
// Route /signin
// Desc  Displays the sign in page
app.get('/signin',(req,res)=>{
    res.render('signin');    
})

// Method POST
// Route /signin
// Desc  Signs in the user
app.post('/signin',async (req,res)=>{
    const {email,password} = req.body;
    
    try {
        const existing = await userModel.findOne({email})
        if(!existing){
            return res.status(404).json({message:"User not found"});
        }
        const matchPassword = await bcrypt.compare(password,existing.password)
        if(!matchPassword){
            return res.status(400).json({message:"Invalid credentials"});
        }
        const token = jwt.sign({email:existing.email,id:existing._id},SECRET_KEY);
        myCache.set('token',token)
        res.render('home')

    } catch (error) {
        res.status(404).json({message:"User not found"})
    }
})

// Method GET
// Route /signout
// Desc  Signs out the user
app.get('/signout',(req,res)=>{
    try {
        myCache.set('token',null);
        res.status(200).json({message:"Signed Out Successfully"});
    } catch (error) {
        console.log(error);
        res.status(200).json({message:"Error occurred"});
    }
})

// Method GET
// Route /upload
// Desc  Displays the page to upload contact
app.get('/upload',auth,(req,res)=>{
    res.render('upload');
})

// Method POST
// Route /upload
// Desc  Uploads the contact file and saves it in DB
app.post('/upload',auth,(req,res)=>{
    let token = myCache.get('token');
    let user = jwt.verify(token,SECRET_KEY);
    
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.');
    }
    let sampleFile = req.files.fileUpload;
    sampleFile.mv('./sampleFile.csv', async function(err) {
        if (err)
            return res.status(500).send(err);
        else{
            let people = [];
            fs.createReadStream('sampleFile.csv')
            .pipe(csv({}))
            .on('data',(data)=>people.push(data))
            .on('end',()=>{
                people.forEach(async (cont)=>{
                    let data = new contact({
                        name:cont.name,
                        phone:cont.phone,
                        email:cont.email,
                        linkedIn:cont.linkedIn,
                        user:user.id
                    })
                    await data.save();
                })
            })
            res.status(200).render('cont_saved');
        }
    });
})

// Method GET
// Route /show_contacts
// Desc  Displays all the contacts uploaded by the logged in user
app.get('/show_contacts',auth,async (req,res)=>{
    let token = myCache.get('token')
    
    let user = jwt.verify(token,SECRET_KEY);
    let id = user.id;

    const contacts = await contact.find({user:id});
    res.render('cont',{contacts});
})


// +++++++++++++++++++++++++++++++++++++++++
//           Starting the server
// +++++++++++++++++++++++++++++++++++++++++
app.listen(3000,(req,res)=>{
    console.log("Server started");
})