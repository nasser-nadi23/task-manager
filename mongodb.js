// CRUD create read update delete

const {MongoClient, ObjectID} = require('mongodb')

// const id=new ObjectID()
// console.log(id.id.length)
// console.log(id.toHexString().length)

const connectionURL = 'mongodb://127.0.0.1:27017'
const databaseName = 'task-manager'

MongoClient.connect(connectionURL, {useNewUrlParser: true}, (error, client) => {
    if (error) {
        return console.log('Unable to connect to the database...')
    }

    const db = client.db(databaseName)
    // db.collection('users').deleteMany({age: 27}).then((result) => {
    //     console.log(result)
    // }).catch((error) => {
    //     console.log(error)
    // })
    db.collection('tasks').deleteOne({description: 'Play FIFA 22'}).then(result => {
        console.log(result)
    }).catch(error => {
        console.log(error)
    })
})