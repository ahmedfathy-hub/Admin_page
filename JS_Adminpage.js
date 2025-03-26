const firebaseConfig = {
    apiKey: "AIzaSyBmrAjG8ocmrCaZvPFllViMwTy6CDEMhYU",
    authDomain: "web-project-1dbd5.firebaseapp.com",
    databaseURL: "https://web-project-1dbd5-default-rtdb.firebaseio.com",
    projectId: "web-project-1dbd5",
    storageBucket: "web-project-1dbd5.firebasestorage.app",
    messagingSenderId: "178412206013",
    appId: "1:178412206013:web:e55205c660eff8cc3784d4",
    measurementId: "G-G2BVKMFF6N"
}
firebase.initializeApp(firebaseConfig)
const database = firebase.database()

const productCode =document.getElementById('ProductCode');
const productNameInput =document.getElementById('ProductName');
const productCategoryInput =document.getElementById('ProductCategory');
const productPriceInput =document.getElementById('Price');
const productQuantityInput =document.getElementById('QuantityInStock');
const productDescriptionInput =document.getElementById('description');
const productimageUpload =document.getElementById('upload');
const addProductBtn = document.getElementById('addProductBtn');
const deleteProductBtn =document.getElementById('deleteProductBtn');
const searchProductBtn =document.getElementById('searchProductBtn');
const updateProductBtn = document.getElementById('updateProductBtn');
const displayProductBtn = document.getElementById('displayProductBtn');




//////////////////////////////////////////////////////////////////////ADD Function ///////////////////////
function addDataToRealtimeDB(collection, data) {
    
    collection = productCategoryInput.value
    const product = {
        code:productCode.value,
        name:productNameInput.value,
        category:productCategoryInput.value,
        price:productPriceInput.value,
        quantity:productQuantityInput.value,
        description:productDescriptionInput.value,
        image:productimageUpload.value,
    }

    // Push new data to the specified collection (auto-generate unique key)
    database.ref(collection).orderByChild("code").equalTo(productCode.value).once("value")
        .then((snapshot) => 
            {
            if (snapshot.exists()) 
                {
                snapshot.forEach((childSnapshot) => 
                    {
                        alert(`code ${productCode.value} was taken for anoter item `);
                        
                });
            } else {
                database.ref(collection).push(product)
                    .then(() => {
                        alert(`Data with code ${productCode.value} added successfully at ${collection}`)
                        console.log("Data added successfully!");
                    })
                    .catch((error) => {
                        console.error("Error adding data: ", error);
                    });

                clearInputs();
            }
        })
        
}
addProductBtn.addEventListener('click' ,addDataToRealtimeDB);

////////////////////////////////////////////////////////////////////////Delete Function ////////////////////////////////////////////////
function deleteItemByCode(collection, itemCode) {
    itemCode = productCode.value;
    collection = productCategoryInput.value;

    // Search for the item with the specific itemCode
    database.ref(collection).orderByChild("code").equalTo(itemCode).once("value")
        .then((snapshot) => {
            if (snapshot.exists()) {
                snapshot.forEach((childSnapshot) => {
                    childSnapshot.ref.remove() // Delete the matching item
                        .then(() => {
                            alert(`Item with code ${itemCode} deleted successfully!`)
                            console.log(`Item with code ${itemCode} deleted successfully!`);
                        })
                        .catch((error) => {
                            console.error("Error deleting item:", error);
                        });
                });
            } else {
                alert("No item found with code:", itemCode)
                console.log("No item found with code:", itemCode);
            }
        })
        .catch((error) => {
            console.error("Error searching for item:", error);
        });
        clearInputs();
}
deleteProductBtn.addEventListener('click' ,deleteItemByCode);

