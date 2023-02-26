const conn = require('../database/connection');
const { QueryTypes } = require('sequelize');

const userIsRegistered = async (username) => {
    let users = await conn.query('select * from user where username=:username', {
        type: QueryTypes.SELECT,
        replacements: { username }
    })
    return users.length > 0
}
const getUserByUsername = async (username) => {
    let users = await conn.query('select * from user where username=:username', {
        type: QueryTypes.SELECT,
        replacements: { username }
    })
    if(users.length === 0) return undefined
    return users[0]
}

module.exports = {
    register: async (req,res)=>{
        const { username, password, nama, alamat, nomorhp } = req.body
        if(!(username && password && nama && alamat && nomorhp)){
            return res.status(400).json({ message: "Semua field harus terisi"})
        }

        if(await userIsRegistered(username)){
            return res.status(400).json({ message: "Username sudah terdaftar"})
        }

        await conn.query(`insert into user values(:username, :password, :nama, :alamat, :nomorhp)`,{
            replacements:{ username, password, nama, alamat, nomorhp } 
        })

        let userAdded = await getUserByUsername(username)
        return res.status(200).json({
            message: "User successfully added",
            userAdded
        })
    },

    login: async (req,res)=>{
        const { username, password } = req.body
        if(!(username && password))
            return res.status(400).json({ message: "Semua field harus terisi"})
        
        let user = await getUserByUsername(username)
        if(!user)
            return res.status(404).json({ message: "Username tidak terdaftar"})

        if(user.password !== password)
            return res.status(400).json({ message: "Password salah"})

        return res.status(200).json({
            message: "Login berhasil",
            user
        })
    },

    editProfile: async (req,res) => {
        const { username } = req.params
        const { nama, alamat, nomorhp, oldpassword, newpassword } = req.body

        if (!(nama && alamat && nomorhp && oldpassword && newpassword))
            return res.status(400).json({ message: "Semua field harus terisi"})
        
        let user = await getUserByUsername(username)
        if(!user)
            return res.status(404).json({ message: "Username tidak terdaftar"})
        
        if(user.password !== oldpassword)
            return res.status(400).json({ message: "Password salah"})

        await conn.query(`update user set password=:newpassword, nama=:nama, alamat=:alamat, nomorhp=:nomorhp where username=:username`,{
            replacements:{ username, newpassword, nama, alamat, nomorhp }
        })
        user = await getUserByUsername(username)

        return res.status(200).json({
            message: "Profile berhasil diubah",
            user
        })
    },
    userIsRegistered, getUserByUsername
}