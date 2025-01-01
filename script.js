document.addEventListener('DOMContentLoaded', function() {
    // Поиск товаров
    const searchInput = document.querySelector('.popular_items__search');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const searchValue = this.value.toLowerCase();
            const cards = document.querySelectorAll('.product_card');
            const parent = document.querySelector('.popular_items__cards');
            cards.forEach(card => {
                if (card.textContent.toLowerCase().includes(searchValue) || searchValue === '') {
                    card.classList.remove('hidden');
                    parent.insertBefore(card, parent.firstChild);
                } else {
                    card.classList.add('hidden');
                }
            });
        });
    }

    const updateBasket = function(basket) {
        console.log('Updating basket:', basket);
        localStorage.setItem('basket', JSON.stringify(basket));
        updateCatalogWithBasket();
    }

    const updateCatalogWithBasket = function() {
        const basket = getBasket();
        const cards = document.querySelectorAll('.product_card');
        cards.forEach(card => {
            const productTitle = card.querySelector('.product_card__header').textContent;
            const basketItem = basket.find(item => item.title === productTitle);
            if (basketItem) {
                updateCardQuantity(card, basketItem.quantity);
                initializeQuantityControls(card, productTitle);
            } else {
                const quantityControls = card.querySelector('.quantity-controls');
                if (quantityControls) {
                    quantityControls.outerHTML = `<button class="product_card__btn">В корзину</button>`;
                    card.querySelector('.product_card__btn').addEventListener('click', addToBasketHandler);
                }
            }
        });
    };

    const getBasket = function() {
        const basket = JSON.parse(localStorage.getItem('basket')) || [];
        console.log('Retrieved basket:', basket);
        return basket;
    }

    const updateCardQuantity = function(productCard, count) {
        let quantityControls = productCard.querySelector('.quantity-controls');
        if (!quantityControls) {
            quantityControls = document.createElement('div');
            quantityControls.classList.add('quantity-controls');
            productCard.querySelector('.product_card__btn').replaceWith(quantityControls);
        }
        quantityControls.innerHTML = `
            <button class="decrement">-</button>
            <span class="quantity">${count}</span>
            <button class="increment">+</button>
        `;
    }

    const initializeQuantityControls = function(productCard, productTitle) {
        const quantityControls = productCard.querySelector('.quantity-controls');
        const decrementButton = quantityControls.querySelector('.decrement');
        const incrementButton = quantityControls.querySelector('.increment');
        const quantityDisplay = quantityControls.querySelector('.quantity');
        let count = parseInt(quantityDisplay.textContent);

        const updateCount = function() {
            quantityDisplay.textContent = count;
            let basket = getBasket();
            const itemIndex = basket.findIndex(item => item.title === productTitle);
            if (itemIndex > -1) {
                basket[itemIndex].quantity = count;
                if (count === 0) {
                    basket.splice(itemIndex, 1);
                    quantityControls.innerHTML = `<button class="product_card__btn">В корзину</button>`;
                    productCard.querySelector('.product_card__btn').addEventListener('click', addToBasketHandler);
                }
            } else if (count > 0) {
                basket.push({ title: productTitle, quantity: count });
            }
            updateBasket(basket);
        };

        decrementButton.addEventListener('click', function() {
            if (count > 0) {
                count--;
                updateCount();
            }
        });

        incrementButton.addEventListener('click', function() {
            count++;
            updateCount();
        });
    };

    const addToBasketHandler = function(event) {
        event.stopPropagation();
        const productCard = this.closest('.catalog_product_card') || this.closest('.product_card');
        const productTitle = productCard.querySelector('.product_card__header').textContent;
        const productPrice = parseInt(productCard.querySelector('.product_card__price').textContent.replace(/\D/g, ''));
        console.log('Product Price:', productPrice);
        let basket = getBasket();
        const itemIndex = basket.findIndex(item => item.title === productTitle);
        if (itemIndex > -1) {
            basket[itemIndex].quantity += 1;
            basket[itemIndex].price = productPrice;
        } else {
            basket.push({ title: productTitle, quantity: 1, price: productPrice });
        }
        updateBasket(basket);
        updateCardQuantity(productCard, basket[itemIndex > -1 ? itemIndex : basket.length - 1].quantity);
        initializeQuantityControls(productCard, productTitle);
    }

    document.querySelectorAll('.product_card__btn').forEach(btn => {
        const productCard = btn.closest('.catalog_product_card') || btn.closest('.product_card');
        const productTitle = productCard.querySelector('.product_card__header').textContent;
        const basket = getBasket();
        const item = basket.find(item => item.title === productTitle);
        if (item) {
            updateCardQuantity(productCard, item.quantity);
            initializeQuantityControls(productCard, productTitle);
        } else {
            btn.addEventListener('click', addToBasketHandler);
        }
    });

    /* document.querySelectorAll('.product_card__img').forEach(img => {
        img.addEventListener('click', function(event) {
            event.stopPropagation();
            const productCard = this.closest('.catalog_product_card');
            const productImgElement = productCard.querySelector('.product_card__img');
            const productTitle = productCard.querySelector('.product_card__header').textContent;
            const productPrice = productCard.querySelector('.product_card__price').textContent;
            const productInfo = productCard.querySelector('.product_card__info').textContent; // Получаем описание
            const modalImg = document.querySelector('#modal-img');
            const modalTitle = document.querySelector('#modal-title');
            const modalPrice = document.querySelector('#modal-price');
            const modalInfo = document.querySelector('#modal-info'); // Добавляем элемент для описания
            modalImg.style.backgroundImage = productImgElement.style.backgroundImage;
            modalTitle.textContent = productTitle;
            modalPrice.textContent = productPrice;
            modalInfo.textContent = productInfo; // Добавляем описание в модальное окно
            document.querySelector('.modal').style.display = 'block';
        });
    });

    document.querySelector('#close-btn').addEventListener('click', function() {
        document.querySelector('.modal').style.display = 'none';
    }); */

    // Находим все изображения продукта
