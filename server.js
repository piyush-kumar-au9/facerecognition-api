const express = require('express');
const cors = require('cors');
const knex = require('knex');
const bcrypt = require('bcrypt');
const saltRounds = 10;


const db = knex({
    client: 'pg',
    connection : 'postgres://postgres:test@localhost/smart_brain'  
});

const app = express();

app.use(express.json());
app.use(cors());

app.get('/', (req, res) =>{
    res.json("Server is working");
})

app.post('/signin', (req, res)=>{
    const {email, password} = req.body;
    db('login').where('email', email)
    .then(data => {
        const isValid = bcrypt.compareSync(password, data[0].hash)
        if(isValid){
            return db('users')
            .where('email', email)
            .then(user => res.json(user[0]))
            .catch(err => res.status(400).json("Unable to get user"))
        }
        else{
            res.status(400).json("wrong credentials")
        }
    })
    .catch(err => res.status(400).json("wrong credentials"))
    
})

app.post('/register', (req, res)=>{
    const {name, email, password} = req.body;
    const hash = bcrypt.hashSync(password, saltRounds)

    // Adding transaction to avoid any data integrity in login table
    db.transaction(trx => {
        trx.insert({
            hash: hash,
            email: email 
        })
        .into('login')
        .returning('email')
        .then(loginEmail => {
            return trx('users')
            .returning('*')
            .insert(        
            {
                name:name, 
                email:loginEmail[0],
                joined: new Date()
        
            }
            )
            .then(user => {res.json(user[0])})
            .catch(err => {res.status(400).json("Unable to join")})
        })
        .then(trx.commit)
        .catch(trx.rollback)
    })
    .catch(err => res.status(400).json("Unable to register"))

    
})

app.get('/profile/:id', (req, res) => {
    const {id} = req.params;

    // this can be shortend to db('users')
    return db.select('*').from('users').where('id', id).then(user => {
        if(user.length){
            res.json(user[0])
        }
        else{
            res.status(400).json("Not found")
        }
    })
    .catch(err => res.status(400).json("error in finding the user"))
})

app.put('/image', (req, res) => {
    const {id} = req.body;
    return db('users')
    .where('id', id)
    .increment('entries', 1)
    .returning('entries')
    .then(entries => {
        res.json(entries[0]);
    })
    .catch(err => res.status(400).json("Not found"))
})

app.listen(5000, ()=>{
    console.log("Server started at port 5000");
})