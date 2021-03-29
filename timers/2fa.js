const Temp2fa = require('../database/models/Temp2fa');

const remove2faExpiredCodes = async () => {
  console.log('Удаление истекших 2fa-кодов');

  try {
    await Temp2fa.destroy({ where: { expires: { $lte: new Date().getTime() } } });
  } catch (error) { return console.error(`Ошибка удаления истекших 2fa-кодов подтверждения: ${error.message}\n${error.stack}`); }

  console.log('Удаление истекших 2fa-кодов завершенно');

  setTimeout(remove2faExpiredCodes, 1000 * 60 * 5);
};

module.exports = remove2faExpiredCodes;
