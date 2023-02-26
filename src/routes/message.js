const express = require('express');

const router = express.Router()

const {
    sendMessage,
    viewMessage
} = require('../controller/message');


router.post('/message', sendMessage)
router.get('/message/:username', viewMessage)

module.exports = router