'use stricts'

const mongoose = require('mongoose');
const Order = mongoose.model('Order');

exports.get = async(data) => {
    var res = await Order.find({}, 'number status customer items') //aqui após o virgula vc passa os valores que vc quer pegar, desconsiderando outros, então vai mostrar apenas o number e o status
        .populate('customer', 'name') // aqui mesmo coisa, em vez de aparecer email, senha, nome etc do cliente, aparece só o name
        .populate('items.product', 'title'); //aqui mesmo esquema. Esse esquema é chamado de "popular", vai popular só os valores que estou passando
    return res;
};

exports.create = async(data) => {
    var order = new Order(data); 
    await order.save(); 
};