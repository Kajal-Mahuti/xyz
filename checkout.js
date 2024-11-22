let listCart = [];
function checkCart(){
        var cookieValue = document.cookie
        .split('; ')
        .find(row => row.startsWith('listCart='));
        if(cookieValue){
            listCart = JSON.parse(cookieValue.split('=')[1]);
        }
}
checkCart();
addCartToHTML();
function addCartToHTML(){
    // clear data default
    let listCartHTML = document.querySelector('.returnCart .list');
    listCartHTML.innerHTML = '';

    let totalQuantityHTML = document.querySelector('.totalQuantity');
    let totalPriceHTML = document.querySelector('.totalPrice');
    let totalQuantity = 0;
    let totalPrice = 0;
    // if has product in Cart
    if(listCart){
        listCart.forEach(product => {
            if(product){
                let newCart = document.createElement('div');
                newCart.classList.add('item');
                newCart.innerHTML = 
                    `<img src="${product.image}">
                    <div class="info">
                        <div class="name">${product.name}</div>
                        <div class="price">Rs.${product.price}/1 product</div>
                    </div>
                    <div class="quantity">${product.quantity}</div>
                    <div class="returnPrice">Rs.${product.price * product.quantity}</div>`;
                listCartHTML.appendChild(newCart);
                totalQuantity = totalQuantity + product.quantity;
                totalPrice = totalPrice + (product.price * product.quantity);
            }
        })
    }
    totalQuantityHTML.innerText = totalQuantity;
    totalPriceHTML.innerText = 'Rs.' + totalPrice;
}

    const checkboxes = document.querySelectorAll('.product-checkbox');
    const totalQuantityEl = document.getElementById('totalQuantity');
    const totalPriceEl = document.getElementById('totalPrice');
    const selectedProductsInput = document.getElementById('selectedProducts');

    let selectedProducts = [];
    let totalQuantity = 0;
    let totalPrice = 0;

    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', (event) => {
            const product = {
                id: event.target.getAttribute('data-id'),
                name: event.target.getAttribute('data-name'),
                price: parseInt(event.target.getAttribute('data-price')),
                quantity: parseInt(event.target.getAttribute('data-quantity'))
            };

            if (event.target.checked) {
                selectedProducts.push(product);
                totalQuantity += product.quantity;
                totalPrice += product.price * product.quantity;
            } else {
                selectedProducts = selectedProducts.filter(p => p.id !== product.id);
                totalQuantity -= product.quantity;
                totalPrice -= product.price * product.quantity;
            }

            // Update the display
            totalQuantityEl.textContent = `Total Quantity: ${totalQuantity}`;
            totalPriceEl.textContent = `Total Price: Rs. ${totalPrice}`;

            // Update hidden input with selected products
            selectedProductsInput.value = JSON.stringify(selectedProducts);
        });
    });
