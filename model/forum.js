const mongoose = require('mongoose')

const ForumSchema = new mongoose.Schema(
	{
		username: { type: String, required: true},
		message: { type: String, required: true},
        date: { type: String, required: true},
        likes: { type: Number}
	},
	{ collection: 'forum', versionKey: false }
)

ForumSchema.set('toObject', {
    transform: function (doc, ret) {
      ret.id = ret._id
      delete ret._id
      delete ret.__v
    }
  })

const model = mongoose.model('ForumSchema', ForumSchema)

module.exports = model