const images = Array.from(document.querySelectorAll('.product_card__img'));

// Обработчик кликов на продукте
images.forEach((img, index) => {
    img.addEventListener('click', function(event) {
        event.stopPropagation();
        const productCard = this.closest('.product_card');
        const productTitle = productCard.querySelector('.product_card__header').textContent;
        const productPrice = productCard.querySelector('.product_card__price').textContent;
        const productInfo = productCard.querySelector('.product_card__info').textContent;
        
        // Получаем массив ссылок на изображения из карточки товара
        const imageUrls = Array.from(productCard.querySelectorAll('.product_card__img')).map(img => img.style.backgroundImage.slice(5, -2));
        
        showModal(productTitle, productPrice, productInfo, imageUrls, index);
    });
});

let currentIndex = 0; // Переменная для хранения текущего индекса

// Функция для открытия модального окна
function showModal(title, price, info, imageUrls, startIndex) {
    const modal = document.querySelector('.modal');
    const modalTitle = document.querySelector('#modal-title');
    const modalPrice = document.querySelector('#modal-price');
    const modalInfo = document.querySelector('#modal-info');
    const carousel = document.querySelector('.carousel');
    
    // Очищаем карусель от предыдущих элементов
    carousel.innerHTML = '';

    let firstImageLoaded = false;

    // Заполняем карусель новыми элементами
    imageUrls.forEach((url, i) => {
        const carouselItem = document.createElement('div');
        carouselItem.className = 'carousel-item';
        carouselItem.style.backgroundImage = `url(${url})`;
        carousel.appendChild(carouselItem);

        // Создаем временное изображение для отслеживания загрузки
        const tempImg = new Image();
        tempImg.src = url;
        tempImg.onload = () => {
            if (!firstImageLoaded) {
                firstImageLoaded = true;
                activateInitialImage(startIndex);
            }
        };
    });

    // Функция для активации начальной картинки
    function activateInitialImage(index) {
        const carouselItems = document.querySelectorAll('.carousel-item');
        
        if (carouselItems.length > 0) {
            carouselItems.forEach(item => item.classList.remove('active'));
            
            // Если индекс выходит за границы допустимого диапазона, устанавливаем его равным 0
            if (index < 0 || index >= carouselItems.length) {
                index = 0;
            }
            
            carouselItems[index].classList.add('active');
        } else {
            console.warn("Элементы .carousel-item отсутствуют.");
        }
    }

    // Заполняем данные о товаре
    modalTitle.textContent = title;
    modalPrice.textContent = `${price} ₽`; // Добавляем символ рубля
    modalInfo.textContent = info;

    // Открываем модальное окно
    modal.style.display = 'block';

    // Навигация по карусели
    document.querySelector('#prev-btn').addEventListener('click', prevSlide);
    document.querySelector('#next-btn').addEventListener('click', nextSlide);
}

