const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const userSchema = new Schema({
    //用户名
    username: {
        type: String,
        default: 'webb'
    },
    //密码
    password: {
        type: String,
        default: '512260'
    }
});

//博客
const blogSchema = new Schema({
    //博客序列
    blogId: {
        type: Number,
        default: Date.now
    },
    //博客标题
    blogTitle: {
        type: String,
        default: '无标题博客'
    },
    //博客路径
    blogPath: String,
    //博客分类
    category: String,
    //博客状态
    status: { // -1为删除，0为未发布，1为发布
        type: Number,
        default: 0
    },
    //点击量
    click: {
        type: Number,
        default: 0
    },
    //创建时间
    createTime: {
        type: Date,
        default: new Date()
    }

});

//博客分类
const blogCategorySchema = new Schema({
    //类名
    category: String,
    //博客数量
    blog: {
        type: Array,
        default: []
    },
    //分类状态
    status: { //0为删除，1为存在
        type: Number,
        default: 1
    }
});

//书籍
const bookSchema = new Schema({
    bookId: {
        type: Number,
        default: Date.now
    },
    //书名
    bookTitle: {
        type: String,
        default: '无标题'
    },
    //分类
    category: String,
    //封面
    bookImg: String,
    //下载地址
    downSrc: String,
    //购买地址
    buySrc: String,
    status: { // -1为删除，0为未发布，1为发布
        type: Number,
        default: 0
    }
});

//书籍分类
const bookCategorySchema = new Schema({
    //分类
    category: String,
    //书籍列表
    book: {
        type: Array,
        default: []
    },
    //分类状态
    status: { //0为删除，1为存在
        type: Number,
        default: 1
    }
});

//案例
const codeSchema = new Schema({
    //案例标题
    codeTitle: {
        type: String,
        default: '无标题案例'
    },
    //博客序列
    codeId: {
        type: Number,
        default: Date.now
    },
    //案例截图
    codeImg: String,
    //案例分类
    category: String,
    //案例详情
    infoSrc: String,
    //预览地址
    viewSrc: String,
    //下载地址
    downSrc: String,
    status: { // -1为删除，0为未发布，1为发布
        type: Number,
        default: 0
    }
});

//案例分类
const codeCategorySchema = new Schema({
    //分类
    category: String,
    //案例列表
    code: {
        type: Array,
        default: []
    },
    //分类状态
    status: { //0为删除，1为存在
        type: Number,
        default: 1
    }
});

//链接分类
const linkCategorySchema  = new Schema({
    //分类
    category:String,
    //列表
    link:{
        type:Array,
        default:[]
    },
    //分类状态
    status:{
        type:Number,
        default:1
    }
});

//链接
const linkSchema = new Schema({
    linkTitle:String,
    linkUrl:String,
    category:String,
    linkId:{
        type: Number,
        default: Date.now
    },
    status:{
        type:Number,
        default:0
    }
});

const Models = {
    User: mongoose.model('User', userSchema),
    Blog: mongoose.model('Blog', blogSchema),
    BlogCategory: mongoose.model('BlogCategory', blogCategorySchema),
    Code: mongoose.model('Code', codeSchema),
    CodeCategory: mongoose.model('CodeCategory', codeCategorySchema),
    Book: mongoose.model('Book', bookSchema),
    BookCategory: mongoose.model('BookCategory', bookCategorySchema),
    Link: mongoose.model('Link', linkSchema),
    LinkCategory: mongoose.model('LinkCategory', linkCategorySchema)
}

module.exports = Models;
