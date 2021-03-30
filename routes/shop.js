const _route        = require('express').Router();
const errorHear     = require('../utils/errorHear');
const paginate      = require('../utils/paginate');
const srvUtil       = require('../utils/servers');
const Products      = require('../database/models/Products');
const Permissions   = require('../database/models/Permissions');
const User          = require('../database/models/User');
const ifAuthed      = require('../middlewares/ifAuthed');
const servers       = require('../servers.json');

// Получить страницу товаров 
_route.get('/', async (req, res) => { 
    try {
        // req.query.server - id сервера из servers.json, а именно model_name
        // Получить список доступных серверов: GET -> localhost:4000/servers
        let server  = req.query.server ? { server: req.query.server} : {}; 
        // Категории товаров:
        //  item - предмет
        //  privilege - привелегия
        let type    = req.query.type ? { type: req.query.type } : {};
        // data:
        //  current_page - текущая страница
        //  page_count - кол-во страниц
        //  data - данные товара
        let data = await paginate(Products, req.query.page || 1, { ...server, ...type }); 
        return res.json(data);
    } catch (error) { return errorHear.hear(res, error) }
});
_route.post('/buy', ifAuthed, async (req, res) => {
    try {
        // ID - Товаров
        let { products: productsIds } = req.body;
        let products = await Products.findAll({ where: { id: productsIds }});
        // Если товаров - нет
        if(!products.length){ return res.status(404).json({ message: "Товары не найдены", message_en: "Products not found" }); }
        // Если цена товара больше, чем кристаллов у пользователя
        let allPrice    = products.map((product) => product.toJSON()).reduce((prev, current) => prev + current.price, 0);
        console.log(allPrice, req.user.crystals);
        if(allPrice > req.user.crystals){ return res.status(403).json({ message: "Не хватает кристаллов", message_en: "Not enough crystals" }); }
        // Перебираем товары
        for(let i = 0; i < products.length; i++){
            let { type, server, data }  = products[i];
            let server_data             = srvUtil.getData(server);
            if(type == 'item'){
                // Форматируем команду
                let command = data.replace(/\%nick\%/i, req.user.login);
                // Отправляем на сервер и ждем ответа
                await srvUtil.sendCommand(server_data, command);
            }
            if(type == 'privilege'){
                // Получаем (модель) по ID
                // Сравниваем по типу
                let db = Permissions[server];
                if(server_data.type == 'pex'){
                    // Находим
                    let privilege = await db.db.findOne({ where: { child: req.user.login } });
                    // Если нет - создаем
                    if(!privilege){
                        privilege = db.db.build({ child: req.user.login, parent:data });
                    }
                    // Обновляем
                    privilege.parent = data;
                    await privilege.save();
                }
                if(server_data.type == 'luckyperms'){
                    // Находим
                    let privilege = await db.db.findOne({ where: { uuid: req.user.login } });
                    // Если нет - создаем
                    if(!privilege){
                        privilege = db.db.build({ uuid: req.user.login, permission: data });
                    }
                    // Обновляем
                    privilege.permission = data;
                    await privilege.save();
                }
            }
        }
        // Вычитаем из криссталов пользователя сумму на которую он закупился
        let user = await User.findOne({ where: { email: req.user.email } });
        user.crystals -= allPrice;
        await user.save();
        return res.json({ products: productsIds }); 
    } catch (error) { return errorHear.hear(res, error); }
});

module.exports = _route;
