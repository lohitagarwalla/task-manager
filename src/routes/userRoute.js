const express = require('express')
const User = require('../models/users')
const router = express.Router()
const auth = require('../middleware/auth')
const multer = require('multer')
const sharp = require('sharp')
const {sendWelcomeMail} = require('./../emails/contacts')

// we can write something in url to get it in request. for example: /users/:some_name and then some_name can be used later. 
router.get('/users/me', auth, async (req, res) => {  //first it will run auth and if next is called then int will call the function in this block
    try {
        res.send(req.user.getPublicProfile())
    } catch (e) {
        res.status(500).send(e)
    }
})


// router.get('/users/:id', async (req, res) => {  
//     const _id = req.params.id

//     try{
//         const user = await User.findById(_id)
//         if (!user) {
//             return res.status(404).send()
//         }
//         res.send(user)
//     }catch(e) {
//         res.send(e)
//     }
// })

//to create a new user
router.post('/users', async (req, res) => { // post is used to create a new document in database
    const user = new User(req.body);
    try {
        const savedUser = await user.save()
        const token = await savedUser.generateAuthToken()
        sendWelcomeMail(user.email, user.name)
        res.status(201).send({ savedUser, token })
    } catch (e) {
        res.status(401) // to change status code
        res.send(e)  //these two lines can be written as: res.status(400).send(e)
    }
})

// to login a user
router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.send({ user: user.getPublicProfile(), token: token })
    } catch (e) {
        res.status(400).send('some error occured')
    }
})


// to logout current user from current device
router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token != req.token
        })
        await req.user.save()
        res.send('User successfully logged out')
    } catch (e) {
        res.status(500).send('Error in loging out')
    }
})

// to logout current user from all device
router.post('/users/logout/all', auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        res.send('User successfully logged out')
    } catch (e) {
        res.status(500).send('Error in loging out')
    }
})

//patch is used to update database
// to update current users details.
router.patch('/users/updateme', auth, async (req, res) => {
    const updateKeys = Object.keys(req.body)
    const allowedKeys = ['name', 'age', 'email', 'password']
    const isValid = updateKeys.every((update) => allowedKeys.includes(update))

    if (!isValid) {
        return res.status(400).send('Please insert correct update keys')
    }

    try {

        // const user = await User.findByIdAndUpdate(req.user._id, req.body, {new: true, runValidators: true})   //this is one way of doing
        updateKeys.forEach((update) => req.user[update] = req.body[update])
        await req.user.save()
        res.send(req.user.getPublicProfile())
    } catch (e) {
        res.status(500).send(e)
    }
})

// to delete current user
router.delete('/users/me', auth, async (req, res) => {

    try {
        // const user = await User.findByIdAndDelete(req.params.id)
        // if(!user) {
        //     return res.status(400).send('No user with given id')
        // }

        await req.user.remove()
        res.send(req.user.getPublicProfile())
    } catch (e) {
        res.status(400).send('error', e)
    }

})

// multer us used to upload file to database
const upload = multer({
    //dest: 'image',     // if we add this line then multer will save the binary file in task-manager other wise multer will pass the binary data to us to handle it
    limits: {
        fileSize: 2000000 // always in bytes
    },
    fileFilter(req, file, cb) {
        // if(!file.originalname.endsWith('.pdf')){
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {    //visit https://regex101.com/ to learn about regular expressions
            return cb(new Error('Upload a image file'))
        }

        cb(undefined, true)

        // cb(new Error('Upload a PDF file'))
        // cb(undefined, true)
        // cb (undefined, false)
    }
})


// upload a avatar or profile picture
router.post('/users/me/avatar', auth, upload.single('uploadit'), async (req, res) => {
    const buffer = await sharp(req.user.avatar).resize({width: 250, height: 250}).png().toBuffer()   //converting any type of image to png using sharp. We are using await because sharp is asynchronous
    
    req.user.avatar = buffer   // req.file.buffer is only available when "dest" is not defined in multer object 
    await req.user.save()
    res.send()
}, (error, req, res, next) => {  // adding another function to handle erros from upload.single()
    res.status(400).send({ error: error.message })
})

// delete current avatar
router.delete('/users/me/deleteavatar', auth, async (req, res) => {
    try {
        req.user.avatar = undefined
        await req.user.save()

    } catch (e) {
        res.status(500).send('error in deleting avatar')
    }
})


//to fetch image by user id
router.get('/users/:id/avatar', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
        
        if(!user || ! user.avatar) {
            throw new Error()
        } 

        // res.set('Content-Type', 'application/json')  //this is done by default by express. But since here we are not sending json data, we need to configure by ourselves
        res.set('Content-Type', 'image/png')  // we need to specify this because it is not json data. For json data express handless it by its own
        res.send(user.avatar)
    } catch (e) {
        res.status(500).send()
    }
})

// router.patch('/users/:id', auth, async (req, res)=> {   // patch is used to update a already existing document in database
//     const updates = Object.keys(req.body)
//     const allowedUpdates = ['name', 'email', 'password', 'age']
//     const isValidOperation = updates.every((update)=>allowedUpdates.includes(update))
//     if(!isValidOperation) {
//         return res.status(400).send({error: 'Invalid updates!'})
//     }

//     try{
//         const user = await User.findById(req.params.id)
//         updates.forEach((update) => user[update] = req.body[update]);  // we use bracket notation because value of update is dynamic and it is going to change
//         await user.save()

//         //const user = await User.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true})
//         if(!user) {
//             return res.status(401).send('No user with given _id')
//         }
//         res.send(user)
//     } catch (e) {
//         res.status(500).send(e)
//     }
// })

module.exports = router