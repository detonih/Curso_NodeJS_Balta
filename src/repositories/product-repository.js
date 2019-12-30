'use stricts'

const mongoose = require('mongoose');
const Product = mongoose.model('Product');

//função para listar todos os produtos
//.find({}) sem nenhum parametro dentro vai buscar todos as propriedades do schema, creio eu para cada produto criado
//só vai trazer pelo find os produtos que estao ativos
//só vai trazer as informações referente a title, price e slug, aqui nao precisa de virgula pode colocar todos dentro de aspas separados por espaço

exports.get = async() => {
    const res = await Product.find({
        active: true,
    }, 'title price slug');
    return res;
};

exports.getBySlug = async(slug) => { 
    const res = await Product
            .findOne({ //aqui alteramos de find() para findeOne(), pois no retorno do response esta vindo um array, e como o slug esta definido como unique e esta como indice no models, portanto nao haverá 2 iguais 
            slug: slug, //vai receber o slug como parametro na rota, assim tem que inserir no product-routes outra rota e passar como parametro obrigatorio na URL
            active: true 
            }, 'title description price slug tags');
    return res; 
};

exports.getById = async(id) => { 
    const res = await Product
           .findById(id);
    return res;
};

exports.getByTag = async(tag) => { 
    const res = await Product
        .find({
        tags: tag,//aqui passando o tags: já vai filtrar dentro no array das tags no model
        active: true 
        }, 'title description price slug tags');//esse metodo é bacana pois se precisar buscar uma tag em especifico nao precisa fazer um foreach pra buscar no array
    return res;
};

exports.create = async(data) => {
    var product = new Product(data); //cria a instancia do product, já passando o req.body, tudo que vem na requisição ja passo pro corpo do produto
    await product.save(); //esse metodo nao precisa colocar o return, apenas await, pois na precisa retornar nada
};

exports.udpdate = async(id, data) => { //mesmo esquema do create, nao precisa retornar nada só dar update entao nao precisa de return
    await Product
        .findByIdAndUpdate(id, {
            $set: { //$set: pega o que veio da requisicao (req.params.id) e diz o que vai ser alterado no produto
                title: data.title,
                description: data.description,
                price: data.price,
                slug: data.slug
            }
        });
};

exports.delete = async(id) => { //mesmo esquema do await do create e update
    await Product
        .findOneAndRemove({
            _id: id
        });
};