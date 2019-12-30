'use strict'

const mongoose = require('mongoose');
const Schema = mongoose.Schema;


//cria um schema para o pedido
//contem qual o cliente que fez o pedido
//o numero do pedido
//a data do pedid
//o status do pedido
//os itens do pedido que contem quantidade, preço e qual o produto
const schema = new Schema({
    customer: {
        type: mongoose.Schema.Types.ObjectId, //referencia um cliente
        ref: 'Customer', //pega a referencia do Customer ( é do model customer). Pode ser que pegue pelo ObjectId do Custumer, mas nao tem id no modelo, vamos ver...
    },
    number: { //numero do pedido
        type: String,
        required: true,
    },
    createDate: { 
        type: Date,
        required: true,
        default: Date.now //todo pedido criado conta a partir de agora
    },
    status: { //vai ser o enumerador
        type: String,
        required: true,
        enum: ['created', 'done'],
        default: 'created'
    },
    items: [{ //joga isso tudo dentro de um array
        quantity: { 
            type: Number,
            required: true,
            default: 1
        },
        price: { 
            type: Number,
            required: true,
        },
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product' //aqui referencia o product model
        }
    }],
});

module.exports = mongoose.model('Order', schema);
                                // ^ nome do nosso model. Essa é uma diferença no export, nesse caso precisa exportar o mongoose.model e dar nome.