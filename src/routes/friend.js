const express = require('express');
const router = express.Router()

const {
    addFriend,
    viewFriend,
    deleteFriend,
} = require('../controller/friend');


router.post('/friend', addFriend)
router.get('/friend/:username', viewFriend)
router.delete('/friend', deleteFriend)

module.exports = router