const express = require('express');
const fs = require('fs');
const marked = require('marked');
const router = express.Router();

const db = require('../db/db');

//设置Markede插件
marked.setOptions({
    renderer: new marked.Renderer(),
    gfm: true,
    tables: true,
    breaks: false,
    pedantic: false,
    sanitize: true,
    smartLists: true,
    smartypants: false
});

//首页
router.get('/',(req,res) => {

    let data = {};
    db.Book.find({status:1}).sort({$natural: -1}).limit(3).then((bookList) =>{
        data.bookList = bookList;
        return db.Blog.find({status:1}).sort({$natural: -1}).limit(6);
    }).then((blogList) =>{
        blogList.forEach((item) => {
            let url = './docs/push/' + item._id + '.md';
            let content = fs.readFileSync(url,'utf-8');
            item.content = marked(content).replace(/<.*?>/ig,"").slice(0,300);
            item.content += '...';
            item.createDate = getDate(item.createTime);
        });
        data.blogList = blogList;
        res.render('website/index.html',data);
    });
    
});

//博客首页
router.get('/blog',(req,res) =>{
    let page = Number(req.query.page || 1);
    let limit = 10;
    let data = {};
    db.Blog.where({status:1}).count().then((count) => {
        data.pageCount = Math.ceil(count / limit);
        data.page = Math.min(page,data.pageCount);
        data.page = Math.max(page,1);
        data.pageArr = [];
        for(let i = 1; i <= data.pageCount ;i++){
            data.pageArr.push(i);
        }
        let skip = (data.page  - 1) * limit;
        return db.Blog.where({status:1}).find().sort({$natural: -1}).limit(limit).skip(skip);
    }).then((blogs) =>{
        blogs.forEach((item) => {
            let url = './docs/push/' + item._id + '.md';
            let content = fs.readFileSync(url,'utf-8');
            item.content = marked(content).replace(/<.*?>/ig,"").slice(0,300);
            item.content += '...';
            item.createDate = getDate(item.createTime);
        });
        data.list = blogs;
        data.main = 'blog';
        return db.BlogCategory.find({status:1});
       
    }).then((category) => {
        data.category = category.reverse();
        res.render('website/blogList.html',data);
    });
});

//博客分类
router.get('/blog/category/:category',(req,res) =>{
    let category = req.params.category;
    let page = Number(req.query.page || 1);
    let limit = 10;
    let data = {};
    db.Blog.where({category:category,status:1}).count().then((count) => {
        data.pageCount = Math.ceil(count / limit);
        data.page = Math.min(page,data.pageCount);
        data.page = Math.max(page,1);
        data.pageArr = [];
        for(let i = 1; i <= data.pageCount ;i++){
            data.pageArr.push(i);
        }
        let skip = (data.page  - 1) * limit;
        return db.Blog.where({category:category,status:1}).find().sort({$natural: -1}).limit(limit).skip(skip);
    }).then((blogs) =>{
        blogs.forEach((item) => {
            let url = './docs/push/' + item._id + '.md';
            let content = fs.readFileSync(url,'utf-8');
            item.content = marked(content).replace(/<.*?>/ig,"").slice(0,300);
            item.content += '...';
            item.createDate = getDate(item.createTime);
        });
        data.list = blogs;
        data.main = 'blog/category/'+category;
        return db.BlogCategory.find({status:1});
    }).then((category) => {
        data.category = category.reverse();
        res.render('website/blogList.html',data);
    });
});

//博客内容页
router.get('/blog/blog/:id',(req,res) => {
    let blogId = req.params.id;
    let data = {};
    db.Blog.findOne({blogId:blogId}).then((blog) => {
        data.blog = blog;
        data.blog.createDate = getDate(blog.createTime);
        data.click = blog.click + 1;
        let url = './docs/push/'+ blog._id + '.md';
        let content = fs.readFileSync(url,'utf-8');
        data.content = marked(content);
        return db.Blog.update({blogId:blogId},{click:blog.click+1});
    }).then(() =>{   
        return db.Blog.where({status:1}).find({createTime:{$lt: data.blog.createTime}}).sort({$natural:-1}).limit(1);
    }).then((nextBlog) =>{
        data.next = nextBlog[0];
        return db.Blog.where({status:1}).find({createTime:{$gt: data.blog.createTime}}).limit(1);
    }).then((prevBlog) => {
        data.prev = prevBlog[0];
        res.render('website/blog.html',data);
    });
});

