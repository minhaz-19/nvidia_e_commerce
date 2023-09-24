import { initializeApp } from 'firebase/app'
import {
  getFirestore, collection, getDocs,getDoc, addDoc , doc, setDoc, updateDoc, DocumentSnapshot, deleteDoc, deleteField
} from 'firebase/firestore'
import {
   getStorage, ref, uploadBytes, getDownloadURL
} from "firebase/storage";
import { getAuth, createUserWithEmailAndPassword , signInWithEmailAndPassword
} from 'firebase/auth';


const firebaseConfig = {
  apiKey: "AIzaSyBl0tiyUEpIsD9PnHM1e6O5coI3qsO-pXw",
  authDomain: "ecommerce-ruet.firebaseapp.com",
  projectId: "ecommerce-ruet",
  storageBucket: "ecommerce-ruet.appspot.com",
  messagingSenderId: "470819143333",
  appId: "1:470819143333:web:4e9b1e1084b5f51f42d74c"
}

// init firebase
initializeApp(firebaseConfig);


// init services
const db = getFirestore();
const storage = getStorage();
const auth = getAuth();
var docRef;
var userEmail;
const admin_emails=['mahfuj@gmail.com'];















  //=============================  Log In Page Javascript  ===============================



  async function signup(email, password) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      return user;
    } catch (error) {
      console.error('Error signing up:', error.message);
      throw error;
    }
  }




  async function signIn(email, password) {
    try {
      // Sign in with email and password
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
  
      // Access the signed-in user object
      const user = userCredential.user;
  
      // Return the user object or any other relevant data
      return user;
    } catch (error) {
      throw error;
    }
  }





function loginPage(){
var signUpSubmitButton = document.getElementById('signUpSubmitButton');
var loginButton = document.getElementById('loginButton');


signUpSubmitButton.addEventListener("click", (event) => {
  event.preventDefault();
 let signUpUserName = document.getElementById('signUpUserName').value;
 let signUpEmail = document.getElementById('signUpEmail').value;
 let signUpPassword = document.getElementById('signUpPassword').value;

 signup(signUpEmail, signUpPassword)
  .then(user => {
    userEmail= signUpEmail;
    
    localStorage.setItem("userid", user.uid);
    localStorage.setItem("userEmail", userEmail);
    if(admin_emails.includes(userEmail)){
      sessionStorage.setItem("meal_name", 'Lunch');
      window.location.href = './admin_order.html';
    }else{
      window.location.href = './order.html';
    }
  })
  .catch(error => {
    alert(error.message);
  });
});

loginButton.addEventListener("click", (event) => {
  event.preventDefault();
  let loginEmail = document.getElementById('loginEmail').value;
  let loginPassword = document.getElementById('loginPassword').value;
 
  signIn(loginEmail, loginPassword)
  .then(user => {
    userEmail= loginEmail;
    localStorage.setItem("userid", user.uid);
    localStorage.setItem("userEmail", userEmail);
    if(admin_emails.includes(userEmail)){
      window.location.href = './admin_order.html';
    }else{
      window.location.href = './order.html';
    }
    
    
  })
  .catch(error => {
    alert(error.message);
  });
 });

}









//============================  Order Page Javascript ===========================




var show_item_price_in_menu, meal_name = 'Lunch', hall_name = 'Bangabandhu Sheikh Mujibur Rahman Hall',text_in_add_to_cart_button, is_admin;

var reference = hall_name+'/Menu/'+meal_name;
var item_name, item_price, item_availability, item_image_source;
 // collection ref





 function replaceFrontPageImage() {
  const imageElement = document.getElementById('front-page-image');
  const imageSources = ['../images/display.png', '../images/display2.png', '../images/display3.png']; // List of image file paths
  let currentIndex = 0;

  setInterval(() => {
    currentIndex = (currentIndex + 1) % imageSources.length;
    imageElement.src = imageSources[currentIndex];
  }, 5000); // Replace the image every 5 seconds (5000 milliseconds)
}


