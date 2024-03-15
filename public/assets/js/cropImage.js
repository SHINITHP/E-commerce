// function cropImage(id, divId) {
//     document.getElementById(id).addEventListener('change', function (event) {
//         let blur = document.getElementById('blur');
//         blur.classList.toggle('active');

//         let popup = document.getElementById('popup');
//         popup.classList.toggle('active');

//         let image = document.getElementById('image');
//         let cropBtn = document.getElementById('cropBtn');
//         let files = event.target.files[0];

//         const reader = new FileReader();

//         reader.onload = function (e) {
//             image.onload = function () {
//                 console.log("Image loaded successfully.");
//                 const cropper = new Cropper(image, {
//                     aspectRatio: 0, // Set the aspect ratio as needed
//                     viewMode: 3,
//                     preview: '.preview' // Specify a preview container if needed
//                 });
//                 console.log("Cropper initialized:", cropper);

//                 cropBtn.addEventListener('click', function () {
//                     const croppedImageView = document.getElementById(divId);
//                     const croppedCanvas = cropper.getCroppedCanvas();
//                     if (!croppedCanvas) {
//                         console.error("Failed to get cropped canvas.");
//                         return;
//                     }
//                     const croppedImageDataURL = croppedCanvas.toDataURL();
//                     croppedImageView.style.backgroundImage = `url(${croppedImageDataURL})`;
//                     cropper.destroy();
//                     console.log("Cropper destroyed.");

//                     // Remove 'active' class from blur and popup
//                     blur.classList.remove('active');
//                     popup.classList.remove('active');
//                 });
//             };
//             image.src = e.target.result; // Load the image
//         };

//         reader.readAsDataURL(files);
//     });
// }

function cropImage(id, divId, returnImg) {
    let croppers = {};
    document.getElementById(id).addEventListener('change', function (event) {
        let blur = document.getElementById('blur');
        blur.classList.toggle('active');

        let popup = document.getElementById('popup');
        popup.classList.toggle('active');

        let image = document.getElementById('image');
        let cropBtn = document.getElementById('cropBtn');
        let ReturnImg = document.getElementById(returnImg);

        let files = event.target.files;
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const reader = new FileReader();

            reader.onload = function (e) {
                // Create a new image element for each file
                const newImage = new Image();
                newImage.src = e.target.result;
                image.src = newImage.src

                newImage.onload = function () {
                    // Destroy previous Cropper instance for this image, if exists

                    console.log("Image loaded successfully.");
                    const cropper = new Cropper(image, {
                        aspectRatio: 0, // Set the aspect ratio as needed
                        viewMode: 3,
                        preview: '.preview' // Specify a preview container if needed
                    });

                    // Store the Cropper instance for this image
                    croppers[newImage.src] = cropper;


                    console.log("Cropper initialized:", croppers);

                    cropBtn.addEventListener('click', function () {

                        const croppedImageView = document.getElementById(divId);
                        const croppedCanvas = croppers[newImage.src].getCroppedCanvas();

                        croppedCanvas.toBlob(function (blob) {
                            const blobUrl = URL.createObjectURL(blob);
                            croppedImageView.style.backgroundImage = `url(${blobUrl})`;
                            ReturnImg.value = blobUrl;
                            // console.log('dnsdjfnjdfg :', ReturnImg.value);

                            croppers[newImage.src].destroy();

                            // Remove 'active' class from blur and popup
                            blur.classList.remove('active');
                            popup.classList.remove('active');
                        }, 'image/jpeg', 0.8)















                        // const croppedImageView = document.getElementById(divId);
                        // const croppedCanvas = croppers[newImage.src].getCroppedCanvas();
                        // // Compress the cropped image
                        // const compressedDataURL = compressImage(croppedCanvas, 0.8);
                        // // console.log('123456768 ',croppedCanvas)
                        // // Check if cropping was successful
                        // if (croppedCanvas) {
                        //     // const croppedImageDataURL = croppedCanvas.toDataURL();
                        //     croppedImageView.style.backgroundImage = `url(${compressedDataURL})`;

                        //     ReturnImg.value = compressedDataURL;
                        //     console.log('1234rrdfjvj : ', compressedDataURL)

                        //     // Destroy the Cropper instance after cropping
                        //     croppers[newImage.src].destroy();
                        //     // Remove 'active' class from blur and popup
                        //     blur.classList.remove('active');
                        //     popup.classList.remove('active');
                        // } else {
                        //     console.error("Failed to get cropped canvas.");
                        // }
                    });
                };
                // image.src = e.target.result; // Load the image
            };
            reader.readAsDataURL(file);
        }



    });
}

function compressImage(canvas, quality) {
    // Convert canvas to data URL with specified quality
    return canvas.toDataURL('image/jpeg', quality);
}