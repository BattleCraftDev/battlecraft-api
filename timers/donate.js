const Donate = require('../database/models/Donate');

const checkDonateExpires = async () => {
  console.log('Удаление истекших привелегий');

  try {
    // Находим всех донатеров, где срок конца меньше, чем текущая дата
    let donate = await Donate.findAll({ 
        where: { 
            expires: {
                $lte: new Date().getTime() 
            }
        }
    });
    // Перебираем просроченных-донатеров :)
    for (let i = 0; i < donate.length; i++) {
        // Получаем объект модели и типа таблицы
        // let db = Permissions[donate[i].server];
        // // Если нет, кидаем ошибку, т.к исключений не должно быть
        // if(!db){ throw `Сервер не найден в servers.json, но найден в donate.sql`; }
        // // Деструктурируем объект модели
        // let { db: model, type } = db;
        // // В зависимости от типа таблицы, выполняем то или иное действие
        // switch(type){
        //     case 'pex': {
        //         await model.destroy({ where: { child: req.user.login } });
        //         break;
        //     }
        //     case 'luckyperms': {
        //         await model.destroy({ where: { uuid: req.user.login } });
        //         break;
        //     }
        //     default: { throw `Тип не найден в servers.json, но найден в Donate.js`; }
        // }
        // В конце удаляем из просроченных-донатеров пользователя
        await donate[i].destroy();
    }
  } catch (error) { console.error(`Ошибка проверки просроченности доната: ${error.message}\n${error.stack}`); }

  console.log('Удаление истекших привелегий завершенно');

  setTimeout(checkDonateExpires, 1000 * 60 * 60 * 12);
};

module.exports = checkDonateExpires;
