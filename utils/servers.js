const servers = require('../servers.json');
const gamedig = require('gamedig');
const RCON    = require('modern-rcon');

const serversById = {};
const serversInfoForClient = [];

for (let server of servers) {
    serversById[server.model_name] = server;
    serversInfoForClient.push({
        name: server.name,
        ip: server.address,
        id: server.model_name,
        features: server.features,
        main_info: server.main_info,
        mods: server.mods,
        screenshots: server.screenshots,
    });
}

module.exports.getServers = async () => {
    let serversInfo = [];
    for(let i = 0; i < servers.length; i++){
        let info = null; // await gamedig.query({ type: "minecraft", host: servers[i].address }).catch((error) => console.log(error));
        if(!info){ 
            serversInfo.push({ inactive: true, name: servers[i].name, });
            continue;   
        }
        serversInfo.push({
            max_players: info.maxplayers,
            host: info.connect,
            name: servers[i].name,
            players: info.players.length
        });
    }
    return serversInfo;
}

module.exports.getServer = async (id) => {
    let info = null; // await gamedig.query({ type: "minecraft", host: servers[id].address }).catch(() => {});
    if(!info){ return { inactive: true } }
    return {
        max_players: info.maxplayers,
        host: info.connect,
        name: info.name,
        players: info.players.length
    };
}

module.exports.sendCommand = async (server, command) => {
    let { host, port, password }    = server.rcon;
    let connection                  = new RCON(host, Number(port), password);
    await connection.connect();
    let data = await connection.send(command);
    await connection.disconnect();
    return data;
}

module.exports.getData = (id) => serversById[id] ? serversById[id] : false;

module.exports.getDataForClient = (req, res) => res.json(serversInfoForClient); 

module.exports.isValidPrivilege = (string) => ["vip", "premium", "ultra", "legend", "supreme", "sponsor"].includes(string);