/////////////////////////////////////////////////////////////////////////Search fucntion//////////////////////////////////////////
function searchItemAndFillFields(collection, itemCode) {
    itemCode = productCode.value;
    collection = productCategoryInput.value;
    // Query Firebase for the item with the given codeNumber
    database.ref(collection).orderByChild("code").equalTo(itemCode).once("value")
        .then((snapshot) => {
            if (snapshot.exists()) {
                snapshot.forEach((childSnapshot) => {
                    let itemData = childSnapshot.val(); // Retrieve item data

                    // Fill text fields with retrieved data
                    document.getElementById('ProductName').value = itemData.name || "";
                    document.getElementById('Price').value = itemData.price || "";
                    document.getElementById('QuantityInStock').value = itemData.quantity || "";
                    document.getElementById('description').value = itemData.description || "";
                    document.getElementById('upload').value = itemData.image || "";

                    console.log("Item found and fields updated:", itemData);
                });
            } else {
                console.log("No item found with code:", itemCode);
                alert(`Item with code ${itemCode} not found at ${collection}`); // Show alert if item doesn't exist
            }
        })
        .catch((error) => {
            console.error("Error searching for item:", error);
        });
}
// Example usage: Triggered by a button click
document.getElementById('searchProductBtn').addEventListener("click", function () {
    let itemCode = document.getElementById('ProductCode').value;
    if (itemCode) {
        searchItemAndFillFields(productCategoryInput.value, itemCode);
    } else {
        alert("Please enter an item code!");
    }
});

////////////////////////////////////////////////////////////////////////////Update Product////////////////////////
function updateItemFromFields(collection) {
    

    // Get item code from input field
    let itemCode = document.getElementById('ProductCode').value;

    if (!itemCode) {
        alert("Please enter an item code!");
        return;
    }

    // Search for the item in Firebase using codeNumber
    database.ref(collection).orderByChild("code").equalTo(itemCode).once("value")
        .then((snapshot) => {
            if (snapshot.exists()) {
                snapshot.forEach((childSnapshot) => {
                    let itemId = childSnapshot.key; // Get unique Firebase key

                    // Prepare updated data from text fields
                    let updatedData = {
                        name: document.getElementById('ProductName').value || null,
                        price: document.getElementById('Price').value || null,
                        quantity: document.getElementById('QuantityInStock').value || null,
                        description: document.getElementById('description').value || null,
                        image: document.getElementById('upload').value || null

                    };

                    // Remove null values (to avoid overwriting existing data with null)
                    Object.keys(updatedData).forEach(key => {
                        if (updatedData[key] === null || updatedData[key] === "") {
                            delete updatedData[key];
                        }
                    });

                    // Update the item in Firebase
                    database.ref(`${collection}/${itemId}`).update(updatedData)
                        .then(() => {
                            alert(`Item with code ${itemCode} updated successfully!`);
                            console.log("Item updated:", updatedData);
                        })
                        .catch((error) => {
                            console.error("Error updating item:", error);
                            alert("Error updating item!");
                        });
                });
            } else {
                alert("Item not found!");
                console.log("No item found with code:", itemCode);
            }
        })
        .catch((error) => {
            console.error("Error searching for item:", error);
        });
}
document.getElementById('updateProductBtn').addEventListener("click", function () {
    updateItemFromFields(productCategoryInput.value);
});
////////////////////////////////////////////////////////////////Display Data/////////////////////////////////

// Function to retrieve and display data in an HTML table
function displayDataInTable(collection) {
    const tableBody = document.getElementById("showData");
    collection = productCategoryInput.value

    database.ref(collection).on("value", (snapshot) => {
        tableBody.innerHTML = ""; // Clear table before adding new data

        if (snapshot.exists()) {
            snapshot.forEach((childSnapshot) => {
                let data = childSnapshot.val();
                let row = `<tr>
                    <td>${data.name || "N/A"}</td>
                    <td>${data.code || "N/A"}</td>
                    <td>${data.category || "N/A"}</td>
                    <td>${data.price || "N/A"}</td>
                    <td>${data.quantity || "N/A"}</td>
                    <td>${data.description || "N/A"}</td>  
                </tr>`;

                tableBody.innerHTML += row;
            });
        } else {
            tableBody.innerHTML = `<tr><td colspan="5">No data found!</td></tr>`;
        }
    }, (error) => {
        console.error("Error fetching data:", error);
    });
}

document.getElementById('displayProductBtn').addEventListener("click", function () {
    displayDataInTable(productCategoryInput.value);
});


function clearInputs (){
    productCode.value='';
    productNameInput.value = '';
    productCategoryInput.value = '';
    productPriceInput.value = '';
    productQuantityInput.value = '';
    productDescriptionInput.value = '';
    productimageUpload.value='';
}





