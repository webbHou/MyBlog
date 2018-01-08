const express = require('express');
const bodyParser =  require('body-parser');
const cookieParser = require('cookie-parser');
const swig = require('swig');
const mongoose = require('mongoose');

const cms = require('./routes/cms/index');
const website = require('./routes/website/index');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));

app.use(cookieParser());
app.use('/public',express.static('public'));

app.engine('html',swig.renderFile);
app.set('views','./views');
app.set('view engine','html');

app.use('/',website);
app.use('/cms',cms);

mongoose.Promise = global.Promise;  
mongoose.connect('mongodb://localhost:27018/blog', (err) => {
    if (err) {
        console.log('数据库连接失败！');
    }else{
        console.log('数据库连接成功！');
        app.listen(3033);
    }
});