const User = require("../models/user")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")


function generateToken(data) {
    const { _id, username } = data;
    const payload = { _id, username }
    const token = jwt.sign(payload, process.env.JWT_PK)
    return token;
}

async function createUser(req) {
    let status = false
    const { username, password, repeatPassword } = req.body;

    if (password !== repeatPassword) {
        console.error("Password confirmation mismatch!")
        return { status }
    }

    const salt = await bcrypt.genSalt(10)
    const hash = await bcrypt.hash(password, salt)

    const user = new User({ 
        username, 
        password: hash 
    });

    try {
        const userObj = await user.save()
        const token = generateToken(userObj)
        status = true
        return { status, token }
    } catch (error) {
        console.error(error);
        return { status } 
    }
}

async function loginUser(req) {
    let status = false;
    const { username, password } = req.body;

    const userObj = await User.findOne({ username })
    if (!userObj) return { status }
    status = await bcrypt.compare(password, userObj.password)

    if (status) {
        const token = generateToken(userObj);
        return { status, token }
    } else {
        console.error("Password mismatch!")
        return { status }
    }
}

module.exports = {
    createUser,
    loginUser
}