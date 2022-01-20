const express = require('express')

require('./db/mongoose')
require('dotenv').config()
const userRouter = require('./routers/user')
const taskRouter = require('./routers/task')

const app = express()
const port = process.env.PORT

app.use(express.json())
app.use(userRouter)
app.use(taskRouter)

app.listen(port, () => {
    console.log(`Server is up on port ${port}`)
})

// const person={
//     name:'Nasser'
// }
//
// person.toJSON=function (){
//     // console.log(this)  // this refer to the person
//     // return this
//     return {}
// }
//
// console.log(JSON.stringify(person))

// const Task = require('./models/task')
// const User = require('./models/user')

// const main = async () => {
//     // const task = await Task.findById('61647559dc09f79142d52be9')
//     // // await task.populate('owner').execPopulate()
//     // console.log(task.owner)
//     // const user=await User.findById(task.owner)
//     // console.log(user)
//     const user=await User.findById('6164714b3c7bf0abe7094cfe')
//     await user.populate('tasks').execPopulate()
//     console.log(user.tasks)
// }
//
// main()



















