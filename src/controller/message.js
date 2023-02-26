const { getUserByUsername } = require("./user")
const conn = require('../database/connection');
const { QueryTypes } = require('sequelize');

module.exports = {
    sendMessage:async (req,res)=>{
        const { username, password, message, usercari } = req.body

        if(!(username && password && message && usercari))
            return res.status(400).json({ message: "Semua field harus terisi"})

        let user = await getUserByUsername(username)
        if(!user)
            return res.status(404).json({ message: "Username tidak terdaftar"})
        
        if(user.password !== password)
            return res.status(400).json({ message: "Password salah"})

        let usercariFound = await getUserByUsername(usercari)
        if(!usercariFound){
            return res.status(404).json({ message: "User yang dicari tidak terdaftar"})
        }

        let friends = await conn.query(`select * from friend where userA=:username and userB=:usercari`,{
            type: QueryTypes.SELECT,
            replacements:{ username, usercari }
        })
        if(friends.length == 0){
            return res.status(400).json({ message: "User tidak menjadi teman"})
        }

        await conn.query(`insert into message values(NULL,:username, :usercari, :message)`,{
            replacements:{ username, usercari, message }
        })

        const newMessage = await conn.query(`select * from message where msg_from=:username and msg_to=:usercari order by 1 desc limit 1`,{
            type: QueryTypes.SELECT,
            replacements:{ username, usercari, message }
        })
            
        return res.status(200).json({
            message: "Berhasil mengirim pesan",
            newMessage: newMessage[0]
        })
    },
    viewMessage:async (req,res)=>{
        const {username} = req.params
        const {password} = req.body
        let user = await getUserByUsername(username)
        if(!user)
            return res.status(404).json({ message: "Username tidak terdaftar"})
            
        if(user.password !== password)
        return res.status(400).json({ message: "Password salah"})

        const messages = await conn.query(`select * from message where msg_from=:username`,{
            type: QueryTypes.SELECT,
            replacements:{ username }
        })
            
        return res.status(200).json(messages)
    },
}

