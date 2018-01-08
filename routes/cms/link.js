const express = require('express');
const router = express.Router();

const db = require('../db/db');

router.get('/',(req,res) => {
    if(req.cookies.userInfo === undefined){
        res.redirect('/cms/login');
        return false;
    }
    let data = {};
    db.LinkCategory.find().then((currentList) => {
        if(currentList.length == 0){
            return new db.LinkCategory({
                category:'友链'
            }).save()
        }
    }).then(() => {
        return db.LinkCategory.find({status:1});
    }).then((category) => {
        data.categories = category.reverse();
        let linkList = category[0].link.reverse();
        data.list = linkList;
        data.index = 0;
        data.tag = 'link';
        data.title = '新建链接';
        if(linkList.length > 0){
            let linkId = linkList[0].id;
            db.Link.findOne({linkId:linkId}).then((current) => {
                data.link = current;
                res.render('cms/link.html', data);
            });
        }else{
            res.render('cms/link.html', data);
        }
    });
});

//查询分类
router.post('/category', (req, res) => {
    let category = req.body.category;
    //通过分类名查询分类
    db.LinkCategory.findOne({ category: category }).then((category) => {
        let data = {};
        data.list = category.link.reverse();
        res.json(data);
    });
});

//创建分类
router.post('/category/create', (req, res) => {
    let category = req.body.category;

    db.LinkCategory.findOne({ category: category }).then((curren) => {
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
                new db.LinkCategory({
                category: category
            }).save().then(() => {
                let data = {};
                data.success = 1;
                data.tag = 'link';
                data.category = category;
                res.json(data);
            });
        }

    })
});

//删除分类
router.post('/category/delete', (req, res) => {
    
    let category = req.body.category;

    db.LinkCategory.findOne({ category: category }).then((curren) => {
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
            db.LinkCategory.update({ category: category }, { status: 0 }).then(() => {
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
    new db.Link({
        category: category
    }).save().then((link) => {
        item.id = link.linkId;
        item.title = link.linkTitle;
        item.status = 0;
        item.url = '';
        data.link = link;
        return db.LinkCategory.findOne({ category: category });
    }).then((currenCate) => {
        currenCate.link.push(item);
        return db.LinkCategory.update({ category: category }, { link: currenCate.link })
    }).then(() => {
        data.success = 1;
        res.json(data);
    });

});

//编辑案例
router.post('/update',(req,res) => {
    let linkId = req.body.linkId;
    let obj = {};
    obj.linkTitle = req.body.linkTitle;
    obj.linkUrl = req.body.linkUrl;

    let category = null;
    db.Link.findOne({linkId:linkId}).then((current)=>{
        category = current.category;
        return db.Link.update({linkId:linkId},obj);
    }).then(()=>{
        return db.LinkCategory.findOne({category:category});
    }).then((currentCate)=>{
        currentCate.link.forEach((item,index) =>{
            if(item.id == linkId){
                item.title = obj.linkTitle;
            }
        });
        return db.LinkCategory.update({category:category},{link:currentCate.link});
    }).then(() => {
        let data = {};
        data.success = 1;
        res.json(data);
    });
});

//删除案例
router.post('/delete',(req,res) => {
    let linkId = req.body.id;
    let category = null;
    db.Link.findOne({linkId:linkId}).then((current) => {
        let data = {};
        if(!current){
            data.success = 0;
            data.errMsg = "该链接不存在";
            res.json(data);
            return false;
        }else{
            category = current.category;
            db.Link.update({linkId:linkId},{status:-1}).then(()=>{
                return db.LinkCategory.findOne({category:category});
            }).then((currentCate) =>{
                currentCate.link.forEach((item, index) => {
                    if (item.id == linkId) {
                        currentCate.link.splice(item.index, 1);
                    }
                });
                return db.LinkCategory.update({ category: category }, { link: currentCate.link });
            }).then(() => {
                data.success = 1;
                res.json(data);
            });
        }
    })
});

//查询
router.post('/search', (req, res) => {
    var linkId = req.body.id;

    db.Link.findOne({ linkId: linkId }).then((current) => {
        let data = {};
        data.success = 1;
        data.link = current;
        res.json(data);
    });
});

//发布
router.post('/push',(req,res) => {
    
    let linkId = req.body.linkId;
    let url = null;
    db.Link.findOne({linkId:linkId}).then((link)=>{
        url = link.linkUrl;
        return db.LinkCategory.findOne({category:link.category});
    }).then((category) => {
        category.link.forEach((item, index) => {
            if (item.id == linkId) {
                item.status = 1;
                item.url = url;
            }
        });

        return db.LinkCategory.update({_id:category._id},{link:category.link});
    }).then(()=>{
        return db.Link.update({linkId:linkId},{status:1});
    }).then(() => {
        let data ={success:1};
        res.json(data);
    });
});



module.exports = router;