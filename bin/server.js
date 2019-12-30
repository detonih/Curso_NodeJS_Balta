'use strict'; 

//aqui deixamos todas as funções do server e removemos as funções do app e rotas

const app = require('../src/app') //importamos o arquivo app.js
const http = require('http');
const debug = require('debug')('nodestr: server'); //('nodestr: server') é o nome pro debug

//nao é interessante fixar a porta pois ela pode estar em uso quando a app for pro servidor
//criou-se uma função para normalizar a porta normalizePort
const port = normalizePort(process.env.PORT || '3000'); //.env = enviroment
app.set('port', port);

const server = http.createServer(app); //cria o servidor

server.listen(port); //coloca a api para rodar na porta 3000
server.on('error', onError);
//          ^ 'error' é uma serie de eventos de erro que quando acontecem chama a função onError
server.on('listening', onListening); //da mesma forma tenho os eventos 'listening' e chamo o metodo (function) criado onListening

console.log('API running on port: ' + port);

//function para normalizar a porta e ver se tem uma 3000 disponivel
//essa função deve ser aplicada na variavel const port
function normalizePort(val) {
    const port = parseInt(val, 10); //recebe um valor e tenta converter para inteiro

    if (isNaN(port)) { //se o valor de port nao for um numero retorna 10  ->(val, 10)
        return val;
    }
    
    if (port >= 0) {
        return port; //se for maior ou igual a 0 retorna a porta
    }

    return false; //ou então nao retornamos nada
};

//precisamos criar uma função para tratar erros do startup do servidor

function onError(error) { //quando recebemos um erro
    if (error.syscall !== 'listen') {
        throw error;
    }

    const bind = typeof port === 'string' ?
        'Pipe ' + port :
        'Port ' + port;

    switch (error.code) { //pegamos o error code (EACCESS, EADDRINUSE) e printa a tela 
        case 'EACCES': 
            console.error(bind + ' require relevant privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE': //endereço em uso
            console.error(bind + ' is already in use'); 
            process.exit(1);
            break;
        default:
            throw error;
    }
}

function onListening() {
    const addr = server.address(); //pega as infos do servidor
    const bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr;
    debug('Listening on ' + bind); //starta o debug
}