const express = require('express')
const multer = require('multer')
const sharp = require('sharp')
const User = require('../models/user')
const auth = require('../middleware/auth')
const router = new express.Router()

// Signup
router.post('/users', async (req, res) => {
    const user = new User(req.body)
    try {
        await user.save()
        const token = await user.generateAuthToken()
        res.status(201).send({user: user.getPublicProfile(), token})

    } catch (error) {
        res.status(400).send(error)
    }
})

// Signin
router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.send({user: user.getPublicProfile(), token})
    } catch (error) {
        res.status(400).send({error: 'Unable to login!'})
    }
})

// Logout
router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })
        await req.user.save()
        res.status(200).send({message: 'Logout successfully.'})
    } catch (error) {
        res.status(500).send({error: 'Logout failed.'})
    }
})

// Logout from all devices
router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        res.status(200).send({message: 'You logout successfully from your all devices. '})
    } catch (error) {
        res.status(500).send({error: 'Logout failed.'})
    }
})


// For get profile informations(person which is authenticated)
router.get('/users/me', auth, async (req, res) => {
    res.send(req.user.getPublicProfile())
})


// Update My Profile
router.patch('/users/me', auth, async (req, res) => {
    const updates = Object.keys(req.body)  // ['height','average']
    const allowedUpdates = ['name', 'password', 'age', 'email']
    const isValidOperation = updates.every((update) => {
        return allowedUpdates.includes(update)
    })

    if (!isValidOperation) {
        return res.status(400).send({error: 'invalid request'})
    }

    try {
        updates.forEach((update) => {
            req.user[update] = req.body[update]
        })
        await req.user.save()

        res.send(req.user.getPublicProfile())
    } catch (error) {
        res.status(400).send(error)
    }
})

// Delete My Profile
router.delete('/users/me', auth, async (req, res) => {
    try {
        // const user = await User.findByIdAndDelete(req.user._id)
        // if (!user) {
        //     return res.status(404).send({message: 'user not found!'})
        // }
        await req.user.remove()
        res.send(req.user.getPublicProfile())
    } catch (error) {
        res.status(500).send(error)
    }
})

// Uploading Profile Picture (Upload new file and thn we can overwrite this with another picture)
const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, callback) {
        if (!file.originalname.match(/\.(jpg|png|jpeg)/)) {
            return callback(new Error('Your file format does not supported.(Must be jpeg,jpg,png)'))
        }
        callback(undefined, true)
    }

})
// Upload and reUpload (Create and Update)
router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    const buffer = await sharp(req.file.buffer).resize({width: 250, height: 250}).png().toBuffer()
    req.user.avatar = buffer
    await req.user.save()
    res.send({"message": "Your profile picture uploaded successfully."})
}, (error, req, res, next) => {
    res.status(400).send({error: error.message})
})

// Deleting Profile Picture (Delete)
router.delete('/users/me/avatar', auth, async (req, res) => {
    req.user.avatar = undefined
    await req.user.save()
    res.status(200).send({'message': 'Your profile picture removed successfully'})
})

// Fetch avatar (Read)
router.get('/users/:id/avatar', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)

        if (!user || !user.avatar) {
            throw new Error('user not found or user does not have profile picture')
        }
        res.set('Content-Type', 'image/png')
        res.send(user.avatar)
    } catch (error) {
        res.status(404).send(error.message)
    }
})


module.exports = router