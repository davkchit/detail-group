// feedbackCarousel.js
document.addEventListener('DOMContentLoaded', function() {
    const feedbacks = Array.from(document.querySelectorAll('.card_feedback'));
    const leftArrow = document.querySelector('.feedback__arrow--left');
    const rightArrow = document.querySelector('.feedback__arrow--right');
    let cardsPerView = getCardsPerView();
    let currentIndex = 0;

    // Функция для определения количества видимых карточек
    function getCardsPerView() {
        if (window.innerWidth <= 750) {
            return 1; // 1 карточка для телефона
        } else if (window.innerWidth <= 1250) {
            return 2; // 2 карточки для планшета
        } else {
            return 3; // 3 карточки для десктопа
        }
    }

    // Функция для обновления видимых отзывов
    function updateFeedbacks() {
        feedbacks.forEach((feedback, index) => {
            feedback.style.display = 'none';
        });

        for (let i = 0; i < cardsPerView; i++) {
            let feedbackIndex = (currentIndex + i) % feedbacks.length;
            feedbacks[feedbackIndex].style.display = 'block';
        }
    }

    // Обработчик нажатия на стрелочку влево
    leftArrow.addEventListener('click', function(event) {
        event.preventDefault();
        currentIndex = (currentIndex > 0) ? currentIndex - 1 : feedbacks.length - 1;
        updateFeedbacks();
    });

    // Обработчик нажатия на стрелочку вправо
    rightArrow.addEventListener('click', function(event) {
        event.preventDefault();
        currentIndex = (currentIndex < feedbacks.length - 1) ? currentIndex + 1 : 0;
        updateFeedbacks();
    });

    // Инициализация видимых карточек
    updateFeedbacks();

    // Обновление карточек при изменении размера окна
    window.addEventListener('resize', function() {
        cardsPerView = getCardsPerView();
        updateFeedbacks();
    });
});
