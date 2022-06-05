const mongoose = require('mongoose')

const DataSchema = new mongoose.Schema(
    {
        username: { type: String, required: true},
        coins: { type: Number, required: true},
        date: { type: String, required: true},
        admin: { type: Boolean, required: true},
        banned: { type: Boolean, required: true},
        userid: { type: Number, required: true},
        friendrequests: [{ username: String }],
        friends: [{ friendName: String}]
    },
    { collection: 'database'}
)

const model = mongoose.model('DataSchema', DataSchema)

module.exports = model