function showMenuItems(item_name, show_item_price_in_menu, image_source){

  
    text_in_add_to_cart_button='Add to cart'
  

  // Create a new element
var newElement = document.createElement('div');

// Set class name for the new element
newElement.className = 'card my-3 shadow border-0 pt-2';

// Set styles for the new element
newElement.style.width = '18rem';


newElement.innerHTML = `
<div class="d-flex justify-content-center">
      <img
        src="${image_source}"
        class="card-img-top standard-height"
        alt="..."
      />
</div>
<div class="card-body">
  <h5 class="card-title">
    <div class="row">
      <div class="col">${item_name}</div>
      <div class="col text-end">${show_item_price_in_menu} </div>
    </div>
  </h5>
  <a class="btn btn-success w-100" id="${item_name}" onclick="addToCartClicked(event, '${item_price}')">${text_in_add_to_cart_button}</a>
</div>`;




// Get the parent element by its ID name
var parentElement = document.getElementById('menu-items-card-holder');

// Append the new element to the parent element
parentElement.appendChild(newElement);
 
}


function menu(){

  reference ="Nvidia E-Commerce/Stock/Info";
  var colRef = collection(db, reference);

// get collection data
getDocs(colRef)
  .then(snapshot => {

    let items = []
    
    snapshot.docs.forEach(doc => {
      items.push({ ...doc.data(), id: doc.id })
        item_name = doc.id;
        item_price = doc.data().Price;
        item_image_source = doc.data().url;
        item_availability = doc.data().Available;
        if(item_price == 0){
          show_item_price_in_menu = 'Complementary'
        }else{
          show_item_price_in_menu = item_price +' $'
        }
        if(item_availability){
          showMenuItems(item_name, show_item_price_in_menu,item_image_source)
        }
    })
    
  })
  .catch(err => {
    item_name = 'Error';
        item_price = 'Error';
        item_availability = false;
  });

}








function orderPage(){
  menu();
  replaceFrontPageImage();
}





//--------------------------------   Cart Page   ------------------------------------------



var selectedItemForLunch = JSON.parse(sessionStorage.getItem('selectedItemForLunch'));
    var selectedItemForLunchPrice = JSON.parse(sessionStorage.getItem('selectedItemForLunchPrice'));

    const lunch_cartItemsContainer = document.getElementById('lunch_cartItems');
    const lunch_totalPriceContainer = document.getElementById('lunch_totalPrice');
    const lunchcheckoutButton = document.getElementById('make_payment_lunch');


    var selectedItemForDinner = JSON.parse(sessionStorage.getItem('selectedItemForDinner'));
  







function lunch_renderCartItems() {
  if (sessionStorage.getItem('lunch_hall_name') != null || sessionStorage.getItem('lunch_hall_name') != undefined) {
    document.getElementById('lunch_cart_hall_name').textContent = sessionStorage.getItem('lunch_hall_name');
  }
  lunch_cartItemsContainer.innerHTML = '';
  let lunch_total = 0;

  for (let i = 0; i < selectedItemForLunch.length; i++) {
    const itemElement = document.createElement('div');
    itemElement.classList.add('item');

    const nameElement = document.createElement('span');
    nameElement.classList.add('item-name');
    nameElement.textContent = selectedItemForLunch[i];

    const priceElement = document.createElement('span');
    priceElement.classList.add('item-price');
    priceElement.textContent = `${selectedItemForLunchPrice[i]} $`;

    const deleteIcon = document.createElement('i');
    deleteIcon.classList.add('fas', 'fa-trash', 'delete-icon');

    // Attach event listener to delete icon
    deleteIcon.addEventListener('click', function() {
      lunch_removeItem(i);
    });

    
    itemElement.appendChild(nameElement);
    itemElement.appendChild(priceElement);
    itemElement.appendChild(deleteIcon);

    lunch_cartItemsContainer.appendChild(itemElement);
    lunch_total += selectedItemForLunchPrice[i];
  }

  lunch_totalPriceContainer.textContent = `Total: ${lunch_total} $`;
}

