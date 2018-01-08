$(function() {
    //设置按钮
    $('#set').on('click',function(){
        $('.modal').show();
        $('.modal').find('input').val('');
    });

    $('.modal .close').on('click',function(){
        $(this).parents('.modal').hide();
    });

    $('.modal #submit').on('click',function(){
        var newPassword = $('#newPassword').val();
        if(newPassword == ''){
            $('.modal .tip').html('*请输入新密码!').show();
            $('#newPassword').focus();
            return false;
        }
        var rePassword = $('#rePassword').val();
        if(rePassword != newPassword){
            $('.modal .tip').html('*输入的密码不一致!').show();
            $('#rePassword').focus();
            return false;
        }

        $.post('/cms/set',{newPassword:newPassword},function(res){
            if(res.success == 1){
                location.href = "/cms/login";
            }else{
                $('.modal .tip').html('*'+res.errMsg).show();
            }
        },'json');
    });

    //新建分类
    $('#addCategory').on('click', function() {
        $(this).next('.createBox').slideToggle('slow');
    });

    //提交分类

    $('#commitAdd').on('click', function() {
        var $input = $('#categoryInput').val();
        if ($input == '') {
            alert('请填写分类名！');
            return;
        }
        var tag = $('#addCategory').attr('data-tag');
        $.post('/cms/' + tag + '/category/create', { category: $input }, function(res) {
            if (res.success == 1) {

                var html = '<li class="active" data-tag="' + res.tag + '" data-name="' + res.category + '" data-type="category">';
                html += '<p class="mdTitle">' + res.category + '</p>';
                html += '<i class="iconfont icon-shanchu delete"></i>';
                html += '</li>';

                $('.categoryList .mdList').find('li').removeClass('active').find('.delete').addClass('none');
                $('.categoryList .mdList').prepend(html);
                $('.middleList .mdList').html('');
                $('.createBox').slideUp('slow');
                $('#categoryInput').val('');
                $('#addMd').attr("data-category",$input);
            } else {
                alert(res.errMsg);
            }
        }, 'json')

    });

    //取消新建分类
    $('#cancelAdd').on('click', function() {
        $(this).parents('.createBox').slideUp('slow');
        $('#categoryInput').val('');
    });



    //选择分类或文档
    $(document).on('click', '.mdList li', function() {
        $(this).addClass('active').siblings().removeClass('active').find('.delete').addClass('none');
        $(this).find('.delete').removeClass('none');
        var type = $(this).attr('data-type');
        var tag = $(this).attr('data-tag');
        if (type == 'category') {
            var category = $(this).attr('data-name');
            $.post('/cms/' + tag + '/category', { category: category }, function(res) {
                var html = '';
                res.list.forEach(function(item, index) {
                    if (index === 0) {
                        if(item.status === 1){
                            html += '<li class="active push" data-id="' + item.id + '" data-tag="' + tag + '" data-type="content">';
                        }else{
                            html += '<li class="active" data-id="' + item.id + '" data-tag="' + tag + '" data-type="content">';
                        }
                    } else {
                        if(item.status === 1){
                            html += '<li  class="push"data-id="' + item.id + '" data-tag="' + tag + '" data-type="content">';
                        }else{
                            html += '<li data-id="' + item.id + '" data-tag="' + tag + '" data-type="content">';
                        }
                    }
                    html += '<p class="mdTitle">' + item.title + '</p>';
                    if (index === 0) {
                        html += '<i class="iconfont icon-shanchu delete" ></i>';
                    } else {
                        html += '<i class="iconfont icon-shanchu delete none" ></i>';
                    }
                    html += '</li>';
                });
                $('.middleList .mdList').html(html);
                if (res.list.length > 0) {
                    $('.middleList .mdList').find('li').eq(0).click();
                    location.href = '#/'+category+'/'+res.list[0].id;
                }else{
                    location.href = '#/'+category
                }
                $('#addMd').attr('data-category', category);
            }, 'json');
        } else {
            var id = $(this).attr('data-id');
            $.post('/cms/' + tag + '/search', { id: id }, function(res) {
                if (tag == 'blog') {
                    $('#markTitle').val(res.title);
                    $('#editArea').val(res.content);
                    $('.right').html(res.html);
                    $('#blogId').val(id);
                    $('pre code').each(function(i, block) {
                        hljs.highlightBlock(block);
                    });
                }else if(tag == 'code'){
                    $('#codeTitle').val(res.code.codeTitle);
                    $('#infoSrc').val(res.code.infoSrc);
                    $('#viewSrc').val(res.code.viewSrc);
                    $('#downSrc').val(res.code.downSrc);
                    $('#codeImg').val(res.code.codeImg);
                }else if(tag == 'book'){
                    $('#bookTitle').val(res.book.bookTitle);
                    $('#buySrc').val(res.book.buySrc);
                    $('#downSrc').val(res.book.downSrc);
                    $('#bookImg').val(res.book.bookImg);
                }else if(tag == 'link'){
                    $('#linkTitle').val(res.link.linkTitle);
                    $('#linkUrl').val(res.link.linkUrl);
                }
            }, 'json')
        }
    });

    //hover 删除按钮
    $(document).on('mouseenter', '.mdList .delete', function() {
        $(this).parents('li').css({ opacity: 0.8 });
    });
    $(document).on('mouseleave', '.mdList .delete', function() {
        $(this).parents('li').css({ opacity: 1 });
    });

    //删除
    $(document).on('click', '.mdList .delete', function(e) {
        e.stopPropagation();
        var $self = $(this);
        var $li = $(this).parents('li');
        var type = $li.attr('data-type');
        var tag = $li.attr('data-tag');
        if (type == 'category') {
            var category = $li.attr('data-name');
            $.post('/cms/' + tag + '/category/delete', { category: category }, function(res) {
                if (res.success == 1) {
                    $li.remove();
                    var $$li = $('.categoryList .mdList').find('li');
                    if ($$li.length > 0) {
                        $$li.eq(0).click();
                    }
                } else {
                    alert(res.errMsg);
                }
            }, 'json');
        } else {
            var id = $li.attr('data-id');
            $.post('/cms/' + tag + '/delete', { id: id }, function(res) {
                if (res.success == 1) {
                    $li.remove();
                    var $$li = $('.middleList .mdList').find('li');
                    if ($$li.length > 0) {
                        $$li.eq(0).click();
                    }else{
                        if(tag == 'blog'){
                            $('#markTitle').val('');
                            $('#editArea').val('');
                            $('.right').html('');
                        }else if(tag == 'code'){
                            $('#codeTitle').val('');
                            $('#infoSrc').val('');
                            $('#viewSrc').val('');
                            $('#downSrc').val('');
                            $('#codeImg').val('');
                        }else if(tag == 'book'){
                            $('#bookTitle').val('');
                            $('#buySrc').val('');
                            $('#downSrc').val('');
                            $('#bookImg').val('');
                        }else if(tag == 'link'){
                            $('#linkTitle').val('');
                            $('#linkUrl').val('');
                        }
                    }
                } else {
                    alert(res.errMsg);
                }
            });
        }
    });
});