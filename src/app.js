const express = require('express')
require('./db/mongoose')
const userRouter = require('./routes/userRoute')
const taskRouter = require('./routes/taskRouter')


const app = express()



app.use(express.json())     // to convert to json format the data that we receive from http request
app.use(userRouter)
app.use(taskRouter)

module.exports = app


