$('#addMd').on('click', function () {
    let category = $(this).attr('data-category');
    let tag = $(this).attr('data-tag');
    $.post('/cms/book/create', {
        category: category
    }, function (res) {
        if (res.success == 1) {
            var html = '<li class="active" data-tag="' + tag + '" data-id="' + res.id + '" data-type="content">';
            html += '<p class="mdTitle">无标题</p>';
            html += '<i class="iconfont icon-shanchu delete" data-type="content"></i>';
            html += '</li>';
            $('.middleList .mdList')
                .find('li')
                .removeClass('active')
                .find('.delete')
                .addClass('none');
            $('.middleList .mdList').prepend(html);
            $('#bookTitle')
                .val('无标题')
                .focus();

            $('#buySrc').val('');
            $('#downSrc').val('');
            $('#bookImg').val('');
            $('#bookId').val(res.book.bookId);
        }
    }, 'json')
});

$('#bookTitle').on('blur', function () {
    var title = $(this).val();
    $('.middleList .mdList li.active')
        .find('.mdTitle')
        .text(title);
});

$('#saveBtn').on('click', function () {
    var obj = reg();
    obj.bookId = $('#bookId').val();

    $.post('/cms/book/update', obj, function (res) {
        if (res.success == 1) {
            alert('保存成功！');
        }
    }, 'json');

});

$('#resetBtn').on('click', function () {
    $('#bookTitle').val('').focus();
    $('#buySrc').val('');
    $('#downSrc').val('');
    $('#bookImg').val('');
});

//发布
$('#pushBtn').on('click', function () {
    var bookId = $('#bookId').val();
    reg();
    $.post('/cms/book/push', {
        bookId: bookId
    }, function (res) {
        if (res.success == 1) {
            $('.middleList .mdList')
                .find('li.active')
                .addClass('push');
        }
    }, 'json');
});

function reg() {
    var obj = {};
    obj.bookTitle = $('#bookTitle').val();
    obj.buySrc = $('#buySrc').val();
    obj.downSrc = $('#downSrc').val();
    obj.bookImg = $('#bookImg').val();
    if (obj.bookTitle == '') {
        alert('请填写书籍名称！');
        $('#bookTitle').focus();
        return false;
    }
    if (obj.downSrc == '') {
        alert('请填写源码地址！');
        $('#downSrc').focus();
        return false;
    }
    if (obj.buySrc == '') {
        alert('请填写购买地址！');
        $('#buySrc').focus();
        return false;
    }
    if (obj.bookImg == '') {
        alert('请上传封面！');
        $('#bookImg').focus();
        return false;
    }

    return obj;
}