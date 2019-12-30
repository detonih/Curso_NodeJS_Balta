'use stricts'

const mongoose = require('mongoose');
const Customer = mongoose.model('Customer');

exports.create = async(data) => {
    var customer = new Customer(data); 
    await customer.save(); 
};

//faz a autenticação do custumer por email e data, procura ele no DB
exports.authenticate = async(data) => {
    const res = await Customer.findOne({ //aqui usa findOne pra retornar apenas um customer ou vazio
        email: data.email,
        password: data.password //password ja vem encriptado pelo md5 que esta no post do customer-controller, na hora de criar ja encripta
    });
    return res;
};

exports.getById = async(id) => {
    const res = await Customer.findById(id);
    return res;
};

//podemos criar o update e delete igual o do product