function lunch_removeItem(index) {
  selectedItemForLunch.splice(index, 1);
  selectedItemForLunchPrice.splice(index, 1);
  sessionStorage.setItem('selectedItemForLunch', JSON.stringify(selectedItemForLunch));
  sessionStorage.setItem('selectedItemForLunchPrice', JSON.stringify(selectedItemForLunchPrice));
  lunch_renderCartItems();
}


 async function completePayment() {
  var userEmail = localStorage.getItem('userEmail');
  var reference = 'Nvidia E-Commerce/User/'+ userEmail;

  

  var selectedItemForLunch = JSON.parse(sessionStorage.getItem('selectedItemForLunch'));
  var selectedItemForLunchPrice = JSON.parse(sessionStorage.getItem('selectedItemForLunchPrice'));

  // Create a new document with the data you want to add
  var newItemData = {}; // Create an empty object
  var userItemdata = {};
  const autoGeneratedDoc = doc(collection(db, reference));

  const ordered_items_docref  = doc(collection(db, 'Nvidia E-Commerce/Stock/Ordered Items'), "pending")
  const check_documentSnapshot = await getDoc(ordered_items_docref);


  const updateItemsData = async (selectedItemForLunch, check_documentSnapshot, ordered_items_docref) => {
    try {
  
      selectedItemForLunch.forEach((item) => {
        if (newItemData.hasOwnProperty(item)) {
          newItemData[item]++;
        } else {
          newItemData[item] = 1;
        }
      });
  
      const updatePromises = Object.keys(newItemData).map(async (item_check) => {
        if (check_documentSnapshot.exists() && check_documentSnapshot.data()[item_check] !== undefined && item_check != 'email') {
          await updateDoc(ordered_items_docref, {
            [item_check]: check_documentSnapshot.data()[item_check] + newItemData[item_check]
          });
        } else {
          await setDoc(ordered_items_docref, {
            [item_check]: newItemData[item_check]
          }, { merge: true });
        }
      });
  
      await Promise.all(updatePromises);
  
      console.log('Items data updated successfully.');
    } catch (error) {
      console.error('Error updating items data:', error);
    }
  };
  
  await updateItemsData(selectedItemForLunch, check_documentSnapshot, ordered_items_docref);
  userItemdata = { ...newItemData };
  newItemData['email'] = userEmail;

  userItemdata['status']= 'Pending'
  
 


  await setDoc(doc(db, 'Nvidia E-Commerce/Stock/Orderes By Each Customer/'+autoGeneratedDoc.id), newItemData).then(
      
    await setDoc(doc(db, 'Nvidia E-Commerce/User/'+userEmail+'/'+autoGeneratedDoc.id), userItemdata).then(
      {
        
        
    
      }
    ),
    
  );

  selectedItemForLunch=[];
  selectedItemForLunchPrice=[];
  sessionStorage.removeItem('selectedItemForLunch');
  sessionStorage.removeItem('selectedItemForLunchPrice');
  
  lunch_renderCartItems();
  location.reload();


 
}









function cartPage(){

  var check_login = localStorage.getItem("userEmail");
      if(check_login == null){
        window.location.href = './index.html';
      }else{
        if(selectedItemForLunch){
          lunch_renderCartItems();
        }
        
    
        
    
        lunchcheckoutButton.addEventListener('click', function() {
    
          completePayment();
          alert('Payment completed!');
          // Perform additional actions here, such as redirecting to a payment gateway
        });
      }


    

}




// ==========================   Order History page   ===============================



function showOrderDetailsForUser(){
  var myemail = localStorage.getItem('userEmail')
  var reference ="Nvidia E-Commerce/User/"+myemail;
  var colRef = collection(db, reference);
  document.getElementById('lunch-button').innerHTML = 'Orders by '+myemail
  // Get collection data
  getDocs(colRef)
    .then(snapshot => {
      const showOrderedItemList = document.getElementById('display-myorder');
      showOrderedItemList.innerHTML = ''; // Clear previous content

      snapshot.docs.forEach(async doc => {

        var oldDocData = await doc.data();
        // Create a div for the document ID
        const docIdElement = document.createElement('div');
        docIdElement.classList.add('document-id');
        docIdElement.textContent = oldDocData['status'];

        showOrderedItemList.appendChild(docIdElement);

        
        for (let key in oldDocData) {
          if(key != 'status' && key != 'email'){
            const rowElement = document.createElement('div');
            rowElement.classList.add('row','item');

            const nameElement = document.createElement('div');
            nameElement.classList.add('col-10', 'text-start');
            nameElement.textContent = key;

            const priceElement = document.createElement('div');
            priceElement.classList.add('col');
            priceElement.textContent = oldDocData[key];

            

            rowElement.appendChild(nameElement);
            rowElement.appendChild(priceElement);

            showOrderedItemList.appendChild(rowElement);
          }
        }


        // Add blank space between documents
        const spaceElement = document.createElement('div');
        spaceElement.classList.add('space');
        showOrderedItemList.appendChild(spaceElement);
      });
    })
    .catch(err => {
      // Handle errors here
      console.error(err);
    });
}





function historyPage(){
  var check_login = localStorage.getItem("userEmail");
      if(check_login == null){
        window.location.href = './index.html';
      }else{
        showOrderDetailsForUser()
      }
    
}



// ================  log out page  =========================


