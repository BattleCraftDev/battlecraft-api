const remove2faExpiredCodes = require('./2fa.js');
const checkDonateExpires = require('./donate.js');

const startTimers = () => {
  console.log('Запуск таймеров');
  
  remove2faExpiredCodes();
  checkDonateExpires();
};

module.exports = startTimers;
