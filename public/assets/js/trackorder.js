const changeIcon = document.getElementById('changeIcon');
const dropDownLi1 = document.getElementById('DropDownLi1');
const dropDownLi2 = document.getElementById('DropDownLi2');
let isDropDownVisible = true;

changeIcon.addEventListener('click', function () {
    let icon = document.getElementById('icon');

    if (isDropDownVisible) {
        icon.innerHTML = '&#xf107;'; // Change to the new icon
        dropDownLi1.style.display = 'block';
        dropDownLi2.style.display = 'block';


    } else {
        icon.innerHTML = '&#xf105;'; // Change back to the original icon
        dropDownLi1.style.display = 'none';
        dropDownLi2.style.display = 'none';
    }

    // Toggle the state
    isDropDownVisible = !isDropDownVisible;
});

function cancelOrder() {

    let blur = document.getElementById('blur');
    blur.classList.toggle('active');

    let popup = document.getElementById('SuccessDiv');
    popup.classList.toggle('active');

    let body = document.querySelector('body');

    // Add a class to the body to stop scrolling
    body.classList.add('stop-scrolling');

}

document.getElementById('cancelBtn').addEventListener('click', function () {

    let blur = document.getElementById('blur');
    blur.classList.remove('active');

    let popup = document.getElementById('SuccessDiv');
    popup.classList.remove('active');

    let body = document.querySelector('body');

    // Add a class to the body to stop scrolling
    body.classList.remove('stop-scrolling');

})

function submitRequest(orderID) {

    const reqReason = document.getElementById('canceldropdown').value;
    const optionalReason = document.getElementById('reqReason');
    const data = optionalReason.value


    console.log('document.getElementBy', orderID, reqReason, data)
    let blur = document.getElementById('blur');
    blur.classList.remove('active');

    let popup = document.getElementById('SuccessDiv');
    popup.classList.remove('active');

    let body = document.querySelector('body');

    // Add a class to the body to stop scrolling
    body.classList.remove('stop-scrolling');

    Swal.fire({
        icon: 'success',
        text: 'Request Successfully Sended!',
        timer: 5000, // Duration in milliseconds
        toast: true,
        position: 'top', // Toast position
        showConfirmButton: false // Hide confirmation button
    });

    function send(orderID, reqReason, data) {
        axios.put('/profileMenu?type=cancelRequest', { orderID, reqReason, data }) // Sending productID as data
            .then(function (response) {
                // Handle success response if needed
            })
            .catch(function (error) {
                console.error('Error adding product to cart:', error);
                // Handle error if needed
            });
    }

    send(orderID, reqReason, data)

}

function returnOrder(){

    const submitOrder = document.querySelector('.submit-Order')
    SuccessDiv.style.height = '300px'
    document.querySelector('.returnOrder').style.display='none'
    submitOrder.style.display = 'block'
    submitOrder.style.display = 'flex'
    console.log('return ',orderID)
    let content = 'Your return request is being processed. Expect confirmation shortly';
    document.getElementById('content').innerHTML = content
    const reason = document.getElementById('returndropdown').value
    const optionalreason = document.getElementById('requestReason').value
    
    console.log(optionalreason)
    axios.put('/profileMenu?type=returnOrder', {orderID,reason,optionalreason}) // Sending productID as data
    .then(function (response) {
        // Handle success response if needed
       
    })
    .catch(function (error) {
        console.error('Error adding product to cart:', error);
        // Handle error if needed
    });
}