const express = require('express');
const router = express.Router();
const db = require('../db/db');

router.get('/',(req,res) => {
    res.render('cms/login.html');
});

router.post('/',(req,res)=>{
    let username = req.body.username;
    let password =req.body.password;

    db.User.findOne({username:username}).then((user) => {
        let data = {};
        if(!user){
            data.success = 0;
            data.errMsg = '该用户名不存在！';
            res.json(data);
        }else{
            if(password !== user.password){
                data.success = 0;
                data.errMsg = '密码错误！';
                res.json(data);
            }else{
                data.success = 1;
                res.cookie('userInfo',{username:username},{maxAge:3600000,httpOnly:false});
                res.json(data);
            }
        }
    })
});

module.exports = router;