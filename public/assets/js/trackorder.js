

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

function returnCancelBtn(){
    let blur = document.getElementById('blur');
    blur.classList.remove('active');

    let popup = document.getElementById('SuccessDiv');
    popup.classList.remove('active');

    let body = document.querySelector('body');

    // Add a class to the body to stop scrolling
    body.classList.remove('stop-scrolling');
}

function btnReturnOrder(){
                    
    let blur = document.getElementById('blur');
    blur.classList.toggle('active');

    let popup = document.getElementById('SuccessDiv');
    popup.classList.toggle('active');

    let body = document.querySelector('body');

    // Add a class to the body to stop scrolling
    body.classList.add('stop-scrolling');

    document.querySelector('.cancel-Confirmation').style.display='none'
    document.querySelector('.returnOrder').style.display='block'
    document.querySelector('.returnOrder').style.display='flex'
}


function returnOrder(orderID){

    const submitOrder = document.querySelector('.submit-Order')
    SuccessDiv.style.height = '300px'
    document.querySelector('.returnOrder').style.display='none'
    submitOrder.style.display = 'block'
    submitOrder.style.display = 'flex'
    let content = 'Your return request is being processed. Expect confirmation shortly';
    document.getElementById('content').innerHTML = content
    const reason = document.getElementById('returndropdown').value
    const optionalreason = document.getElementById('requestReason').value
    
    console.log(optionalreason)
    axios.put(`/profileMenu?type=returnOrder&id=${orderID}`, {reason,optionalreason}) // Sending productID as data
    .then(function (response) {
        // Handle success response if needed
       
    })
    .catch(function (error) {
        console.error('Error adding product to cart:', error);
        // Handle error if needed
    });
}
function generateInvoice(details) {
    const trackDetails = JSON.parse(details);

    console.log('trackDetails :', trackDetails);
   
    // Function to format dates
    const formatDate = (date) => {
        const d = new Date(date);
        const month = '' + (d.getMonth() + 1);
        const day = '' + d.getDate();
        const year = d.getFullYear();
    
        return [year, month.padStart(2, '0'), day.padStart(2, '0')].join('-');
    };

    var props = {
        outputType: "save",
        returnJsPDFDocObject: true,
        fileName: "Invoice",
        orientationLandscape: false,
        compress: true,
        logo: {
            src: "https://raw.githubusercontent.com/edisonneza/jspdf-invoice-template/demo/images/logo.png",
            width: 53.33, //aspect ratio = width/height
            height: 26.66,
            margin: {
                top: 0, //negative or positive num, from the current position
                left: 0 //negative or positive num, from the current position
            }
        },
        stamp: {
            inAllPages: true,
            src: "https://raw.githubusercontent.com/edisonneza/jspdf-invoice-template/demo/images/qr_code.jpg",
            width: 20, //aspect ratio = width/height
            height: 20,
            margin: {
                top: 0, //negative or positive num, from the current position
                left: 0 //negative or positive num, from the current position
            }
        },
        business: {
            name: "HexaShop",
            address: "HexaShop, Tirane ish-Dogana, Durres 2001",
            phone: "(+355) 069 11 11 111",
            email: "hexashop49@gmail.com",
            website: "www.example.al",
        },
        contact: {
            label: "Invoice issued for:",
            name: trackDetails[0].addressID.fullName,
            address: `${trackDetails[0].addressID.address}, ${trackDetails[0].addressID.cityDistrictTown}, ${trackDetails[0].addressID.state}, ${trackDetails[0].addressID.pincode.toString()}`,
            phone: trackDetails[0].addressID.phoneNo.toString(),
            email: trackDetails[0].addressID.emailAddress,
        },
        invoice: {
            label: `Invoice No : `,
            num: 1,
            invDate: `Payment Date: ${formatDate(trackDetails[0].OrderDate).toString()}`,
            invGenDate: `Invoice Date: ${formatDate(new Date()).toString()}`,
            headerBorder: true,
            tableBodyBorder: true,
            header: [
            {
                title: "#", 
                style: { 
                width: 10 
                } 
            }, 
            { 
                title: "Title",
                style: {
                width: 30
                } 
            }, 
            { 
                title: "Description",
                style: {
                width: 80
                } 
            }, 
            { title: "Price"},
            { title: "Quantity"},
            { title: "MRP"},
            { title: "Total"}
            ],
            table: trackDetails.map((detail, index) => ([
                (index + 1).toString(),  // Convert to string
                detail.productID.ProductName,
                detail.productID.ProductDescription,
                detail.productID.SalesRate.toString(),  // Convert to string
                detail.Quantity.toString(),  // Convert to string
                detail.productID.MRP.toString(),  // Convert to string
                detail.Amount.toString()  // Convert to string
            ])),
            additionalRows: [{
                col1: 'Total:',
                col2: '145,250.50',
                col3: 'ALL',
                style: {
                    fontSize: 14 //optional, default 12
                }
            },
            {
                col1: 'VAT:',
                col2: '20',
                col3: '%',
                style: {
                    fontSize: 10 //optional, default 12
                }
            },
            {
                col1: 'SubTotal:',
                col2: '116,199.90',
                col3: 'ALL',
                style: {
                    fontSize: 10 //optional, default 12
                }
            }],
            
            invDescLabel: "Invoice Note",
            invDesc: "There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don't look even slightly believable. If you are going to use a passage of Lorem Ipsum, you need to be sure there isn't anything embarrassing hidden in the middle of text. All the Lorem Ipsum generators on the Internet tend to repeat predefined chunks as necessary.",
        },
        footer: {
            text: "The invoice is created on a computer and is valid without the signature and stamp.",
        },
        pageEnable: true,
        pageLabel: "Page ",
     }
     
  
    
    var pdfObject = jsPDFInvoiceTemplate.default(props);
    
}


