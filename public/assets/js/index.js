function search() {
    const searchBar = document.getElementById('search').value
    var searchLink = document.getElementById("searchLink");
    console.log(searchBar)
    searchLink.href = "/allProducts?task=search&page=1&text=" + searchBar;
    // Redirect to the new URL
    window.location.href = searchLink.href;  
}

document.getElementById('searchBtn').addEventListener('click', function () {
    document.querySelector('.searchBar').style.display = 'block'
    document.querySelector('.searchBar').style.display = 'flex'
    document.querySelector('.main-banner').style.paddingTop = '10px';
})

function shoppingCart(index, productID, Price) {
    let btnShoppingCart = document.getElementById(`shoppingCartBtn${index}`);

    console.log('I am here...');
    axios.post('/', { productID: productID, price: Price }) // Sending productID as data
        .then(function (response) {
            console.log('Product added to cart successfully');
            // Handle success response if needed
        })
        .catch(function (error) {
            console.error('Error adding product to cart:', error);
            // Handle error if needed
        });
}

function ShowWistedBtn(i){
    console.log('hiiiii')
    document.getElementById(`wishlisted${i}`).style.display='block'
}

function wishlist(productID,i){
    
    document.getElementById(`wishlistBtnHidden${i}`).style.display = 'none';
    document.getElementById(`wishlistBtn${i}`).style.display = 'inline'; // Show the initially hidden heart icon
    console.log('wishlist', document.getElementById(`wishlistBtnHidden${i}`),document.getElementById(`wishlistBtn${i}`));

    // axios.post('/productOverview?task=wishlist', { productID }) // Sending productID as data
    // .then(function (response) {
    //     console.log(response)

        
    // })
    // .catch(function (error) {
    //     console.error('Error adding product to cart:', error);
    //     // Handle error if needed
    // });
}



var a = false;
document.addEventListener("DOMContentLoaded", function () {
    let menuTrigger = document.getElementById("menuTrigger");
    let menu = document.getElementById("menuDropDown");
    const menuTriggerSpan = document.querySelector('#menuTrigger span')


    // Toggle menu visibility when the menu trigger is clicked
    menuTrigger.addEventListener("click", function () {
        a = !a;
        menuTrigger.style.display = 'none';
        menuTriggerSpan.style.display = 'none'
        menu.style.display = "block";
        // Hide the menu when clicking outside of it
        if (menu.style.display == "block") {
            document.addEventListener("click", function (event) {
                if (!menu.contains(event.target) && event.target !== menuTrigger) {
                    menu.style.display = "none";
                    menuTrigger.style.display = 'block';
                    menuTriggerSpan.style.display = 'block'
                }
            });
        }
    });

    menu.addEventListener("click", function (event) {
        menu.style.display = "none";
        menuTrigger.style.display = "block";
        menuTriggerSpan.style.display = 'block';
    });
    console.log(a)
});




// $(function () {
//     var selectedClass = "";
//     $("p").click(function () {
//         selectedClass = $(this).attr("data-rel");
//         $("#portfolio").fadeTo(50, 0.1);
//         $("#portfolio div").not("." + selectedClass).fadeOut();
//         setTimeout(function () {
//             $("." + selectedClass).fadeIn();
//             $("#portfolio").fadeTo(50, 1);
//         }, 500);

//     });
// });



