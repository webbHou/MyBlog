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

router.get('/', (req, res) => {
    if(req.cookies.userInfo === undefined){
        res.redirect('/cms/login');
        return false;
    }
    let data = {};
    db.BlogCategory.find().then((currenList) => {
        //查询所有分类
        //如果没有分类，则创建一个other分类
        if (currenList.length == 0) {
            return new db.BlogCategory({
                category: 'Other'
            }).save();
        }
    }).then(() => {
        //否则，就查询status为1的所有分类
        return db.BlogCategory.find({ status: 1 });
    }).then((category) => {
        //获取分类消息
        data.categories = category.reverse();
        let blogList = category[0].blog.reverse();
        data.list = blogList;//该分类下的博客列表
        data.index = 0;
        data.tag = 'blog';
        data.title = '新建博客';//新建标题
        //如果博客数量大于0 ，则查询该分类下的第一篇博客
        //否则直接渲染页面
        if(blogList.length > 0){
            let blogId = blogList[0].id;
            db.Blog.findOne({blogId:blogId}).then((current) => {
                //获取查询博客的内容
                let url = './docs/save/' + current._id + '.md';//地址
                let title = current.blogTitle;//标题
                let content = fs.readFileSync(url, 'utf-8');//读取博客
                let html = `# ${title} # \n ${content}`;//预览博客
        
                data.html = marked(html);
                data.blogTitle = title;
                data.content = content;
                data.blogId = current.blogId;
                res.render('cms/blog.html', data);
            });
        }else{
            res.render('cms/blog.html', data);
        }
    })

});

//查询分类
router.post('/category', (req, res) => {
    let category = req.body.category;
    //通过分类名查询分类
    db.BlogCategory.findOne({ category: category }).then((category) => {
        let data = {};
        data.list = category.blog.reverse();
        res.json(data);
    });

});

//创建分类
router.post('/category/create', (req, res) => {

    let category = req.body.category;

    db.BlogCategory.findOne({ category: category }).then((curren) => {
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
             new db.BlogCategory({
                category: category
            }).save().then(() => {
                let data = {};
                data.success = 1;
                data.tag = 'blog';
                data.category = category;
                res.json(data);
            });
        }

    })
});

//删除分类
router.post('/category/delete', (req, res) => {

    let category = req.body.category;

    db.BlogCategory.findOne({ category: category }).then((curren) => {
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
            db.BlogCategory.update({ category: category }, { status: 0 }).then(() => {
                data.success = 1;
                res.json(data);
            });
        }
    })
});

//创建博客
router.post('/create', (req, res) => {
    let category = req.body.category;
    let item = {};
    let data = {};
    new db.Blog({
        category: category
    }).save().then((blog) => {
        //首页通过分类创建博客
        //获取新博客的信息
        //在docs文件夹下，通过其_id 创建与之对应的md文件
        let id = blog.blogId;
        let _id = blog._id
        item.id = id;
        item.title = blog.blogTitle;
        item.status = 0;
        data.id = id;
        fs.createWriteStream('./docs/save/' + _id + '.md');
        return db.BlogCategory.findOne({ category: category });
    }).then((currenCate) => {
        //然后，查询分类，将新博客的标题和blogId存入分类中
        currenCate.blog.push(item);
        return db.BlogCategory.update({ category: category }, { blog: currenCate.blog })
    }).then(() => {
        data.success = 1;   
        res.json(data);
    });

});

//编辑博客
router.post('/update', (req, res) => {

    //实时编辑博客
    //首先，获取实时的博客信息
    let blogId = req.body.blogId;
    let title = req.body.title;
    let content = req.body.content;

    let html = `# ${title} # \n ${content}`;

    let category = null;

    db.Blog.findOne({ blogId: blogId }).then((current) => {
        //查询到该博客
        category = current.category;
        //写入文件
        let url = './docs/save/' + current._id + '.md';
        let writeStream = fs.createWriteStream(url);
        writeStream.write(content);
        writeStream.end();
        //判断改博客的标题是否更改
        //如果更改，则更新
        //否则，返回新的博客消息
        if (title !== current.blogTitle) {
            db.Blog.update({ blogId: blogId }, { blogTitle: title }).then(() =>{
                //更新完博客标题后，更改分类里对应的博客标题
                return db.BlogCategory.findOne({ category: category });
            }).then((currentCate) => {
                currentCate.blog.forEach((item, index) => {
                    if (item.id == blogId) {
                        item.title = title;
                    }
                });
                return db.BlogCategory.update({ category: category }, { blog: currentCate.blog });
            })
        }else{

        }
    }).then(() => {
        let data = {};
        data.success = 1;
        data.html = marked(html);
        res.json(data);
    });
});

//删除博客
router.post('/delete', (req, res) => {

    let blogId = req.body.id;
    let category = null;

    db.Blog.findOne({ blogId: blogId }).then((current) => {
        //首先查询该博客是否存在
        //如果不存在，则返回“该博客不存在”
        //否则，将该博客的status设置为-1
        let data = {};
        if (!current) {
            data.success = 0;
            data.errMsg = "该博客不存在";
            res.json(data);
            return false;
        }else{
            category = current.category;
            db.Blog.update({ blogId: blogId }, { status: -1 }).then(() => {
                //然后，将查询该博客的分类
                return db.BlogCategory.findOne({ category: category });
            }).then((currentCate) => {
                //将分类中的博客删除掉
                currentCate.blog.forEach((item, index) => {
                    if (item.id == blogId) {
                        currentCate.blog.splice(item.index, 1);
                    }
                });
                return db.BlogCategory.update({ category: category }, { blog: currentCate.blog });
            }).then(() => {
                data.success = 1;
                fs.unlink('./docs/push/'+ current._id +'.md');
                res.json(data);
            });
        }
    })
      
});

//查询博客
router.post('/search', (req, res) => {
    var blogId = req.body.id;

    db.Blog.findOne({ blogId: blogId }).then((current) => {
        //获取博客的信息
        //读取博客的内容
        let url = './docs/save/' + current._id + '.md';
        let title = current.blogTitle;
        let content = fs.readFileSync(url, 'utf-8');

        let html = `# ${title} # \n ${content}`;

        let data = {};
        data.success = 1;
        data.content = content;
        data.title = current.blogTitle;
        data.html = marked(html);
        res.json(data);
    });
});

//发布博客
router.post('/push',(req,res) => {

    let blogId = req.body.blogId;

    db.Blog.findOne({blogId:blogId}).then((blog)=>{
        let url = './docs/save/'+blog._id+'.md';
        let content = fs.readFileSync(url,'utf-8');
        let writeStream = fs.createWriteStream('./docs/push/'+blog._id+'.md');
        writeStream.write(content);
        writeStream.end();
        return db.BlogCategory.findOne({category:blog.category});
    }).then((category) => {
        category.blog.forEach((item, index) => {
            if (item.id == blogId) {
               item.status = 1;
            }
        });
        return db.BlogCategory.update({_id:category._id},{blog:category.blog});
    }).then(()=>{
        return db.Blog.update({blogId:blogId},{status:1});
    }).then(() => {
        let data ={success:1};
        res.json(data);
    });
});


module.exports = router;