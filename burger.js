document.addEventListener('DOMContentLoaded', function() {
    const burger = document.querySelector('.burger a');
    const mobileNav = document.querySelector('.mobile-nav');

    burger.addEventListener('click', function(event) {
        event.preventDefault(); // Предотвращает переход по ссылке
        mobileNav.classList.toggle('show');
    });
});

