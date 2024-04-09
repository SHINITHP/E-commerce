const Selectpayment = document.getElementById('Selectpayment');

            if(Selectpayment.checked){
                Selectpayment.value='Cash On Delivery'
            }
            
            function CancelOrder() {
                let blur = document.getElementById('blur');
                blur.classList.remove('active');

                let popup = document.getElementById('SuccessDiv');
                popup.classList.remove('active');
            }

            function ConfirmOrder(ProductData,userAddress) {
                let fetchAddress= JSON.parse(userAddress)
                const addressID = fetchAddress.map((val) => val._id) 
                console.log(addressID,'addressID')
                const paymentMethod = document.getElementById('Selectpayment').value
               axios.post('/checkOut?task=saveOrderDetails', {ProductData : ProductData,paymentMethod : paymentMethod,addressID:addressID}) // Sending productID as data
               .then(function (response) {
                   // Handle success response if needed
               })
               .catch(function (error) {
                   console.error('Error adding product to cart:', error);
                   // Handle error if needed
               });

                const confirmation = document.querySelector('.confirmation')
                const SuccessRow = document.querySelector('.SuccessRow')

                confirmation.style.display = 'none'
                SuccessRow.style.display = 'block'
                SuccessRow.style.display = 'flex'

                
            }

            
        
            function successMessage() {
            
                if (Selectpayment.checked) {
                    console.log('i am here....')
                    let blur = document.getElementById('blur');
                    blur.classList.toggle('active');

                    let popup = document.getElementById('SuccessDiv');
                    popup.classList.toggle('active');
                }
                else{
                    
                    const confirmation = confirm('Please Select Your Payment Method');
                    if (!confirmation) {
                        document.querySelector('.selectPayment h5').style.color='red'
                        event.preventDefault(); // Prevent form submission
                    }
                }


            }

            const cartTotal = document.getElementById('cartTotal')
            const cartTotal1 = document.getElementById('cartTotal1')
            const totalAmount = document.querySelectorAll('.TotalAmount');
            const discount = document.querySelectorAll('.discount');
            const toTalAmount = document.getElementById('toTalAmount')
            let sum = 0;


            for (let i = 0; i < discount.length; i++) {
                sum = sum + parseFloat(discount[i].innerText)
                document.getElementById('discountAmt').innerHTML = sum
                document.getElementById('discountAmt1').innerHTML = sum
            }
            sum = 0;

            toTalAmount.innerHTML = parseFloat(cartTotal.innerHTML) - parseFloat(document.getElementById('discountAmt').innerText)
            document.getElementById('toTalAmount1').innerHTML =parseFloat(cartTotal.innerHTML) - parseFloat(document.getElementById('discountAmt').innerText)
            function quantityIncrement(index, price, type) {
                const showQty = document.getElementById(`showQty${index}`)
                const totalInput = document.getElementById(`totalPrice${index}`)
                const discountAmt = document.getElementById(`discount${index}`)
                let ExactDiscAmt;
                if (type === 'increment') {
                    let totalPrice = parseFloat(totalInput.value)
                    let quantity = parseFloat(showQty.value)
                    ExactDiscAmt = parseFloat(discountAmt.innerText) / parseFloat(showQty.value)
                    showQty.value = quantity + 1
                    let addQty = parseFloat(showQty.value)
                    console.log(addQty, price)
                    totalInput.innerHTML = addQty * price
                    cartTotal.innerHTML = parseFloat(cartTotal.innerText) + parseFloat(price)
                    cartTotal1.innerHTML = parseFloat(cartTotal1.innerText) + parseFloat(price)
                    discountAmt.innerHTML = parseFloat(discountAmt.innerText) + parseFloat(ExactDiscAmt)
                    document.getElementById('discountAmt').innerHTML = parseFloat(document.getElementById('discountAmt').innerText) + parseFloat(ExactDiscAmt)
                    toTalAmount.innerHTML = parseFloat(cartTotal.innerHTML) - parseFloat(document.getElementById('discountAmt').innerText)
                    document.getElementById('toTalAmount1').innerHTML = parseFloat(cartTotal.innerHTML) - parseFloat(document.getElementById('discountAmt').innerText)
                }
                else if (type === 'decrement') {
                    let totalPrice = parseFloat(totalInput.value)
                    let quantity = parseFloat(showQty.value)
                    ExactDiscAmt = parseFloat(discountAmt.innerText) / parseFloat(showQty.value)
                    showQty.value = quantity - 1
                    let addQty = parseFloat(showQty.value)
                    console.log(addQty, price)
                    totalInput.innerHTML = addQty * price
                    cartTotal.innerHTML = parseFloat(cartTotal.innerText) - parseFloat(price)
                    cartTotal1.innerHTML = parseFloat(cartTotal1.innerText) - parseFloat(price)
                    discountAmt.innerHTML = parseFloat(discountAmt.innerText) - parseFloat(ExactDiscAmt)
                    document.getElementById('discountAmt').innerHTML = parseFloat(document.getElementById('discountAmt').innerText) - parseFloat(ExactDiscAmt)
                    toTalAmount.innerHTML = parseFloat(cartTotal.innerHTML) - parseFloat(document.getElementById('discountAmt').innerText)
                    document.getElementById('toTalAmount1').innerHTML = parseFloat(cartTotal.innerHTML) - parseFloat(document.getElementById('discountAmt').innerText)

                }
            }


            function selectDeliveryAddress(addressID) {
                axios.put('/checkOut?task=selectDeleveryAddress', { addressID: addressID }) // Sending productID as data
                    .then(function (response) {
                        // Handle success response if needed
                    })
                    .catch(function (error) {
                        console.error('Error adding product to cart:', error);
                        // Handle error if needed
                    });
            }




            function removeProducts(id) {
                axios.post('/checkOut?task=removeProducts', { id: id }) // Sending productID as data
                    .then(function (response) {
                        // Handle success response if needed
                    })
                    .catch(function (error) {
                        console.error('Error adding product to cart:', error);
                        // Handle error if needed
                    });
            }


            const conF2 = document.getElementById('OrderBox')
            const conF1 = document.getElementById('addressBox')
            document.getElementById('changeBtn').addEventListener('click', function () {
                console.log('i am heree....')
                conF2.style.display = 'none'
                conF1.style.display = 'block'
            })


            function updateAddress(index,id) {
                const updateBtn = document.querySelector(`.update[data-index="${index}"]`);
                const removeBtn = document.querySelector(`.remove[data-index="${index}"]`);
                const cancelBtn = document.querySelector(`.cancelBtn[data-index="${index}"]`);
                console.log(cancelBtn);
                const form = document.getElementById(`form_${index}`);
                form.style.display = 'block'; // Show the corresponding form
                updateBtn.style.display = 'none'
                removeBtn.style.display = 'none'
                cancelBtn.style.display = 'block'
            }
            function cancelUpdate(index) {
                const updateBtn = document.querySelector(`.update[data-index="${index}"]`);
                const removeBtn = document.querySelector(`.remove[data-index="${index}"]`);
                const cancelBtn = document.querySelector(`.cancelBtn[data-index="${index}"]`);
                console.log(cancelBtn);
                const form = document.getElementById(`form_${index}`);
                form.style.display = 'none'; // Show the corresponding form
                updateBtn.style.display = 'block'
                removeBtn.style.display = 'block'
                cancelBtn.style.display = 'none'
            }

            document.getElementById('addAddressDiv').addEventListener('click', function () {
                document.getElementById('addAddressDiv').style.display = 'none'
                document.getElementById('addAddress').style.display = 'block'
                document.getElementById('addAddressCancel').style.display = 'block'
            })

            document.getElementById('addAddressCancel').addEventListener('click', function () {
                document.getElementById('addAddress').style.display = 'none'
                document.getElementById('addAddressDiv').style.display = 'block'
                document.getElementById('addAddressDiv').style.display = 'flex'
            })