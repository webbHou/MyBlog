const express = require('express');
const router = express.Router();

const db = require('../db/db');

router.get('/',(req,res) => {
    if(req.cookies.userInfo === undefined){
        res.redirect('/cms/login');
        return false;
    }
    let data = {};
    db.BookCategory.find().then((currentList) => {
        if(currentList.length == 0){
            return new db.BookCategory({
                category:'Other'
            }).save()
        }
    }).then(() => {
        return db.BookCategory.find({status:1});
    }).then((category) => {
        data.categories = category.reverse();
        let bookList = category[0].book.reverse();
        data.list = bookList;
        data.index = 0;
        data.tag = 'book';
        data.title = '新建书籍';
        if(bookList.length > 0){
            let bookId = bookList[0].id;
            db.Book.findOne({bookId:bookId}).then((current) => {
                data.book = current;
                res.render('cms/book.html', data);
            });
        }else{
            res.render('cms/book.html', data);
        }
    });
});

//查询分类
router.post('/category', (req, res) => {
    let category = req.body.category;
    //通过分类名查询分类
    db.BookCategory.findOne({ category: category }).then((category) => {
        let data = {};
        data.list = category.book.reverse();
        res.json(data);
    });
});

//创建分类
router.post('/category/create', (req, res) => {
    let category = req.body.category;

    db.BookCategory.findOne({ category: category }).then((curren) => {
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
                new db.BookCategory({
                category: category
            }).save().then(() => {
                let data = {};
                data.success = 1;
                data.tag = 'book';
                data.category = category;
                res.json(data);
            });
        }

    })
});

//删除分类
router.post('/category/delete', (req, res) => {
    
    let category = req.body.category;

    db.BookCategory.findOne({ category: category }).then((curren) => {
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
            db.BookCategory.update({ category: category }, { status: 0 }).then(() => {
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
    new db.Book({
        category: category
    }).save().then((book) => {
        item.id = book.bookId;
        item.title = book.bookTitle;
        item.status = 0;
        data.book = book;
        return db.BookCategory.findOne({ category: category });
    }).then((currenCate) => {
        currenCate.book.push(item);
        return db.BookCategory.update({ category: category }, { book: currenCate.book })
    }).then(() => {
        data.success = 1;
        res.json(data);
    });

});

//编辑案例
router.post('/update',(req,res) => {
    let bookId = req.body.bookId;
    let obj = {};
    obj.bookTitle = req.body.bookTitle;
    obj.buySrc =  req.body.buySrc;
    obj.downSrc = req.body.downSrc;
    obj.bookImg = req.body.bookImg;

    let category = null;
    db.Book.findOne({bookId:bookId}).then((current)=>{
        category = current.category;
        return db.Book.update({bookId:bookId},obj);
    }).then(()=>{
        return db.BookCategory.findOne({category:category});
    }).then((currentCate)=>{
        currentCate.book.forEach((item,index) =>{
            if(item.id == bookId){
                item.title = obj.bookTitle;
            }
        });
        return db.BookCategory.update({category:category},{book:currentCate.book});
    }).then(() => {
        let data = {};
        data.success = 1;
        res.json(data);
    });
});

//删除案例
router.post('/delete',(req,res) => {
    let bookId = req.body.id;
    let category = null;
    db.Book.findOne({bookId:bookId}).then((current) => {
        let data = {};
        if(!current){
            data.success = 0;
            data.errMsg = "该案例不存在";
            res.json(data);
            return false;
        }else{
            category = current.category;
            db.Book.update({bookId:bookId},{status:-1}).then(()=>{
                return db.BookCategory.findOne({category:category});
            }).then((currentCate) =>{
                currentCate.book.forEach((item, index) => {
                    if (item.id == bookId) {
                        currentCate.book.splice(item.index, 1);
                    }
                });
                return db.BookCategory.update({ category: category }, { book: currentCate.book });
            }).then(() => {
                data.success = 1;
                res.json(data);
            });
        }
    })
});

//查询
router.post('/search', (req, res) => {
    var bookId = req.body.id;

    db.Book.findOne({ bookId: bookId }).then((current) => {
        let data = {};
        data.success = 1;
        data.book = current;
        res.json(data);
    });
});

//发布
router.post('/push',(req,res) => {
    
    let bookId = req.body.bookId;
    db.Book.findOne({bookId:bookId}).then((book)=>{
        return db.BookCategory.findOne({category:book.category});
    }).then((category) => {
        category.book.forEach((item, index) => {
            if (item.id == bookId) {
                item.status = 1;
            }
        });
        return db.BookCategory.update({_id:category._id},{book:category.book});
    }).then(()=>{
        return db.Book.update({bookId:bookId},{status:1});
    }).then(() => {
        let data ={success:1};
        res.json(data);
    });
});



module.exports = router;