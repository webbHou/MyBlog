$('#addMd').on('click', function () {
    let category = $(this).attr('data-category');
    let tag = $(this).attr('data-tag');
    $.post('/cms/link/create', {
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
            $('#linkTitle')
                .val('无标题')
                .focus();

            $('#linkUrl').val('');
            $('#linkId').val(res.link.linkId);
        }
    }, 'json')
});

$('#linkTitle').on('blur', function () {
    var title = $(this).val();
    $('.middleList .mdList li.active')
        .find('.mdTitle')
        .text(title);
});

$('#saveBtn').on('click', function () {
    var obj = reg();
    obj.linkId = $('#linkId').val();

    $.post('/cms/link/update', obj, function (res) {
        if (res.success == 1) {
            alert('保存成功！');
        }
    }, 'json');

});

$('#resetBtn').on('click', function () {
    $('#linkTitle').val('').focus();
    $('#linkUrl').val('');
});

//发布
$('#pushBtn').on('click', function () {
    var linkId = $('#linkId').val();
    reg();
    $.post('/cms/link/push', {
        linkId: linkId
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
    obj.linkTitle = $('#linkTitle').val();
    obj.linkUrl= $('#linkUrl').val();
    if (obj.linkTitle == '') {
        alert('请填写链接名称！');
        $('#linkTitle').focus();
        return false;
    }
    if (obj.linkUrl == '') {
        alert('请填写链接地址！');
        $('#linkUrl').focus();
        return false;
    }

    return obj;
}