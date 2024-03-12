function handleImageInput(inputId, previewId) {
    const input = document.getElementById(inputId);
    const preview = document.getElementById(previewId);

    input.addEventListener('change', function () {
        const file = input.files[0];

        if (file) {
            const reader = new FileReader();

            reader.onload = function (e) {
                // Set the background image of the preview div
                preview.style.backgroundImage = `url(${e.target.result})`;
                preview.textContent="";
                preview.style.border = 0
            };

            reader.readAsDataURL(file);
        } else {
            // Clear the background image if no file is selected
            preview.style.backgroundImage = 'none';
        }
    });
}

// Call the function for each image input dynamically
for (let i = 1; i <= 4; i++) {
    handleImageInput(`input-file${i}`, `img-view${i}`);
}


