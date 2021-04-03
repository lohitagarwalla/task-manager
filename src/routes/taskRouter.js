const express = require('express')
const Task = require('../models/tasks')
const router = express.Router()
const auth = require('../middleware/auth')
const User = require('../models/users')


// GET /tasks?completed=true
// GET /tasks?limit=10&skip=20
//GET /tasks?sortBy=createdAt_asc 
router.get('/tasks', auth, async (req, res) => {
    
    const match = {}
    if(req.query.completed){
        match.completed = req.query.completed === 'true'
    }

    const sort = {} 
    if(req.body.sortBy){
        const parts = req.body.sortBy.split('_')
        sort[parts[0]] = parts[1] == 'asc' ? 1 : -1;  //1 for ascending and -1 for descending
    }

    try {
        // const tasks = await Task.find({owner: req.user._id})
        // if (!tasks) return res.send('Tasks list is empty')
        
        await req.user.populate({
            path: 'mytasks',
            match,
            options: {
                limit: parseInt(req.query.limit),       // parseint will convert string to int. If limit is not provided then mongoose will handle it and show all from database
                skip: parseInt(req.query.skip),
                sort
                // sort: {
                //     createdAt: 1        // 1 for ascending and -1 for descending
                // }
            }
        }).execPopulate()        
        res.send(req.user.mytasks)

    } catch (e) {
        res.status(500).send(e)
    }
})

router.get('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id
    try {
        const task = await Task.findOne({ _id, owner: req.user._id})

        if(!task) {
            res.status(404).send('no such task found')
        }

        res.send(task)
    } catch (e) {
        res.status(500).send('some error in getting task')
    }
})

router.post('/tasks/:completed', async (req, res) => {
    var done = req.params.completed
    done = done == 'true' ? true : false

    try {
        const tasks = await Task.find({})
        if (!tasks) return res.send('Task list is empty')
        var requestedTasks = tasks.filter((task) => task.completed == done)
        res.send(requestedTasks)
    } catch (e) {
        res.status(500).send(e)
    }
})

router.post('/tasks', auth, async (req, res) => {
    //const task = new Task(req.body)
    const task = new Task({
        ...req.body,        //es6 style. Adds all the property in req.body 
        owner: req.user._id
    })

    try {
        await task.save()
        res.status(201).send(task)
    } catch (e) {
        res.status(400).send(e)
    }
})

router.patch('/tasks/:id', auth,  async (req, res) => {
    const updateKeys = Object.keys(req.body)
    const allowedKeys = ['description', 'completed']
    const isValid = updateKeys.every((update)=>allowedKeys.includes(update))

    if(!isValid) {
        return res.status(400).send('Please insert correct update keys')
    }

    const _id = req.params.id

    try {
        // const task = await Task.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true})
        const task = await Task.findOne({ _id, owner: req.user._id})   
        
        if(!task) {
           return res.status(404).send('No user with given id')
        }

        updateKeys.forEach((update) => task[update] = req.body[update])

        await task.save()

        res.send(task)
    }catch (e) {
        res.status(500).send(e)
    }
})

router.delete('/tasks/:id', auth, async (req, res) => {   
    const _id = req.params.id
    
    try {
        // const user = await Task.findByIdAndDelete(req.params.id)
        const user = await Task.findOneAndDelete({ _id, owner: req.user._id})
        if(!user) {
            return res.send('No task with given id')
        }
        res.send(user)
    } catch (e) {
        res.status(500).send()
    }
})

module.exports = router