// Функция для перехода к предыдущему слайду
function prevSlide() {
    const carouselItems = document.querySelectorAll('.carousel-item');
    let currentActive = Array.from(carouselItems).findIndex(item => item.classList.contains('active'));
    
    let newIndex = currentActive - 1;
    if (newIndex < 0) {
        newIndex = carouselItems.length - 1;
    }
    updateCarousel(newIndex);
}

// Функция для перехода к следующему слайду
function nextSlide() {
    const carouselItems = document.querySelectorAll('.carousel-item');
    let currentActive = Array.from(carouselItems).findIndex(item => item.classList.contains('active'));
    
    let newIndex = currentActive + 1;
    if (newIndex >= carouselItems.length) {
        newIndex = 0;
    }
    updateCarousel(newIndex);
}

// Функция для обновления активной карточки в карусели
function updateCarousel(index) {
    const carouselItems = document.querySelectorAll('.carousel-item');
    
    // Проверим, существует ли такой индекс
    if (index >= 0 && index < carouselItems.length) {
        carouselItems.forEach(item => item.classList.remove('active'));
        carouselItems[index].classList.add('active');
    }
}

// Закрытие модального окна
document.querySelector('#close-btn').addEventListener('click', function() {
    document.querySelector('.modal').style.display = 'none';
    resetCarousel(); // Добавляем сброс состояния карусели

    // Удаляем обработчики событий
    document.querySelector('#prev-btn').removeEventListener('click', prevSlide);
    document.querySelector('#next-btn').removeEventListener('click', nextSlide);
});

function resetCarousel() {
    const carouselItems = document.querySelectorAll('.carousel-item');
    carouselItems.forEach(item => item.classList.remove('active'));
    carouselItems[0].classList.add('active'); // Устанавливаем первый элемент активным
    currentIndex = 0; // Сбрасываем индекс
}

const initializeMainPageCards = function() {
        console.log('Initializing main page cards');
        const cards = document.querySelectorAll('.product_card');
        cards.forEach(card => {
            const productTitle = card.querySelector('.product_card__header').textContent;
            const basket = getBasket();
            const item = basket.find(item => item.title === productTitle);
            if (item) {
                updateCardQuantity(card, item.quantity);
                initializeQuantityControls(card, productTitle);
            } else {
                card.querySelector('.product_card__btn').addEventListener('click', addToBasketHandler);
            }
        });
    };

    initializeMainPageCards();
});

document.addEventListener('DOMContentLoaded', function () {
    const products = Array.from(document.querySelectorAll('.second-set .product_card')); // Берём только карточки второго набора
    const nextButton = document.querySelector('.popular_items__next');
    const prevButton = document.querySelector('.popular_items__prev');
    let cardsPerView = 1; // Всегда показываем две карточки на экранах шире 560px
    let currentIndex = 0;

    // Функция для обновления видимых карточек
    function updateProducts() {
        products.forEach((product, index) => {
            product.style.display = 'none'; // Скрываем все карточки
        });

        for (let i = 0; i < cardsPerView && currentIndex + i < products.length; i++) {
            products[currentIndex + i].style.display = 'flex'; // Отображаем нужные карточки
        }
    }

    // Обработчик нажатия на кнопку "Вперед"
    nextButton.addEventListener('click', function (event) {
        event.preventDefault();
        currentIndex += cardsPerView;
        if (currentIndex >= products.length) {
            currentIndex = 0;
        }
        updateProducts();
    });

    // Обработчик нажатия на кнопку "Назад"
    prevButton.addEventListener('click', function (event) {
        event.preventDefault();
        currentIndex -= cardsPerView;
        if (currentIndex < 0) {
            currentIndex = products.length - cardsPerView;
        }
        updateProducts();
    });

    // Функция для управления отображением карточек в зависимости от ширины экрана
    function handleResize() {
        const windowWidth = window.innerWidth;

        if (windowWidth <= 560) {
            cardsPerView = 1;
            updateProducts();
        }
    }

    // Инициализация видимых карточек
    handleResize();

    // Обновляем карточки при изменении размера окна
    window.addEventListener('resize', handleResize);
});