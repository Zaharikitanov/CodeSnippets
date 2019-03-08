jQuery(document).ready(function ($) {

    if (window.history && window.history.pushState) {

        if (document.referrer.toLowerCase().indexOf("login") > 0) {
            window.history.pushState('forward', null, '');
        }

        $(window).on('popstate', function () {
            if (document.referrer.toLowerCase().indexOf("login") > 0) {
                window.history.pushState('forward', null, '');
            } else {
                window.history.go(-1);
            }
        });
    }
});
