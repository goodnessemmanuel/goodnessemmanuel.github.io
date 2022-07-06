$(document).ready(function () {
    console.log('dom ready')
    handleScroll();
});

$(document).on('scroll', () => {
    handleScroll();
})

function handleScroll() {
    var scrollValue = $(this).scrollTop();
    handleNavbar(scrollValue);

    console.log(window.innerHeight)
    if (window.innerHeight < 700) {
        handleNavbar(2);
    }
    if(window.innerWidth <= 991 && window.innerHeight < 700 ){
        
    }
}

function handleNavbar(scrollValue) {
    if (scrollValue > 1) {
        $('#hexadNav').addClass('navbar-white');
        $('#hexadNav').removeClass('navbar-transparent');
        $('#hexadLogo').attr('src', "/assets/images/hexad-logo.png");
        if(window.innerWidth <= 991 && scrollValue > 2){
            $('#hexadLogo').attr('src', "/assets/images/hexad-logo-black.png");
        } else {
            $('#hexadLogo').attr('src', "/assets/images/hexad-logo.png");
        }
    }
    else {
        $('#hexadNav').addClass('navbar-transparent');
        $('#hexadNav').removeClass('navbar-white');
        if(window.innerWidth <= 991 && scrollValue > 0){
            $('#hexadLogo').attr('src', "/assets/images/hexad-logo-black.png");
        } else {
            $('#hexadLogo').attr('src', "/assets/images/hexad-logo-white.png");
        }
    }
}


$('a.page-scroll').on('click', function (event) {
    event.preventDefault();
    var $anchor = $(this);

    if($($anchor.attr('href')).offset() != undefined) {
      $('html, body').stop().animate({
          scrollTop: ($($anchor.attr('href')).offset().top + 1)
      }, 110, 'easeInOutExpo');
    }
});