function logOut(){
  var check_login = localStorage.getItem("userEmail");
      if(check_login == null){
        window.location.href = './index.html';
      }else{
        const logoutButton = document.getElementById('logoutBtn');
        logoutButton.addEventListener('click', () => {
          firebase.auth().signOut().then(() => {
            // Redirect to login page or any other page after logout
            localStorage.clear();
      
            window.location.href = './index.html';
          }).catch((error) => {
            console.log(error.message);
          });
        });
      }
  
}





// ==============  Admin Order Page ============================

var item_image_download_url, category;
var image_storageRef;









function admin_showMenuItems(item_name, show_item_price_in_menu, image_source) {
  // Create a new element
  var newElement = document.createElement('div');

  // Set class name for the new element
  newElement.className = 'card my-3 shadow border-0 pt-2';

  // Set styles for the new element
  newElement.style.width = '18rem';

  newElement.innerHTML = `
    <div class="d-flex justify-content-center">
      <img
        src="${image_source}"
        class="card-img-top standard-height"
        alt="..."
      />
    </div>
    <div class="card-body">
      <h5 class="card-title">
        <div class="row">
          <div class="col">${item_name}</div>
          <div class="col text-end">${show_item_price_in_menu}</div>
        </div>
      </h5>
      <a class="btn btn-success w-100">Modify Product</a>
    </div>`;

  newElement.id = item_name;

  // newElement.addEventListener("click", () => editThisItemClicked(item_name, meal_name, hall_name));
  newElement.addEventListener("click", () => admin_editItemButtonClicked(item_name));

  // Get the parent element by its ID name
  var parentElement = document.getElementById('menu-items-card-holder');

  // Append the new element to the parent element
  parentElement.appendChild(newElement);
}

function admin_editItemButtonClicked(item_name){
  document.getElementById('edit-item-popup-container').style.display = "block";
  document.getElementById('submit-update-item-popup').addEventListener("click", async function() {
    var updatedItemName = document.getElementById("itemNameToBeUpdated").value;
    var updatedItemValue = Number(document.getElementById("itemPriceToBeUpdated").value);
    var collectionRef = collection(db, "Nvidia E-Commerce/Stock/Info");
    if(updatedItemName !== ""){
      const oldDocRef = doc(collection(db, "Nvidia E-Commerce/Stock/Info"), item_name);
  
  // Get the data from the old document
  const oldDocSnapshot = await getDoc(oldDocRef);
  const oldDocData = oldDocSnapshot.data();
  
  // Create a new document with the new ID
  const newDocRef = doc(collection(db, "Nvidia E-Commerce/Stock/Info"), updatedItemName);
  
  // Set the data from the old document to the new document
  await setDoc(newDocRef, oldDocData);
  
  // Delete the old document if desired
  await deleteDoc(oldDocRef);
      item_name = updatedItemName;
    }

    if(updatedItemValue !== ""){
      await updateDoc(doc(collectionRef, item_name), { Price: updatedItemValue });
    }
    document.getElementById("edit-item-popup-container").style.display = "none";
    
    location.reload();
  });

  document.getElementById('delete-update-item-popup').addEventListener("click", async function() {
    
    var collectionRef = collection(db, "Nvidia E-Commerce/Stock/Info");
   
    await deleteDoc(doc(collectionRef, item_name));
     
    document.getElementById("edit-item-popup-container").style.display = "none";
    
    location.reload();
  });

  document.getElementById('close-update-item-popup').addEventListener("click", async function() {    
    document.getElementById("edit-item-popup-container").style.display = "none"; 
  });
}



function admin_menu(firebase_root){
  reference = firebase_root + "/Stock/Info";
  var colRef = collection(db, reference);
 
 // get collection data
 getDocs(colRef)
   .then(snapshot => {

     let items = []
     
     snapshot.docs.forEach(doc => {
       items.push({ ...doc.data(), id: doc.id })
         item_name = doc.id;
         item_price = doc.data().Price;
         item_image_source = doc.data().url;
         item_availability = doc.data().Available;
         if(item_price == 0){
           show_item_price_in_menu = 'Complementary'
         }else{
           show_item_price_in_menu = item_price +' $'
         }
         if(item_availability){
           admin_showMenuItems(item_name, show_item_price_in_menu,item_image_source,firebase_root)
         }
     })
     
   })
   .catch(err => {
     item_name = 'Error';
         item_price = 'Error';
         item_availability = false;
   });
 
 }




