const mongoose = require('mongoose')

const LevelsSchema = new mongoose.Schema(
	{
		username: { type: String, required: true },
		level: { type: String, required: true },
        description: { type: String },
        likes: { type: Number, required: true},
        name: {type: String, required: true},
        id: {type: Number, required: true}

	},
	{ collection: 'levels' }
)

const model = mongoose.model('LevelsSchema', LevelsSchema)

module.exports = model
