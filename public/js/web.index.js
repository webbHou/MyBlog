$(function () {
    var $bLi = $('.bigImg').find('li');
    var $sLi = $('.smallImg').find('li');
    var $len = $bLi.length;
    var timer = null;

    $sLi.on('click', function () {
        var $this = $(this);
        var $index = $(this).index();
        setAnimate($this, $index);
    });

    function setAnimate(obj, index) {
        clearInterval(timer);
        $sLi.find('.timerLine').css({"width": "0"});
        $bLi.eq(index).fadeIn().siblings().fadeOut();
        setTimer(obj, index);
    }
    function setTimer(obj, index) {
        var iSpeed = 0.5;
        var iCur = 0;
        timer = setInterval(function () {
            iCur += iSpeed;
            if (iCur > 100) {
                clearInterval(timer);
                if (index == $len - 1) {
                    index = 0;
                } else {
                    index += 1;
                }
                setAnimate($sLi.eq(index), index);
                return false;
            }
            obj.find('.timerLine').css({"width": iCur + "%"});
        }, 20);
    }

    setAnimate($sLi.eq(0), 0);

});
