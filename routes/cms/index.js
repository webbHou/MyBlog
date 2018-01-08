const express = require('express');
const router = express.Router();

const db = require('../db/db');

router.get('/',(req,res)=>{
    if(req.cookies.userInfo === null){
        res.redirect('/cms/login');
    }else{
        res.redirect('/cms/blog');
    }
});

router.get('/exit',(req,res) =>{
    res.clearCookie('userInfo');
    res.redirect('/cms/login');
});

router.post('/set',(req,res) => {
    let {newPassword} = req.body;
    let username =  req.cookies.userInfo.username;
    let data = {}
    db.User.findOne({username:username}).then((user) => {
        if(!user){
            data.success = 0;
            data.errMsg = "用户名不存在！";
            res.json(data);
        }else{
            if(user.password === newPassword){
                data.success = 0;
                data.errMsg = "新密码和当前密码一致！";
                res.json(data);
            }else{
                db.User.update({username:username},{password:newPassword}).then(()=>{
                    data.success = 1;
                    res.clearCookie('userInfo');
                    res.json(data);
                });
            }
        }
    });
});

router.use('/blog', require('./blog'));
router.use('/code',require('./code'));
router.use('/book',require('./book'));
router.use('/link',require('./link'));
router.use('/login',require('./login'));

module.exports = router;