//源码案例
router.get('/code',(req,res) =>{
    let page = Number(req.query.page || 1);
    let limit = 10;
    let data = {};
    db.Code.where({status:1}).count().then((count) => {
        data.pageCount = Math.ceil(count / limit);
        data.page = Math.min(page,data.pageCount);
        data.page = Math.max(page,1);
        data.pageArr = [];
        for(let i = 1; i <= data.pageCount ;i++){
            data.pageArr.push(i);
        }
        let skip = (data.page  - 1) * limit;
        return db.Code.where({status:1}).find().sort({$natural: -1}).limit(limit).skip(skip);
    }).then((code) =>{
        data.list = code;
        data.main = 'code';
        return db.CodeCategory.find({status:1});
       
    }).then((category) => {
        data.category = category.reverse();
        res.render('website/code.html',data);
    });
});

router.get('/code/category/:category',(req,res) =>{
    let category = req.params.category;
    let page = Number(req.query.page || 1);
    let limit = 10;
    let data = {};
    db.Code.where({category:category,status:1}).count().then((count) => {
        data.pageCount = Math.ceil(count / limit);
        data.page = Math.min(page,data.pageCount);
        data.page = Math.max(page,1);
        data.pageArr = [];
        for(let i = 1; i <= data.pageCount ;i++){
            data.pageArr.push(i);
        }
        let skip = (data.page  - 1) * limit;
        return db.Code.where({category:category,status:1}).find().sort({$natural: -1}).limit(limit).skip(skip);
    }).then((code) =>{
        data.list = code;
        data.main = 'code/'+category;
        return db.CodeCategory.find({status:1});
       
    }).then((category) => {
        data.category = category.reverse();
        res.render('website/code.html',data);
    });
});

//阅读人生
router.get('/book',(req,res) =>{
    let page = Number(req.query.page || 1);
    let limit = 10;
    let data = {};
    db.Book.where({status:1}).count().then((count) => {
        data.pageCount = Math.ceil(count / limit);
        data.page = Math.min(page,data.pageCount);
        data.page = Math.max(page,1);
        data.pageArr = [];
        for(let i = 1; i <= data.pageCount ;i++){
            data.pageArr.push(i);
        }
        let skip = (data.page  - 1) * limit;
        return db.Book.where({status:1}).find().sort({$natural: -1}).limit(limit).skip(skip);
    }).then((book) =>{
        data.list = book;
        data.main = 'book';
        return db.BookCategory.find({status:1});
       
    }).then((category) => {
        data.category = category.reverse();
        res.render('website/book.html',data);
    });
});

router.get('/book/category/:category',(req,res) =>{
    let category = req.params.category;
    let page = Number(req.query.page || 1);
    let limit = 10;
    let data = {};
    db.Book.where({category:category,status:1}).count().then((count) => {
        data.pageCount = Math.ceil(count / limit);
        data.page = Math.min(page,data.pageCount);
        data.page = Math.max(page,1);
        data.pageArr = [];
        for(let i = 1; i <= data.pageCount ;i++){
            data.pageArr.push(i);
        }
        let skip = (data.page  - 1) * limit;
        return db.Book.where({category:category,status:1}).find().sort({$natural: -1}).limit(limit).skip(skip);
    }).then((book) =>{
        data.list = book;
        data.main = 'book/'+category;
        return db.BookCategory.find({status:1});
       
    }).then((category) => {
        data.category = category.reverse();
        res.render('website/book.html',data);
    });
});

//网站导航
router.get('/link',(req,res) => {
    let data = {};
    db.LinkCategory.find({status:1}).then((cateList) => {
        cateList.forEach((item) => {
            item.link.reverse();
        });
        data.list =  cateList.reverse();
        res.render('website/link.html',data);
    });
});


function getDate(time){
    let date = new Date(time);
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    let day = date.getDate();
    return `${year}-${month}-${day}`;
}

module.exports = router;