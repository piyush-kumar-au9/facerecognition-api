const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const saltRounds = 10;

const app = express();

app.use(express.json());
app.use(cors());

const database = {
    users:[
        {
            id:1,
            name:'piyush', 
            email:'piyush@gmail.com',
            password:'truffle',
            entries:0,
            time: new Date()

        }
    ]
};
app.get('/', (req, res) =>{
    res.json(database.users);
})

app.post('/signin', (req, res)=>{
    const {email, password} = req.body;
    if(database.users[0].email===email && database.users[0].password===password){
        res.json(database.users[0]);
    }
    else{
        res.status(400).json("User not found");
    }
    
})

app.post('/register', (req, res)=>{
    const {name, email, password} = req.body;
    bcrypt.hash(password, saltRounds, function(err, hash) {
        console.log(hash);
    });
    database.users.push(        
    {
        id:2,
        name:name, 
        email:email,
        password:password,
        entries:0,
        time: new Date()

    })
    res.json(database.users[database.users.length - 1]);
})

app.get('/profile/:id', (req, res) => {
    const {id} = req.params;
    let flag = false;
    database.users.forEach(user => {
        if(user.id === Number(id)){
            flag = true;
            return res.json(user);
        }
    })
    if(!flag){
        res.status(400).json("User not found!!!");
    }
})

app.put('/image', (req, res) => {
    const {id} = req.body;
    let flag = false;
    database.users.forEach(user => {
        if(user.id === id){
            flag = true;
            user.entries++
            return res.json(user.entries);
        }
    })
    if(!flag){
        res.status(400).json("User not found!!!");
    }
})

app.listen(5000, ()=>{
    console.log("Server started at port 5000");
})