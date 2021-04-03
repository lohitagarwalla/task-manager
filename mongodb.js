const mongodb = require('mongodb')
const MongodbClient = mongodb.MongoClient
const ObjectID = mongodb.ObjectID
// const {MongodbClient, ObjectID} = require('mongodb')

const connectionURL = MONGODB_URL
const databaseName = 'task-manager'

const id = new ObjectID()
console.log(id)

MongodbClient.connect(connectionURL, { useNewUrlParser: true }, (error, client) => {
    if (error) {
        return console.log('Unable to connect')
    }

    const db = client.db(databaseName)

    // db.collection('users').insertOne({
    //     name: 'lohit agarwalla',
    //     age: 25
    // }, (error, result) => {
    //     if(error) {
    //         return console.log('Unable to insert')
    //     }

    //     console.log(result.ops)
    // })

    // const db = client.db(databaseName)
    // db.collection('task').insertMany([
    //     {
    //         taskToDo: 'Order walking stick',
    //         completed: false
    //     },
    //     {
    //         taskToDo: 'Buy a scooty',
    //         completed: false
    //     },
    //     {
    //         taskToDo: 'Learn Node-js',
    //         completed: false
    //     }
    // ], (error, result) => {
    //     if (error) {
    //         console.log('Unable to insert many')
    //     }

    //     console.log(result.ops)
    // })


    // db.collection('users').findOne({name: 'lohit agarwalla'}, (error, user) => {    // find with property
    //     if(error) {
    //         console.log('Error while find data')
    //     }

    //     console.log(user)
    // })

    // db.collection('users').findOne( {_id: new ObjectID("601577c2fea0ac249c64ba9c")}, (error, user) => { // find with id
    //     if(error) {
    //         console.log('Error while find data')
    //     }

    //     console.log(user)
    // })

    // db.collection('users').find({age: 25}).toArray((error, users) => {      //find many
    //     if(error) {
    //         console.log('Error while find data')
    //     }

    //     console.log(users)
    // })


    // const updatePromise = db.collection('users').updateOne({
    //     _id: new ObjectID("60157b11e95178424cff39bb")
    // }, {
    //     $set: {
    //         name: 'Rakesh Raman'
    //     }
    // })

    // updatePromise.then((success) => {
    //     console.log('name changed successfully')
    // }).catch((error) => {
    //     console.log('Error! couldnot update name')
    // })



    // db.collection('task').updateMany({
    //     completed: false
    // }, {
    //     $set: {
    //         completed: true
    //     }
    // }).then((success)=>{
    //     console.log('All documents updated successfully')
    // }).catch((error)=> {
    //     console.log('All documents updated failed')
    // })


    db.collection('task').deleteOne({
        _id: new ObjectID("6015aa151b0ae14a10da4606")
    }).then((success) => {
        console.log('document deleted successfully')
    }).catch((error) => {
        console.log('Error in delecting the document')
    })



})

