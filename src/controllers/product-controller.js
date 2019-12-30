'use stricts';

const ValidatonContract = require('../validators/fluent-validator');
const repository = require('../repositories/product-repository');
const azure = require('azure-storage');
const config = require('../config');
const guid = require('guid');

//função para listar todos os produtos
//entao vou ter um resultado
//aqui ja retorna um json //ou entao um erro.... igual no post
// retorna json, nao é necessario retornar uma mensagem
//aqui o catch esta sendo trado como algo como um return ou if/else
//notasse que esse "metodo" catch é repetido em todos as funções do CRUD, assim ele poderia ser encapsulado
//em uma função para ser chamado como funão dentro dos metodos CRUD
exports.get = async(req, res, next) => {
    try {
        var data = await repository.get();
        res.status(200).send(data);
    } catch (e) {
        res.status(500).send({
            message: 'Fail while the requisition process'
        });
    };
};

//fazendo um filtro para receber por slug do produto
//aqui o catch esta sendo tradado com um metodo ou função
exports.getBySlug = async(req, res, next) => { 
    try {
        var data = await repository.getBySlug(req.params.slug);
        res.status(200).send(data);
    } catch (e) {
        res.status(500).send({
            message: 'Fail while the requisition process'
        });
    };
};

//Criando um metodo para pegar por id. Serve para setores administrativos.
exports.getById = async(req, res, next) => { 
    try {
        var data = await repository.getById(req.params.id); 
        res.status(200).send(data);
    } catch (e) {
        res.status(500).send({
            message: 'Fail while the requisition process'
        });
    };  
};

//Filtrar por tag. Isso vai trazer todos os produtos dos quais constam a mesma tag. Por ex, os produtos que tem a tag games.
exports.getByTag = async(req, res, next) => {
    try {
        const data = await repository.getByTag(req.params.tag);
        res.status(200).send(data);
    } catch (e) {
        res.status(500).send({
            message: 'Fail while the requisition process'
        });
    };
};
//exportar direto o metodo post. esse "exports" está entrando no lugar de "router" que esta no product-routes
//Aqui não temos as rotas ('./'), pois elas já estão no product-routes. 
//Assim estamos separando as funções dos metodos (post, get...) que recebem os parametros (req, res) das
//rotas propriamente dito ("./product")


/* O que fo feito: 1. criou-se uma variavel (ValidatonContract=require) para acessar o fluent-validator.js
     2. criou-se uma variavel (contract) no post (controller) para criar (new) um novo metodo ValidatorContract() 
     3. acessou-se as propriedades (funcoes) do fluente-validator através da variavel criada (contract.hasMinLen())
     4. Passou-se os parametros para a função hasMinLen(value, min, message), como sendo hasMinLen(req.body.title, 3, 'Title must to have at least 3 characters') 
     5.Criouse uma condição (if) para caso os dados enviados pelo usuario atraves da requisicao sejam iválidos
     neste caso se não for válido (!contract.isValid()) responde com com o codigo do status (res.status) 
     enviando alguma coisa dos erros, a quantidade de erros ou a message(send.(contract.errors())) */
     
