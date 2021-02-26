const mongoose = require('mongoose')
const Schema = mongoose.Schema

const categoria = new Schema({
    nome: {
        type: String,
        required: true
    },
    slug:{
        type: String,
        required: true
    },
    data:{
        type: Date,
        default: Date.now()
    }
})
mongoose.model('categorias', categoria)