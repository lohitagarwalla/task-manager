const validator = require('validator')
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const uniquevalidator = require('mongoose-unique-validator')
const jwt = require('jsonwebtoken')
const Task = require('./tasks')

// const { delete } = require('../routes/userRoute')

//creating middleware

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        require: true,
    },
    email: {
        type: String,
        unique: true,
        trim: true,    // removes extra spaces at start and end
        required: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Email is invalid')
            }
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 7,
        trim: true,
        validate(value) {
            if (value.toLowerCase().includes('password')) {
                throw new Error('Password cannot contain "Password"')
            }
        }
    },
    age: {
        type: Number,
        default: 0,
        validate(value) {
            if (value < 0) {
                throw new Error('Age must be a positive number')
            }
        }
    },
    tokens: [{
        token: {
            type: String,
            require: true
        }
    }],
    avatar: {
        type: Buffer
    }
}, {
    timestamps: true
})

//to create a virtual relationship between user and task. This wont be stored in database.
userSchema.virtual('mytasks', {
    ref: 'Task',
    localField: '_id',      // _id of user is same as Task.owner, this is done to set relationship between user and task
    foreignField: 'owner'
})


//method for individual instance
userSchema.methods.generateAuthToken = async function () {
    const user = this
    const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET)
    user.tokens = user.tokens.concat({ token })
    await user.save()
    return token
}

userSchema.methods.getPublicProfile = function () {
    const user = this
    // const userPublic = {
    //     name: user.name,
    //     age: user.age,
    //     email: user.email
    // }

    const userObject = user.toObject()

    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar

    return userObject
}

userSchema.plugin(uniquevalidator) // to make unique property work in email

//for using in User model
userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email })
    if (!user) {
        throw new Error('unable to login')
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
        throw new Error('unable to login')
    }

    return user;
}

userSchema.pre('save', async function (next) {
    const user = this
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }
    next()
})

userSchema.pre('remove', async function (next) {
    const user = this

    await Task.deleteMany({owner: user._id})

    next()
})



const User = mongoose.model('User', userSchema)

module.exports = User

// const task = new Task({
//    description: 'Learn node-js',
//    completed: false,
//    email: 'lohitagarwalla@gmail.com'
// })

// task.save().then(()=> {
//    console.log(task)
// }).catch((error)=>{
//    console.log('Error!', error)
// })
