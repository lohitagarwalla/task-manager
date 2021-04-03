const mongoose = require('mongoose')
const validator = require('validator')

//  mongoose.connect('mongodb://127.0.0.1:27017/task-manager-api', {

mongoose.connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
})


// const task = new Task({
//     description: 'Learn node-js',
//     completed: false,
//     email: 'lohitagarwalla@gmail.com'
// })

// task.save().then(()=> {
//     console.log(task)
// }).catch((error)=>{
//     console.log('Error!', error)
// })



//data validation