exports.post = async(req, res, next) => { //função criação do produto <-- acho q nao é isso kkk
    let contract = new ValidatonContract(); //chamou as funções contidas no arquivo fluent-validator.js e jogou dentro de uma variavel contract
    contract.hasMinLen(req.body.title, 3, 'Title must to have at least 3 characters'); //hasMinLen é uma função que esta dentro do fluent-validator e foi acessada através do ponto contract.hasMinLen como uma propriedade
    contract.hasMinLen(req.body.slug, 3, 'Slug must to have at least 3 characters'); //req.body.title está requerendo que titulo que for passado pelo usuario da API, que neste caso estamos simulando com o POSTmAN, esteja de acordo com a função HasMinLen
    contract.hasMinLen(req.body.description, 3, 'Description must to have at least 3 characters'); // a mensagem que vai ser retornada cas de erro está como string ' message'
    

    //Se os dados forem inválidos
    if (!contract.isValid()) {
        res.status(400).send(contract.errors()).end();
        return;
    }

    try {
        //Cria o blob service. Blob service é o serviço de armazenamento em containers do azure.
        //cria-se conteiners diferentes para separar aquivos de produtos, clientes, usuário, etc.
        const blobSvc = azure.createBlobService(config.containerConnectionString); //conecta atraves do arquivo config.js

        let filename = guid.raw().toString() + '.jpg'; //gera um numero randomico, pois se vc subir um arquivo com o mesmo nome vai ser substituido
        let rawdata = req.body.image; //imagem pura convertida em base64
        let matches = rawdata.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);//toda vez que convertemos uma imagem para base64 ela vem com uma especie de cabeçalho na frente, dizendo que é uma img do tipo base64. Esse regex é usado para remover esses itens de cabeçaho
        let type = matches[1]; //tipo é matches[1], pega o tipo da imagem, faz um split da imagem. Poderia ser usado as libs multer (tratamento e upload dos dados/imagens) e sharp (processa imagens no servidor, redimensionar, comprimir, converter)
        let buffer = new Buffer(matches[2], 'base64'); //dados ficam no matches[2]
        //buffer é um objeto global do node, entao nao precisa ser chamado com require.
        //é usado para lidar com manipulaçao de dados. Encoding data.
        //pode ser que esse metodo esteja depreciado, de acordo com a documentaççaõ.
        //ao inves disso usasse Buffer.from
        //converte a string em uma stream de dados binários
        //interessante notar que neste codigo nao converte para base64, apenas lê imagnes em base64
        //para converter para base64 ele usa um serviço na internet: www.base64-image.de

        //Salva a imagem
        await blobSvc.createBlockBlobFromText('product-images', filename, buffer, {//criando u blob serice baseado num texto (base64)
            contentType: type                 // ^ product-images é o nome do container que foi criado no storage account. O acess type do storage foi criado como blob
        }, (error, result, response) => {
            if (error) {
                filename = 'default-product.png' //se der erro nao pode deixar sem imagen, entao coloca essa imagem padrao
            }
        });

        await repository.create({ //compor o model do product aqui
            title: req.body.title,
            slug: req.body.slug,
            description: req.body.description,
            price: req.body.price,
            active: true,
            tags: req.body.tags,
            image: 'https://nodestrbalta.blob.core.windows.net/product-images/' + filename
        }); //estranho que nesse momento ele sobe a imagem pro azure storage manualmente, e depois cola a URL aqui. Mas isso funcionaria pra alguma imagem que quero subir no front end?
        //ele usa o conversor pra base64 na internet para colocar a string gerada para fazer o post
        //em image: ele concatena o caminho do azure storage com o nome do arquivo gerado pelo guid
        

        res.status(201).send({
            message: 'Product registered sucessfully!'
        });
    } catch (e) {
        console.log(e);
        res.status(500).send({
            message: 'Fail while product registration!'
        });
    };
}; //neste caso aqui é interessante que estamos apenas testando o metodo post, portanto quando digitamos algo no POSTMAN irá retornar este mesmo algo.
//no POSTMAN estamos enviando uma request com um tipo de arquivo json que "escrevemos" la msm

/* IMPORTANTE:  
const product = new Product(req.body); 
quando se usa a instancia dessa forma, passando o req.body direto como parametro do Product(req.body),
se torna perigoso para mudanças no schema do model. Por ex, se no active estiver true e depois eu mudar
o código, o new Product() vai passar como true, entao o meu produto ja vai estar ativo na loja, sendo que
eu queria ter passado como false na hora de criar, ou seja nao estar ativo. Para nao fazer dessa forma
podemos fazer da seguinte:
const product = new Product(req.body);
product.title = req.body.title;
product.description = req.body.description;
product.price = req.body.price;
e assim por diante...
product.save();
*/

/* IMPORTANTE:
produc.save() vai salvar o item no banco de dados. Aqui é necessario tomar um certo cuidado, pois, 
o JS tem uma execução asincrona das funções e ele retorna promessa e nao o dado em si.
Assim, quando o interpretador passar pelo save() não vai ficar aguardando ser executado certinho e salvar
no DB. Teria que usar entao um async/await
*/

// Cria uma funcao pra dar update num produto.
exports.put = async(req, res, next) => {
    try {
        await repository.udpdate(req.params.id, req.body);
        res.status(200).send({
            message: 'Product updated sucessfully!'
        });
    } catch (e) {
        res.status(500).send({
            message: 'Fail while update the product!'
        });
    };
};

//removendo um produto do DB
//Ta rolando uma coisa estranha aqui. O delete ta deletando o primeiro item que aparece quando dou o GET, mesmo eu passando o
//id do produto que quero deletar
//esa removendo como se fosse em lista, deletando sempre o primeiro, mesmo passando um id de um item que nem tem cadastrado.
//
exports.delete = async(req, res, next) => {
    try {
        await repository.delete(req.body.id); //aqui poderia ser passado req.params.id, porem seria necessário alterar nas rotas e colocar /:id
        res.status(200).send({
            message: 'Product removed sucessfully!'
            });
    } catch (e) {
        res.status(500).send({
            message: 'Fail while remove the product!'
        });
    };
};