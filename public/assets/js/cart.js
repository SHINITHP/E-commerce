
const cartTotal = document.getElementById('cartTotal')
const totalAmount = document.querySelectorAll('.TotalAmount');
const discount = document.querySelectorAll('.discount');

const availability = document.querySelectorAll('.availability')

for (let i = 0; i < availability.length; i++) {

    if (availability[i].innerText === 'In Stock') {
        availability[i].style.color = 'green'
    } else {
        availability[i].style.color = 'red'
    }

}


const Qty = document.querySelectorAll('.Qty')
const dec = document.querySelectorAll('.dec') 
for(let i =0;i<Qty.length;i++){
    if(Qty[i].value == 1){
        dec[i].disabled = true
    }
}

const TotalAmount = document.querySelectorAll('.TotalAmount')


const salesRate = document.querySelectorAll('.salesRate')
let totalDiscount =0,totalMrp=0;
for(let i=0;i<salesRate.length;i++){
    totalDiscount += parseFloat(discount[i].innerText) - parseFloat(salesRate[i].innerText) 
    console.log('totalDiscount',totalDiscount)
    document.getElementById('discountAmt').value = totalDiscount
    totalMrp += parseFloat(discount[i].innerText)
    document.getElementById('ExactPrice').value =totalMrp
    cartTotal.value = parseFloat(document.getElementById('ExactPrice').value)-totalDiscount
}



function quantityIncDec(index,id, price, type) {
    const showQty = document.getElementById(`showQty${index}`)
    const totalInput = document.getElementById(`totalPrice${index}`)
    const discountAmt = document.getElementById(`discount${index}`)
    let ExactDiscAmt;
    if (type === 'increment') {
        let quantity = parseFloat(showQty.value)
        showQty.value = quantity + 1
        let mrp = parseFloat(discountAmt.innerText)/parseFloat(showQty.value)
        discountAmt.innerHTML =  12133
        let addQty = parseFloat(showQty.value)
        totalInput.value = price*addQty
        
        console.log('mrp * addQty',mrp )
        // let totalPrice = parseFloat(totalInput.value)
        // ExactDiscAmt = parseFloat(discountAmt.innerText) / parseFloat(showQty.value)
        // discountAmt.innerHTML = parseFloat(discountAmt.innerText) + parseFloat(ExactDiscAmt)
        // totalInput.value = addQty * price - parseFloat(discountAmt.innerText)
        // document.getElementById('discountAmt').value = parseFloat(document.getElementById('discountAmt').value) + parseFloat(ExactDiscAmt)

        axios.patch('/shoppingcart', { newQty:addQty ,id,totalPrice:totalInput.value}) // Sending productID as data
        .then(function (response) {
            console.log('Product added to cart successfully', response);
            // Handle success response if needed
        })
        .catch(function (error) {
            console.error('Error adding product to cart:', error);
            // Handle error if needed
        });
    }
    else if (type === 'decrement') {
        if(showQty.value ==2){
            document.getElementById(`decrement${index}`).disabled = true;
        }
        let quantity = parseFloat(showQty.value)
        showQty.value = quantity - 1
        let addQty = parseFloat(showQty.value)
        totalInput.value = price*addQty
        // let totalPrice = parseFloat(totalInput.value)
        // let quantity = parseFloat(showQty.value)
        // ExactDiscAmt = parseFloat(discountAmt.innerText) / parseFloat(showQty.value)
        // showQty.value = quantity - 1
        // let addQty = parseFloat(showQty.value)
        // discountAmt.innerHTML = parseFloat(discountAmt.innerText) - parseFloat(ExactDiscAmt)
        // totalInput.value = addQty * price - parseFloat(discountAmt.innerText)
        // document.getElementById('discountAmt').value = parseFloat(document.getElementById('discountAmt').value) + parseFloat(ExactDiscAmt)

        axios.patch('/shoppingcart', { newQty:addQty ,id,totalPrice:totalInput.value}) // Sending productID as data
        .then(function (response) {
            console.log('Product added to cart successfully', response);
            // Handle success response if needed
        })
        .catch(function (error) {
            console.error('Error adding product to cart:', error);
            // Handle error if needed
        });
    }
}





function saveOrder(data) {
    console.log('I am here...');
    axios.post('/shoppingcart', { cartData: data }) // Sending productID as data
        .then(function (response) {
            console.log('Product added to cart successfully', response);
            // Handle success response if needed
        })
        .catch(function (error) {
            console.error('Error adding product to cart:', error);
            // Handle error if needed
        });
}




