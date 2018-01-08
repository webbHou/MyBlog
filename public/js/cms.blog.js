hljs.initHighlightingOnLoad();

//新建文档
$('#addMd').on('click', function() {
    let category = $(this).attr('data-category');
    let tag = $(this).attr('data-tag');
    $.post('/cms/blog/create', { category: category }, function(res) {
        if (res.success == 1) {
            var html = '<li class="active" data-tag="' + tag + '" data-id="' + res.id + '" data-type="content">';
            html += '<p class="mdTitle">无标题博客</p>';
            html += '<i class="iconfont icon-shanchu delete" data-type="content"></i>';
            html += '</li>';
            $('.middleList .mdList').find('li').removeClass('active').find('.delete').addClass('none');
            $('.middleList .mdList').prepend(html);
            $('#markTitle').val('无标题博客').focus();
            $('#editArea').val('');
            $('.right').html('');
            $('#blogId').val(res.id);
        }
    }, 'json')
});

//功能按键 粗体设置
$('#boldSet').on('click', function() {
    var str = $('#editArea').val();
    $('#editArea').val(str + '** text ** \n');
    transformMd();
});

//斜体设置
$('#xieSet').on('click', function() {
    var str = $('#editArea').val();
    $('#editArea').val(str + '*text* \n');
    transformMd();
});

//超链接设置
$('#httpSet').on('click', function() {
    var str = $('#editArea').val();
    $('#editArea').val(str + '[](http://) \n');
    transformMd();
});

//图片设置
$('#imgSet').on('click', function() {
    var str = $('#editArea').val();
    $('#editArea').val(str + '![]() \n');
    transformMd();
});

//表格设置
$('#tableSet').on('click', function() {
    var str = $('#editArea').val();
    $('#editArea').val(str + '| a | b | c | \n | --- | --- | --- | \n | 1 | 2 | 3 | \n');
    transformMd();
});

//预览设置
$('#previewSet').on('click', function() {
    var show = $(this).attr('data-show');
    if (show == 'false') {
        $('.editMark .right').removeClass('none');
        $(this)
            .parents('.left')
            .css({ width: '50%' });
        $(this).attr('data-show', true);
    } else {
        $('.editMark .right').addClass('none');
        $(this)
            .parents('.left')
            .css({ width: '100%' });
        $(this).attr('data-show', false);
    }
    fullScreen();
});

//发布
$('#refreshMd').on('click',function(){
    var blogId = $('#blogId').val();

    $.post('/cms/blog/push',{blogId:blogId},function(res){
        if(res.success == 1){
            $('.middleList .mdList').find('li.active').addClass('push');
        }
    },'json');
});

//全屏设置
$('#fullScreen').on('click', function() {
    fullScreen();
});

//退出全屏
$('#exitFullScreen').on('click', function() {
    exitFullScreen();
    $('.editMark .right').addClass('none');
    $('.editMark .left').css({ width: '100%' });
    $('#previewSet').attr('data-show', false);
});

//监听全屏
document.addEventListener('fullscreenchange', function() {
    if (document.fullscreenElement) {
        $('#fullScreen').css({ 'display': 'none' });
        $('#exitFullScreen').removeAttr('style');
    } else {
        $('#exitFullScreen').css({ 'display': 'none' });
        $('#fullScreen').removeAttr('style');
    }
}, false);
document.addEventListener('msfullscreenchange', function() {
    if (document.msFullscreenElement) {
        $('#fullScreen').css({ 'display': 'none' });
        $('#exitFullScreen').removeAttr('style');
    } else {
        $('#exitFullScreen').css({ 'display': 'none' });
        $('#fullScreen').removeAttr('style');
    }
}, false);
document.addEventListener('mozfullscreenchange', function() {
    if (document.mozFullScreen) {
        $('#fullScreen').css({ 'display': 'none' });
        $('#exitFullScreen').removeAttr('style');
    } else {
        $('#exitFullScreen').css({ 'display': 'none' });
        $('#fullScreen').removeAttr('style');
    }
}, false);
document.addEventListener('webkitfullscreenchange', function() {
    if (document.webkitIsFullScreen) {
        $('#fullScreen').css({ 'display': 'none' });
        $('#exitFullScreen').removeAttr('style');
    } else {
        $('#exitFullScreen').css({ 'display': 'none' });
        $('#fullScreen').removeAttr('style');
    }
}, false);

$('#editArea').on("keyup", function() {
    transformMd();
});

$('#markTitle').on('blur', function() {
    var title = $(this).val();
    $('.middleList .mdList li.active').find('.mdTitle').text(title);
    transformMd();
});

$('#saveMd').on('click', function() {
    transformMd();
});

//实时保存解析文档
function transformMd() {

    var content = $('#editArea').val();
    var title = $('#markTitle').val();
    var blogId = $('#blogId').val();
    $.post('/cms/blog/update', {
        content: content,
        title: title,
        blogId: blogId
    }, function(res) {
        $('.right').html(res.html);

        $('pre code').each(function(i, block) {
            hljs.highlightBlock(block);
        });
    }, 'json');
}

//进入全屏
function fullScreen() {
    var obj = document.getElementById('editMark');
    if (obj.requestFullScreen) {
        obj.requestFullScreen();
    } else if (obj.webkitRequestFullScreen) {
        obj.webkitRequestFullScreen();
    } else if (obj.msRequestFullScreen) {
        obj.msRequestFullScreen();
    } else if (obj.mozRequestFullScreen) {
        obj.mozRequestFullScreen();
    }
}

function exitFullScreen() {
    var obj = document.getElementById('editMark');
    if (document.exitFullscree) {
        document.exitFullscree();
    } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
    } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
    }
}