import express from 'express'
import morgan from 'morgan'
import cors from 'cors'
import mongoose from 'mongoose'

const url = 'mongodb+srv://petarlecic:EMGkLhc0ci2Epc8p@cluster0.yhahu.mongodb.net/Connect4?retryWrites=true&w=majority'
mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true })

const userSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    username: String,
    email: String,
    password: String,
    score: {
        played: Number,
        won: Number,
        lost: Number
    }
})

const User = mongoose.model('User', userSchema)

// const defaultEndpoint = (_, res) => {
//     res.status(404).end()
// }

const server = express()
server.use(express.json())
server.use(morgan('dev'))
server.use(cors())

server.get('/users', (_, res) => {
    User.find({}).then(result => {
        res.json(result)
    })
})

server.post('/register', (req, res) => {
    User.findOne({username: req.body.username}).then(result => {
        if (result) res.json('Username is already taken')
        else {
            User.findOne({email: req.body.email}).then(result => {
                if (result) res.json('Account with that email already exists')
                else {
                    const newUser = new User({...req.body})
                    newUser.score = {
                        played: 0,
                        won: 0,
                        lost: 0
                    }
                    newUser.save()
            
                    res.json(newUser)
                }
            })
        }
        })
})

server.post('/login', (req, res) => {
    User.findOne({$and: [{username: req.body.username}, {password: req.body.password}]})
    .then(result => {
        res.json(result)
    })
    // const loginUser = users.find(user => user.username === req.body.username && user.password === req.body.password)

    // loginUser ? res.json(loginUser) : res.json(null)
})

server.delete('/users/:id', (req, res) => {
    const userId = req.params.id
    users = [...users.filter(user => user.id != userId)]
    res.satus(200).end()
})

server.patch('/users', (req, res) => {
    const user = users.find(user => user.username === req.body.username)
    user.score.played++
    if (req.body.didWin) {
        user.score.won++
        res.json(user.score.won)
    }
    else {
        user.score.lost++
        res.json(user.score.lost)
    }
})

//defaultEndpoint

const PORT = 3001
server.listen(PORT, () => console.log(`Server is running at: http://localhost:${PORT}`))

// function isValid(request) {
//     // User.findOne({username: request.username})
//     //     .then(result => {
//     //         if (result) return -1
//     //     }).then(() => {
//     //         User.findOne({email: request.email}).then(result => {
//     //             if (result) return -2
//     //             return true
//     //         })
//     //     })
//     // if (User.findOne({username: request.username})) return -1
//     // if (User.findOne({email: request.email})) return -2
//     // return true
// }