async function uploadImage(collectionRef, documentId, newItemData, firebase_root) {
  const imageInput = document.getElementById("imageInput");
  const file = imageInput.files[0];

  if (file) {
    // Create a storage reference
     image_storageRef = ref(storage, firebase_root+'/' + file.name);
   

    // Upload the file
    uploadBytes(image_storageRef, file)
      .then(() => {
        console.log("Image uploaded successfully!");

    
        getDownloadURL(image_storageRef)
          .then((downloadURL) => {
            item_image_download_url = downloadURL;
            newItemData.url = downloadURL;
      // Set the new document data for the selected document ID
       setDoc(doc(collectionRef, documentId), newItemData);
      document.getElementById("popup-container").style.display = "none";
            
          })
          .catch((error) => {
            console.error("Error getting download URL: ", error);
          });
      })
      .catch((error) => {
        console.error("Error uploading image: ", error);
      });
  } else {
    console.log("No file selected.");
  }
}


function admin_addItemButtonClicked(){
  document.getElementById('add-element-container').addEventListener("click", function(event){
  document.getElementById('popup-container').style.display = "block";
  });
}

function admin_closeAddItemPopupClicked(){
  document.getElementById('close-add-item-popup').addEventListener("click", function(event){
    document.getElementById('popup-container').style.display = "none";
  });
}


function admin_submitAddItemButtonClicked(firebase_root) {
  document.getElementById("submit-add-item-popup").addEventListener("click", async function (event) {
    var newItemName = document.getElementById("itemNameToBeAdded").value;
    var newItemValue = Number(document.getElementById("itemPriceToBeAdded").value);

    reference = firebase_root + "/Stock/Info";

    var collectionRef = collection(db, reference);
    var documentId = newItemName; // specify the document ID

    // Create a new document with the data you want to add
    var newItemData = {
      Available: true,
      Price: newItemValue,
      url: item_image_download_url,
    };

    try {
      // Upload the image to Firebase Storage
  await uploadImage(collectionRef, documentId, newItemData,firebase_root);
  
    } catch (error) {
      console.error("Error adding document: ", error);
    }
  });
}

async function show_ordered_items(firebase_root){
  var docref_for_remaining_items = doc(collection(db, firebase_root + "/Stock/Ordered Items"), 'pending')
  const DocSnapshot = await getDoc(docref_for_remaining_items);
  const oldDocData = DocSnapshot.data();

  if (DocSnapshot.exists()) {
    for (let key in oldDocData) {
      const itemElement = document.createElement('div');
      itemElement.classList.add('item');
  
      const nameElement = document.createElement('span');
      nameElement.classList.add('item-name');
      nameElement.textContent = key;
  
      const priceElement = document.createElement('span');
      priceElement.classList.add('item-quantity');
      priceElement.textContent = oldDocData[key];
  
      itemElement.appendChild(nameElement);
      itemElement.appendChild(priceElement);
      
      
      document.getElementById('show-remaining-order-items').appendChild(itemElement);
    }
    
  }
}


function admin_order(){
  var firebase_root = 'Nvidia E-Commerce';
  admin_menu(firebase_root);
  admin_addItemButtonClicked(firebase_root);
  admin_closeAddItemPopupClicked(firebase_root);
  admin_submitAddItemButtonClicked(firebase_root);
  show_ordered_items(firebase_root);
}



// ============================  Order Details Page  ================================




function print_all_order(firebase_root) {
  reference = firebase_root + "/Stock/Orderes By Each Customer";
  var colRef = collection(db, reference);

  // Get collection data
  getDocs(colRef)
    .then(snapshot => {
      const showOrderedItemList = document.getElementById('show_ordered_item_list');
      showOrderedItemList.innerHTML = ''; // Clear previous content

      snapshot.docs.forEach(async doc => {

        var oldDocData = await doc.data();
        // Create a div for the document ID
        const docIdElement = document.createElement('div');
        docIdElement.classList.add('document-id');
        docIdElement.textContent = oldDocData['email'];

        showOrderedItemList.appendChild(docIdElement);

        
        for (let key in oldDocData) {
          if(key != 'email' && key != 'status'){
            const rowElement = document.createElement('div');
            rowElement.classList.add('row','item');

            const nameElement = document.createElement('div');
            nameElement.classList.add('col-11');
            nameElement.textContent = key;

            const priceElement = document.createElement('div');
            priceElement.classList.add('col');
            priceElement.textContent = oldDocData[key];

            

            rowElement.appendChild(nameElement);
            rowElement.appendChild(priceElement);

            showOrderedItemList.appendChild(rowElement);
          }
        }

        const buttonElement = document.createElement('button');
          buttonElement.type = 'button';
          buttonElement.classList.add('btn', 'btn-danger', 'col', 'gap');
          buttonElement.textContent = 'Product Delivered';

          // Set data attributes for the button
          buttonElement.dataset.docId = doc.id;

          // Add click event listener to the button
          buttonElement.addEventListener('click', handleOrderServedClick);
          
          showOrderedItemList.appendChild(buttonElement);

        // Add blank space between documents
        const spaceElement = document.createElement('div');
        spaceElement.classList.add('space');
        showOrderedItemList.appendChild(spaceElement);
      });
    })
    .catch(err => {
      // Handle errors here
      console.error(err);
    });
}


