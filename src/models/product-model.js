'use strict'

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//cria um novo schema
//no schema é onde vamos colocar o que compoe o nosso Product. É composto por propriedades.
//trim: significa que remove os espaços antes e depois da string do titulo
//slug: Slug é a parte de uma URL que pode ser legível tanto para humanos quanto para mecanismos de busca.
//o schema cria um id automaticamente
const schema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    slug: { //Compoe a URL, por ex se o nome do prod é Cadeira Gamer, fica cadeira-gamer
        type: String,
        required: [true, 'Slug is required'],
        trim: true,
        index: true, //tem que ter indice pois fazemos busca pelo indice tbm (facilita a busca)
        unique: true //o slug precisa ser unico, nao podemos ter 2 prod com msmo slug por causa do s buscadores
    },
    description: {
        type: String,
        required: true,
    },
    price: { 
        type: Number, //Number aceita float e integer
        required: true 
    },
    active: {//diz se o produto esta ativo ou nao
        type: Boolean,
        required: true,
        default: true //por padrão quando cadastra um novo produto ele já vem ativado (active)
    },
    tags: [{ //foi definida como um array de strings para que seja possível passar as tags. Ajuda a buscar por tags.
        type: String, //talvez seja essas tags que são encontradas pelos buscadores
        required: true
    }],
    image: { //armazenamos apenas o caminho da imagem. Apesar disso é recomendavel que se armazen a imagem no storege
        type: String,
        required: true,
        trim: true
    }
});

module.exports = mongoose.model('Product', schema);
                                // ^ nome do nosso model. Essa é uma diferença no export, nesse caso precisa exportar o mongoose.model e dar nome.