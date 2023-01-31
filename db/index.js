require("dotenv").config()

const mongoose = require("mongoose")
mongoose.set("strictQuery", true)

async function connect_db(callback) {
    try {
        mongoose.connect(process.env.MONGO_URI)

        await callback()
    } catch (error) {
        throw new Error("Unable to connect to database")
    }
}

module.exports = connect_db
