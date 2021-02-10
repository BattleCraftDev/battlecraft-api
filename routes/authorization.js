const _route        = require('express').Router();
const _ifNotAuthed  = require('../middlewares/ifNotAuthed');
const _ifAuthed     = require('../middlewares/ifAuthed');
const User          = require('../database/models/User');
const jwt           = require('../utils/jwt');
const tfa           = require('../utils/2fa');

// Регистрация
_route.post('/signup', _ifNotAuthed, async (req, res) => {
    try {
        if(!req.body){ return res.status(400).json({ message: 'Empty username or password' }); }
        if(!req.body.username || !req.body.password){ return res.status(400).json({ message: 'Empty username or password' }); }
        if(!req.body.username.length || !req.body.password.length){ return res.status(400).json({ message: 'Empty username or password' }); }
        let user    = await User.create({ username: req.body.username, password: req.body.password });
        let token   = jwt.getToken(user.toJSON());
        return res.json({ token, user: user.toJSON() });
    } catch (error){
        if(error.code){ return res.status(error.code).json({ message: error.message }) }
        return res.status(500).json({ message: 'Server error' });
    }
});

// Авторизация
_route.post('/signin', _ifNotAuthed, async (req, res) => {
    try {
        if(!req.body){ return res.status(400).json({ message: 'Wrong username or password' }); }
        if(!req.body.username || !req.body.password){ return res.status(400).json({ message: 'Wrong username or password' }); }
        let user = await User.findOne({ where: { username: req.body.username } });
        if(!user){ return res.status(404).json({ message: 'Wrong username or password'}); }
        if(!user.validatePassword(req.body.password)){ return res.status(400).json({ message: 'Wrong username or password' }); }
        let token = jwt.getToken(user.toJSON());
        if(user.tfaType != 'none'){ 
            if(user.tfaType == 'email'){
                // Отправить код
            }
            return res.json({ token: "", user: {}, tfa: true }); 
        }
        return res.json({ token, user: user.toJSON(), tfa: false });
    } catch(error){
        return res.status(500).json({ message: 'Server error' });
    }
});

// Выход
_route.post('/logout', _ifAuthed, (req, res) => { return res.json({ message: 'You are logged out' }) });

// Получение информации о пользователе
_route.get('/user', _ifAuthed, (req, res) => { 
    try {
        let user = jwt.checkToken(req.token);
        return res.json({ user, token: req.token }); 
    } catch (error) {
        return res.status(500).json({ message: 'Server error' });
    }
});

// Проверка 2FA кода
_route.post('/2fa', _ifNotAuthed, async (req, res) => {
    try {
        if(!req.body.code){ return res.status(400).json({ message: '2fa-confirm-code required' }); }
        if(!req.body.username){ return res.status(400).json({ message: "Username required"}); }
        if(!req.body.password){ return res.status(400).json({ message: "Password required"}); }
        let user = await User.findOne({ where: { username: req.body.username }});
        if(user.tfaType == 'google'){
            if(!tfa.checkCode(req.body.code, user.tfaSecret)){ return res.status(400).json({ message: "2f-confirm-code doesn`t match"}) }
        }
        const token = jwt.getToken(user.toJSON());
        delete user.tfaSecret;
        delete user.tfaType;
        delete user.emailCode;
        return res.json({ user: user.toJSON(), token });
    } catch(error) {
        return res.status(500).json({ message: "Server error "});
    }
});

module.exports = _route;