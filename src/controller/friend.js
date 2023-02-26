const { getUserByUsername } = require("./user")
const conn = require('../database/connection');
const { QueryTypes } = require('sequelize');

module.exports = {
    addFriend: async (req,res)=>{
        const { username, password, usercari } = req.body

        if(!(username && password && usercari))
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
        if(friends.length > 0){
            return res.status(400).json({ message: "User sudah menjadi teman"})
        }

        await conn.query(`insert into friend values(NULL,:username, :usercari),(NULL,:usercari, :username)`,{
            replacements:{ username, usercari }
        })

        delete user.password
        delete usercariFound.password
    
        return res.status(200).json({
            message: "Berhasil menambah friend",
            user,
            usercariFound
        })
    },

    viewFriend: async (req,res)=>{
        const { username } = req.params
        let friends = await conn.query(`select userB from friend where userA=:username`,{
            type: QueryTypes.SELECT,
            replacements:{ username }
        })
        friends =friends.map(async (friend,index) => {
            const username = friend.userB
            const friendData = await getUserByUsername(username)
            delete friendData.password
            return JSON.parse(`{
                "user${index+1}": ${JSON.stringify(friendData)}
            }`)
        })
        friends = await Promise.all(friends)

        return res.status(200).json(friends)
    },

    deleteFriend: async (req,res)=>{
        const { username, password, usercari } = req.body

        if(!(username && password && usercari))
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
            return res.status(400).json({ message: "User belum menjadi teman"})
        }

        await conn.query(`delete from friend where userA=:username and userB=:usercari`,{
            replacements:{ username, usercari }
        })

        return res.status(200).json({
            message: "Berhasil menghapus friend",
            user,
            usercariFound
        })
    },
}