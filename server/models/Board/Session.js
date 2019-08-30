const mongoose = require('../Database/mongoose')

const sessionSchema = new mongoose.Schema({
	clients: [{type: mongoose.Schema.Types.ObjectId}]
})

sessionSchema.statics.create = async function() {
	const data = new Session()
	await data.save()
	return data
}

sessionSchema.methods.view = function() { // !! NOTICE: view is usually not async, if is async, you have to change the relative ones
	return {
		_id: this._id,
		clients: this.clients
	}
}

const Session = mongoose.model('Session', sessionSchema)

module.exports = Session