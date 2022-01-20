const express = require('express')
const Task = require('../models/task')
const auth = require('../middleware/auth')
const router = new express.Router()

// Create a task
router.post('/tasks', auth, async (req, res) => {
    const task = new Task({
        ...req.body,
        owner: req.user._id
    })

    try {
        await task.save()
        res.status(201).send(task)
    } catch (error) {
        res.status(400).send(error)
    }
})


// Read all tasks which is related to authenticated user -> GET /tasks
// Read completed tasks -> GET /tasks?completed=true
// Read incomplete tasks -> GET /tasks?completed=false
// Pagination -> GET /tasks?limit=10&skip=0
// Sorting -> GET /tasks?sortBy=createdAt:desc
router.get('/tasks', auth, async (req, res) => {
    const match = {}
    const sort = {}
    if (req.query.completed) {
        match.completed = req.query.completed === 'true'
    }

    if (req.query.sortBy) {
        const parameters = req.query.sortBy.split(':') // ['createdAt','desc']
        sort[parameters[0]] = parameters[1] === 'asc' ? 1 : -1  // createdAt:1
    }

    try {
        await req.user.populate({
            path: 'tasks',
            match: match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort: sort
            }
        }).execPopulate()
        res.send(req.user.tasks)
        // if (!req.query.completed) {
        //     const allTasks = await Task.find({owner: req.user._id})
        //     return res.send(allTasks)
        // } else {
        //     const tasks = await Task.find({owner: req.user._id, completed: req.query.completed==='true'})
        //     res.send(tasks)
        // }

    } catch (error) {
        res.status(500).send(error)
    }
})

// Read a task by id
router.get('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id
    try {
        const task = await Task.findOne({_id: _id, owner: req.user._id})
        if (!task) {
            return res.status(404).send({message: 'task not found'})
        }
        res.send(task)
    } catch (error) {
        res.status(500).send(error)
    }
})


// Update a task by his/her owner
router.patch('/tasks/:id', auth, async (req, res) => {
    const updates = Object.keys(req.body) // ["age"]
    const allowedUpdates = ['description', 'completed']
    const isValidOperation = updates.every((update) => {
        return allowedUpdates.includes(update)
    })

    if (!isValidOperation) {
        return res.status(400).send({message: 'invalid updates'})
    }


    try {
        const task = await Task.findOne({_id: req.params.id, owner: req.user._id})
        if (!task) {
            return res.status(404).send({message: 'task not found'})
        }
        updates.forEach((update) => {
            task[update] = req.body[update]
        })
        await task.save()
        // const task = await Task.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true})

        res.send(task)
    } catch (error) {
        res.status(400).send(error)
    }
})

// Delete a task by his/her owner
router.delete('/tasks/:id', auth, async (req, res) => {
    try {
        const task = await Task.findOneAndDelete({_id: req.params.id, owner: req.user._id})
        if (!task) {
            return res.status(404).send({message: 'task not found!'})
        }
        res.send(task)
    } catch (error) {
        res.status(500).send(error)
    }
})

module.exports = router