document.addEventListener('DOMContentLoaded', function() {
    const basketItemsContainer = document.querySelector('.basket-items');
    const savedBasket = JSON.parse(localStorage.getItem('basket')) || [];
    
    const itemCounts = savedBasket.reduce((acc, item) => {
        if (!acc[item.title]) {
            acc[item.title] = 0;
        }
        acc[item.title] += item.quantity;
        return acc;
    }, {});

    let totalAmount = 0;

    for (const [item, count] of Object.entries(itemCounts)) {
        const itemElement = document.createElement('div');
        itemElement.classList.add('basket-item');

        const basketItem = savedBasket.find(b => b.title === item);
        const itemPrice = basketItem ? basketItem.price : 0;
        totalAmount += itemPrice * count;

        console.log(`Item: ${item}, Count: ${count}, Price: ${itemPrice}`); // Логирование значений для отладки

        itemElement.innerHTML = `
            <span class="item-name">${item}</span>
            <button class="decrement">-</button>
            <span class="item-count">${count}</span>
            <button class="increment">+</button>
            <span class="item-total-price">(${itemPrice * count}₽)</span>
        `;
        basketItemsContainer.appendChild(itemElement);
    }

    const totalAmountElement = document.createElement('div');
    totalAmountElement.classList.add('total-amount');
    totalAmountElement.textContent = `Итого: ${totalAmount}₽`;
    basketItemsContainer.appendChild(totalAmountElement);
    totalAmountElement

    basketItemsContainer.addEventListener('click', function(event) {
        if (event.target.classList.contains('increment') || event.target.classList.contains('decrement')) {
            const itemElement = event.target.closest('.basket-item');
            const itemName = itemElement.querySelector('.item-name').textContent;
            let itemCount = parseInt(itemElement.querySelector('.item-count').textContent);

            let basket = JSON.parse(localStorage.getItem('basket')) || [];
            const itemIndex = basket.findIndex(item => item.title === itemName);
            const itemPrice = basket[itemIndex].price;

            if (event.target.classList.contains('increment')) {
                itemCount++;
                basket[itemIndex].quantity = itemCount;
            } else if (event.target.classList.contains('decrement') && itemCount > 0) {
                itemCount--;
                basket[itemIndex].quantity = itemCount;
                if (itemCount === 0) {
                    basket.splice(itemIndex, 1);
                }
            }

            itemElement.querySelector('.item-count').textContent = itemCount;
            itemElement.querySelector('.item-total-price').textContent = `(${itemPrice * itemCount}Р)`;
            localStorage.setItem('basket', JSON.stringify(basket));

            // Пересчитаем и обновим общую сумму
            totalAmount = basket.reduce((sum, item) => sum + item.price * item.quantity, 0);
            totalAmountElement.textContent = `Итого: ${totalAmount}₽`;
        }
    });

    function setCookie(name, value, minutes) {
        const date = new Date();
        date.setTime(date.getTime() + (minutes * 60 * 1000));
        const expires = `expires=${date.toUTCString()}`;
        document.cookie = `${name}=${value};${expires};path=/`;
    }

    function getCookie(name) {
        const nameEQ = `${name}=`;
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            let cookie = cookies[i];
            while (cookie.charAt(0) === ' ') cookie = cookie.substring(1);
            if (cookie.indexOf(nameEQ) === 0) return cookie.substring(nameEQ.length, cookie.length);
        }
        return null;
    }

    document.querySelector('.submit-button').addEventListener('click', function() {
        const attempts = parseInt(getCookie('attempts')) || 0;
        const lastSubmitted = parseInt(getCookie('lastSubmitted')) || 0;
        const now = Date.now();
    
        if (attempts >= 3 && now - lastSubmitted < 60 * 60 * 1000) {
            alert('Вы достигли лимита отправок. Пожалуйста, подождите час перед следующей попыткой.');
            return;
        } else if (attempts >= 3) {
            setCookie('attempts', 0, 60);
        }
    
        setCookie('attempts', attempts + 1, 60);
        setCookie('lastSubmitted', now, 60);
    
        const fullName = document.getElementById('fullName').value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;
        const address = document.getElementById('address').value;
    
        // Валидация номера телефона
        const phoneRegex = /^\+7\d{10}$/;
        if (!phoneRegex.test(phone)) {
            alert('Номер телефона должен начинаться с +7 и содержать 10 цифр.');
            return;
        }
    
        const updatedBasket = JSON.parse(localStorage.getItem('basket')) || [];
        let itemsText = '';
        let totalPrice = 0;
    
        updatedBasket.forEach(item => {
            const itemTotalPrice = item.price * item.quantity;
            itemsText += `${item.title} x${item.quantity} (${itemTotalPrice}₽)\n`; // Новый абзац для каждого товара
            totalPrice += itemTotalPrice;
        });
    
        itemsText += `\nИтого: ${totalPrice}₽`; // Добавляем общую стоимость
    
        const mailtoLink = `mailto:doomerzooma@gmail.com?subject=Заказ&body=${encodeURIComponent(itemsText)}%0A%0AФИО: ${encodeURIComponent(fullName)}%0AЭлектронная почта: ${encodeURIComponent(email)}%0AНомер телефона: ${encodeURIComponent(phone)}%0AМесто жительства: ${encodeURIComponent(address)}`;
        window.location.href = mailtoLink;
    });
    
    function setCookie(name, value, minutes) {
        const date = new Date();
        date.setTime(date.getTime() + (minutes * 60 * 1000));
        const expires = `expires=${date.toUTCString()}`;
        document.cookie = `${name}=${value};${expires};path=/`;
    }
    
    function getCookie(name) {
        const nameEQ = `${name}=`;
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            let cookie = cookies[i];
            while (cookie.charAt(0) === ' ') cookie = cookie.substring(1);
            if (cookie.indexOf(nameEQ) === 0) return cookie.substring(nameEQ.length, cookie.length);
        }
        return null;
    }
    
    
    

    const updateCatalogWithBasket = function() {
        const basket = JSON.parse(localStorage.getItem('basket')) || [];
        const cards = document.querySelectorAll('.product_card');
        cards.forEach(card => {
            const productTitle = card.querySelector('.product_card__header').textContent;
            const basketItem = basket.find(item => item.title === productTitle);
            if (basketItem) {
                updateCardQuantity(card, basketItem.quantity);
            } else {
                const quantityControls = card.querySelector('.quantity-controls');
                if (quantityControls) {
                    quantityControls.outerHTML = `<button class="product_card__btn">В корзину</button>`;
                    card.querySelector('.product_card__btn').addEventListener('click', addToBasketHandler);
                }
            }
        });
    }

    updateCatalogWithBasket();
});