async function handleOrderServedClick(event) {
  // Access the document ID and key from the button's data attributes
  const docId = event.target.dataset.docId;
  // Perform further actions as needed

  var docref_for_remaining_items = doc(collection(db, 'Nvidia E-Commerce/Stock/Ordered Items'), 'pending');
  const remaining_items_DocSnapshot = await getDoc(docref_for_remaining_items);

  const docRef = doc(db, "Nvidia E-Commerce/Stock/Orderes By Each Customer", docId); 

  const oldDocSnapshot = await getDoc(docRef);
    const oldDocData = oldDocSnapshot.data();
    var gotoThisUserEmail = oldDocData['email']
  // Use the updateDoc function to delete the field
  await deleteDoc(docRef)
    .then(async () => {
      var userDocRef = doc(db, "Nvidia E-Commerce/User/"+gotoThisUserEmail, docId);
      await updateDoc(userDocRef, {
        ['status']: 'Delivered'
      });
      console.log("Document deleted successfully");
    })
    .catch((error) => {
      console.error("Error deleting document: ", error);
    });

    const updatePromisesRemainingItems = Object.keys(oldDocData).map(async (item_check) => {

      if(item_check != 'email'){
        await updateDoc(docref_for_remaining_items, {
          [item_check]: remaining_items_DocSnapshot.data()[item_check] - oldDocData[item_check]
        });
      }
    
  });
  
  await Promise.all(updatePromisesRemainingItems);

  location.reload();
}





// async function handleOrderServedClick(event) {
//   // Access the document ID and key from the button's data attributes
//   const docId = event.target.dataset.docId;
//   // Perform further actions as needed

//   var docref_for_remaining_items = doc(collection(db, 'Nvidia E-Commerce/Stock/Ordered Items'), 'pending');
//   const remaining_items_DocSnapshot = await getDoc(docref_for_remaining_items);

//   const docRef = doc(db, "Nvidia E-Commerce/Stock/Orderes By Each Customer", docId); 

//   const oldDocSnapshot = await getDoc(docRef);
//     const oldDocData = oldDocSnapshot.data();
//     var gotoThisUserEmail = oldDocData['email']
//   // Use the updateDoc function to delete the field
//   await deleteDoc(docRef)
//     .then(async () => {
//       var userDocRef = doc(db, "Nvidia E-Commerce/User/"+gotoThisUserEmail, docId);
//       await updateDoc(userDocRef, {
//         ['status']: 'Delivered'
//       });
//       console.log("Document deleted successfully");
//       location.reload();
//     })
//     .catch((error) => {
//       console.error("Error deleting document: ", error);
//     });

//     const batch = writeBatch(db);

//     // Update the remaining items document
//     Object.keys(oldDocData).forEach(async (item_check) => {

//       if(item_check != 'email'){
//         batch.update(docref_for_remaining_items, {
//           [item_check]: remaining_items_DocSnapshot.data()[item_check] - oldDocData[item_check]
//         });
//       }
    
//   });

//   // Commit the batch write
//   await batch.commit();
// }







function order_details(){


  print_all_order('Nvidia E-Commerce');

  admin_addItemButtonClicked('Nvidia E-Commerce');
  admin_closeAddItemPopupClicked('Nvidia E-Commerce');
  admin_submitAddItemButtonClicked('Nvidia E-Commerce');

}


//===============================  Select Javascript function  =================

if(document.title == 'Log In'){
  loginPage();
}
else if(document.title == 'XYZ Shoes'){
  orderPage();
}
else if(document.title == 'Cart'){
  cartPage();
}
else if(document.title == 'Order History'){
  historyPage();
}
else if(document.title == 'Log Out'){
  logOut();
}
else if(document.title == 'Home'){
  admin_order();
}
else if(document.title == 'Order Details'){
  
  order_details();
}