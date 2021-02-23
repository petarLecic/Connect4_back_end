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

const defaultEndpoint = (_, res) => {
    res.status(404).send('Not found')
}

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
})

server.delete('/users', (req, res) => {
    User.deleteOne({_id: req.body._id}).then(result => {
        res.json(result.deletedCount) // if deleted returns 1
    })
})

server.patch('/users', (req, res) => {
    const user = req.body.user
    const didWin = req.body.didWin
    User.findOne({_id: user._id}).then(result => {
        result.score.played++
        didWin ? result.score.won++ : result.score.lost++

        result.save()
        res.json(result)
    })
})

server.use(defaultEndpoint)

const PORT = 3001
server.listen(PORT, () => console.log(`Server is running at: http://localhost:${PORT}`))