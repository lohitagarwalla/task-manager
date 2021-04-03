const express = require('express')
const Task = require('./models/tasks')
require('./db/mongoose')
const User = require('./models/users')
const userRouter = require('./routes/userRoute')
const taskRouter = require('./routes/taskRouter')


const app = express()
const port = process.env.PORT


app.use(express.json())     // to convert to json format the data that we receive from http request
app.use(userRouter)
app.use(taskRouter)
//Tradition way using promises (then and catch)

// app.get('/tasks', (req, res) => {
//     Task.find({}).then((user)=>{
//         if(!user) return res.send('Task list is empty')
//         res.send(user)
//     }).catch((e)=>{
//         res.status(500).send(e)
//     })

// })



// Better way by using async and await


app.listen(port, () => {
    console.log('Task page is loaded on port ' + port)
})



