let blur = document.getElementById('blur');
let popup = document.getElementById('popup');

function deleteOffer(id, productID) {
    console.log(id,productID)
    axios.delete('/adminLogin/coupon', { data: { id } })
        .then(function(response) {
            console.log(response);
            // Optionally, redirect to another page after successful deletion
            location.href ='/adminLogin/coupon'
        })
        .catch(function(err) {
            console.log(err);
        });
}

const status = document.querySelectorAll('.status')
for(let i=0;i<status.length;i++){
    if(status[i].innerText === 'Listed'){
        status[i].style.color='green'
    }else{
        status[i].style.color='red'
    }
}

function changeStatus(currStatus,id){
    axios.patch('/adminLogin/coupon?task=changeStatus', {currStatus,id})
        .then(function(response) {
            console.log(response)
            location.href ='/adminLogin/coupon'
        })
        .catch(function(err) {
            console.log(err)
        })
}



function addCoupon(){
    console.log('popup')
    blur.classList.toggle('active');
    document.getElementById('blur').style.backgroundColor = 'rgba(0, 0, 0, 0.7);' /* Dark semi-transparent background */
    popup.classList.toggle('active');
}


function btnCancel(){
    document.getElementById('code').value=''
    blur.classList.remove('active');
    popup.classList.remove('active');
}

async function GenerateCode() {
    try {
        axios.post('/adminLogin/coupon?task=generateCode', {})
        .then(function(response) {
            console.log(response)
            document.getElementById('code').value=response.data.message
        })
        .catch(function(err) {
            console.log(err)
        })
        // Handle response if needed
    } catch (error) {
        console.log(error);
    }
}

function createCoupon(){
    try {
        let code =  document.getElementById('code').value
        let discountAmt = document.getElementById('percentage').value
        let title = document.getElementById('title').value
        let start = document.getElementById('start').value
        let expireOn = document.getElementById('expire').value
        let min = document.getElementById('min').value
        let max = document.getElementById('max').value
        console.log(discountAmt,expireOn,' : expireOn')
        axios.post('/adminLogin/coupon?task=addCoupon', {code,discountAmt,title,start,expireOn,min,max})
        .then(function(response) {
            console.log(response)
            location.href('coupon')
        })
        .catch(function(err) {
            console.log(err)
        })
        // Handle response if needed
    } catch (error) {
        
    }
}