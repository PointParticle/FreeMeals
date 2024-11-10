// main.js
document.getElementById("productForm").addEventListener("submit", async (event) => {
    event.preventDefault(); // Prevent the form from submitting the default way

    const formData = new FormData();
    formData.append("productName", document.getElementById("productName").value);
    formData.append("metrics", document.getElementById("metrics").value);
    formData.append("quantity", document.getElementById("quantity").value);
    formData.append("expirationDate", document.getElementById("expirationDate").value);
    formData.append("location", document.getElementById("location").value);

    const imageInput = document.getElementById("image").files[0];
    if (imageInput) {
        formData.append("image", imageInput);
    }

    try {
        const response = await fetch("/products", {
            method: "POST",
            body: formData,
        });

        const result = await response.json();
        if (response.ok) {
            alert("Product added successfully");
        } else {
            alert("Error: " + result.error);
        }
    } catch (error) {
        console.error("Error submitting form:", error);
        alert("An error occurred while submitting the form.");
    }
});

