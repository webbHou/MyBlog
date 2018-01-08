$('#addMd').on('click', function () {
    let category = $(this).attr('data-category');
    let tag = $(this).attr('data-tag');
    $.post('/cms/code/create', {
        category: category
    }, function (res) {
        if (res.success == 1) {
            var html = '<li class="active" data-tag="' + tag + '" data-id="' + res.id + '" data-type="content">';
            html += '<p class="mdTitle">无标题案例</p>';
            html += '<i class="iconfont icon-shanchu delete" data-type="content"></i>';
            html += '</li>';
            $('.middleList .mdList')
                .find('li')
                .removeClass('active')
                .find('.delete')
                .addClass('none');
            $('.middleList .mdList').prepend(html);
            $('#codeTitle')
                .val('无标题案例')
                .focus();
            $('#infoSrc').val('');
            $('#viewSrc').val('');
            $('#downSrc').val('');
            $('#codeImg').val('');
            $('#codeId').val(res.code.codeId);
        }
    }, 'json')
});

$('#codeTitle').on('blur',function(){
    var title = $(this).val();
    $('.middleList .mdList li.active').find('.mdTitle').text(title);
});

$('#saveBtn').on('click', function () {
    var obj = {};
    obj.codeTitle = $('#codeTitle').val();
    obj.infoSrc = $('#infoSrc').val();
    obj.viewSrc = $('#viewSrc').val();
    obj.downSrc = $('#downSrc').val();
    obj.codeImg = $('#codeImg').val();
    if (obj.codeTitle == '') {
        alert('请填写案例标题！');
        $('#codeTitle').focus();
        return false;
    }
    if (obj.infoSrc == '') {
        alert('请填写查看地址！');
        $('#infoSrc').focus();
        return false;
    }
    if (obj.viewSrc == '') {
        alert('请填写预览地址！');
        $('#viewSrc').focus();
        return false;
    }
    if (obj.downSrc == '') {
        alert('请填写源码地址！');
        $('#downSrc').focus();
        return false;
    }
    if (obj.codeImg == '') {
        alert('请上传封面！');
        $('#codeImg').focus();
        return false;
    }

    obj.codeId = $('#codeId').val();
    console.log(obj);

    $.post('/cms/code/update',obj,function(res){
        if(res.success == 1){
            alert('保存成功！');
        }
    },'json');
   
});

$('#resetBtn').on('click',function(){
    $('#codeTitle').val('').focus();
    $('#infoSrc').val('');
    $('#viewSrc').val('');
    $('#downSrc').val('');
    $('#codeImg').val('');
});

//发布
$('#pushBtn').on('click', function () {
    var codeId = $('#codeId').val();
    var obj = {};
    obj.codeTitle = $('#codeTitle').val();
    obj.infoSrc = $('#infoSrc').val();
    obj.viewSrc = $('#viewSrc').val();
    obj.downSrc = $('#downSrc').val();
    obj.codeImg = $('#codeImg').val();
    if (obj.codeTitle == '') {
        alert('请填写案例标题！');
        $('#codeTitle').focus();
        return false;
    }
    if (obj.infoSrc == '') {
        alert('请填写查看地址！');
        $('#infoSrc').focus();
        return false;
    }
    if (obj.viewSrc == '') {
        alert('请填写预览地址！');
        $('#viewSrc').focus();
        return false;
    }
    if (obj.downSrc == '') {
        alert('请填写源码地址！');
        $('#downSrc').focus();
        return false;
    }
    if (obj.codeImg == '') {
        alert('请上传封面！');
        $('#codeImg').focus();
        return false;
    }
    $.post('/cms/code/push', {
        codeId: codeId
    }, function (res) {
        if (res.success == 1) {
            $('.middleList .mdList')
                .find('li.active')
                .addClass('push');
        }
    }, 'json');
});