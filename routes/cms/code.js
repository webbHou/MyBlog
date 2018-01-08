const express = require('express');
const router = express.Router();

const db = require('../db/db');

router.get('/',(req,res) => {
    if(req.cookies.userInfo === undefined){
        res.redirect('/cms/login');
        return false;
    }
    let data = {};
    db.CodeCategory.find().then((currentList) => {
        if(currentList.length == 0){
            return new db.CodeCategory({
                category:'Other'
            }).save()
        }
    }).then(() => {
        return db.CodeCategory.find({status:1});
    }).then((category) => {
        data.categories = category.reverse();
        let codeList = category[0].code.reverse();
        data.list = codeList;
        data.index = 0;
        data.tag = 'code';
        data.title = '新建案例';
        if(codeList.length > 0){
            let codeId = codeList[0].id;
            db.Code.findOne({codeId:codeId}).then((current) => {
                data.code = current;
                res.render('cms/code.html', data);
            });
        }else{
            res.render('cms/code.html', data);
        }
    });
});

//查询分类
router.post('/category', (req, res) => {
    let category = req.body.category;
    //通过分类名查询分类
    db.CodeCategory.findOne({ category: category }).then((category) => {
        let data = {};
        data.list = category.code.reverse();
        res.json(data);
    });
});

//创建分类
router.post('/category/create', (req, res) => {
    let category = req.body.category;

    db.CodeCategory.findOne({ category: category }).then((curren) => {
        //查询要创建的分类是否存在
        //如果存在则返回“该分类已存在”
        //否则创建该分类
        if (curren !== null) {
            let data = {};
            data.success = 0;
            data.errMsg = '该分类已存在！';
            res.json(data);
            return false;
        }else{
                new db.CodeCategory({
                category: category
            }).save().then(() => {
                let data = {};
                data.success = 1;
                data.tag = 'code';
                data.category = category;
                res.json(data);
            });
        }

    })
});

//删除分类
router.post('/category/delete', (req, res) => {
    
    let category = req.body.category;

    db.CodeCategory.findOne({ category: category }).then((curren) => {
        //首先查询该分类是否存在
        //如果不存在，则返回“该分类不存在”
        //否则，将该分类的status设置为0
        let data = {};
        if (!curren) {
            data.success = 0;
            data.errMsg = "该分类不存在";
            res.json(data);
            return false;
        }else{
            db.CodeCategory.update({ category: category }, { status: 0 }).then(() => {
                data.success = 1;
                res.json(data);
            });
        }
    })
});

//创建案例
router.post('/create', (req, res) => {
    let category = req.body.category;
    let item = {};
    let data = {};
    new db.Code({
        category: category
    }).save().then((code) => {
        item.id = code.codeId;
        item.title = code.codeTitle;
        item.status = 0;
        data.code = code;
        return db.CodeCategory.findOne({ category: category });
    }).then((currenCate) => {
        currenCate.code.push(item);
        return db.CodeCategory.update({ category: category }, { code: currenCate.code })
    }).then(() => {
        data.success = 1;
        res.json(data);
    });

});

//编辑案例
router.post('/update',(req,res) => {
    let codeId = req.body.codeId;
    let obj = {};
    obj.codeTitle = req.body.codeTitle;
    obj.infoSrc = req.body.infoSrc;
    obj.viewSrc =  req.body.viewSrc;
    obj.downSrc = req.body.downSrc;
    obj.codeImg = req.body.codeImg;

    let category = null;
    db.Code.findOne({codeId:codeId}).then((current)=>{
        category = current.category;
        return db.Code.update({codeId:codeId},obj);
    }).then(()=>{
        return db.CodeCategory.findOne({category:category});
    }).then((currentCate)=>{
        currentCate.code.forEach((item,index) =>{
            if(item.id == codeId){
                item.title = obj.codeTitle;
            }
        });
        return db.CodeCategory.update({category:category},{code:currentCate.code});
    }).then(() => {
        let data = {};
        data.success = 1;
        res.json(data);
    });
});

//删除案例
router.post('/delete',(req,res) => {
    let codeId = req.body.id;
    let category = null;
    db.Code.findOne({codeId:codeId}).then((current) => {
        let data = {};
        if(!current){
            data.success = 0;
            data.errMsg = "该案例不存在";
            res.json(data);
            return false;
        }else{
            category = current.category;
            db.Code.update({codeId:codeId},{status:-1}).then(()=>{
                return db.CodeCategory.findOne({category:category});
            }).then((currentCate) =>{
                currentCate.code.forEach((item, index) => {
                    if (item.id == codeId) {
                        currentCate.code.splice(item.index, 1);
                    }
                });
                return db.CodeCategory.update({ category: category }, { code: currentCate.code });
            }).then(() => {
                data.success = 1;
                res.json(data);
            });
        }
    })
});

//查询
router.post('/search', (req, res) => {
    var codeId = req.body.id;

    db.Code.findOne({ codeId: codeId }).then((current) => {
        let data = {};
        data.success = 1;
        data.code = current;
        res.json(data);
    });
});

//发布
router.post('/push',(req,res) => {
    
    let codeId = req.body.codeId;
    db.Code.findOne({codeId:codeId}).then((code)=>{
        return db.CodeCategory.findOne({category:code.category});
    }).then((category) => {
        category.code.forEach((item, index) => {
            if (item.id == codeId) {
                item.status = 1;
            }
        });
        return db.CodeCategory.update({_id:category._id},{code:category.code});
    }).then(()=>{
        return db.Code.update({codeId:codeId},{status:1});
    }).then(() => {
        let data ={success:1};
        res.json(data);
    });
});



module.exports = router;