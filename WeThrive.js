// ========== MENU TOGGLE ==========
var MenuItems = document.getElementById("MenuItems");

if (MenuItems) {
  MenuItems.style.maxHeight = "0px";
  window.menutoggle = function () {
    MenuItems.style.maxHeight = MenuItems.style.maxHeight === "0px" ? "150px" : "0px";
  };
}

// ========== CART TOGGLE ==========
document.querySelector(".cart-toggle-icon")?.addEventListener("click", function () {
  let cart = document.getElementById("cart-panel");
  if (cart) {
    cart.style.display = cart.style.display === "none" ? "block" : "none";
  }
});

// ========== PRODUCT TOGGLE BUTTONS ==========
document.querySelectorAll(".toggle-btn").forEach(function (button) {
  button.addEventListener("click", function () {
    let targetId = this.getAttribute("data-target");
    let targetElement = document.getElementById(targetId);
    if (targetElement) {
      targetElement.style.display = targetElement.style.display === "none" ? "block" : "none";
    }
  });
});

// ========== IMAGE SWITCHING ==========
document.querySelectorAll(".small-img").forEach(function (img) {
  img.addEventListener("click", function () {
    let targetId = this.getAttribute("data-target");
    let mainImg = document.getElementById(targetId);
    if (mainImg) {
      mainImg.src = this.src;
    }
  });
});

// ========== CART SYSTEM ==========
let cartItems = JSON.parse(localStorage.getItem("cartItems")) || [];
const cartItemsContainer = document.getElementById("cart-items");
const totalPriceElement = document.getElementById("total-price");

function saveCart() {
  localStorage.setItem("cartItems", JSON.stringify(cartItems));
}

function showToast(message, type = "success") {
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.innerText = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

window.addToCart = function (productName, productPrice, sizeSelectId) {
  const sizeSelect = document.getElementById(sizeSelectId);
  if (!sizeSelect) {
    alert("Size selector not found.");
    return;
  }

  const size = sizeSelect.value;
  if (size === "Select Size") {
    alert("Please select a size before adding to cart.");
    return;
  }

  let quantity = 1;
  const productSection = sizeSelect.closest(".ProductDesc, .product-desc");
  if (productSection) {
    const input = productSection.querySelector('input[type="number"]');
    if (input) quantity = parseInt(input.value) || 1;
  }

  const existing = cartItems.find(item => item.name === productName && item.size === size);
  if (existing) {
    existing.quantity += quantity;
  } else {
    cartItems.push({ name: productName, price: productPrice, quantity: quantity, size: size });
  }

  updateCartDisplay();
  saveCart();
  showToast(`Added ${quantity} x ${productName} (${size})`);
};

window.removeCartItem = function (index) {
  const removedItem = cartItems.splice(index, 1)[0];
  updateCartDisplay();
  saveCart();
  showToast(`Removed ${removedItem.name} (${removedItem.size})`, "warning");
};

function updateCartDisplay() {
  if (!cartItemsContainer || !totalPriceElement) return;

  cartItemsContainer.innerHTML = "";
  let total = 0;

  cartItems.forEach((item, index) => {
    total += item.price * item.quantity;
    const itemDiv = document.createElement("div");
    itemDiv.className = "cart-item";
    itemDiv.innerHTML = `
      ${item.name} (${item.size}) - R${item.price} x ${item.quantity}
      <button onclick="removeCartItem(${index})" style="margin-left: 10px;">❌</button>
    `;
    cartItemsContainer.appendChild(itemDiv);
  });

  totalPriceElement.textContent = total.toFixed(2);
}

window.placeOrder = function () {
  if (cartItems.length === 0) {
    showToast("Your cart is empty!", "error");
    return;
  }

  const orderDetails = cartItems.map(item =>
    `${item.name} (${item.size}) x${item.quantity} - R${item.price}`
  ).join("\n");

  const hiddenInput = document.getElementById("order-details");
  if (hiddenInput) hiddenInput.value = orderDetails;

  showToast("Order placed! Thank you!");

  // Clear cart
  cartItems.length = 0;
  localStorage.removeItem("cartItems");
  updateCartDisplay();  // Clear the UI
  saveCart();
};

document.addEventListener("DOMContentLoaded", function () {
  updateCartDisplay();
});

// ========== SEARCH ==========
window.searchProducts = function () {
  const input = document.getElementById("searchBox").value.toLowerCase();
  const suggestionList = document.getElementById("suggestionList");
  const productBoxes = document.querySelectorAll(".col-4");

  // Clear old suggestions
  suggestionList.innerHTML = "";

  if (input === "") return;

  let matches = [];

  productBoxes.forEach(product => {
    const img = product.querySelector("img");
    const name = product.querySelector("h4, h3");
    const tag = img?.getAttribute("tagname")?.toLowerCase() || "";
    const alt = img?.alt?.toLowerCase() || "";
    const title = name?.innerText?.toLowerCase() || "";

    const match = tag.includes(input) || alt.includes(input) || title.includes(input);
    if (match) {
      matches.push({ name: title, element: product });
      product.style.display = "block";
    } else {
      product.style.display = "none";
    }
  });

    // Show suggestions
    matches.forEach(match => {
      const li = document.createElement("li");
      li.textContent = match.name;
      li.style.cursor = "pointer";
  
      li.addEventListener("click", function () {
        // Scroll to product
        match.element.scrollIntoView({ behavior: "smooth" });
  
        // Optional: highlight or flash
        match.element.style.border = "2px solid #00f";
        setTimeout(() => match.element.style.border = "", 1500);
  
        // ✅ Clear the input and suggestions
        document.getElementById("searchBox").value = "";
        suggestionList.innerHTML = "";
      });
      suggestionList.appendChild(li);
  });
};

// ========== TOAST STYLES ==========
const style = document.createElement("style");
style.innerHTML = `
.toast {
  position: fixed;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  background: #222;
  color: #fff;
  padding: 12px 20px;
  border-radius: 6px;
  font-size: 15px;
  z-index: 1000;
  opacity: 0.9;
  box-shadow: 0 4px 10px rgba(0,0,0,0.3);
}
.toast.success { background-color: #28a745; }
.toast.warning { background-color: #ffc107; color: #000; }
.toast.error   { background-color: #dc3545; }
`;
document.head.appendChild(style);

// ========== INIT ==========
updateCartDisplay();

//======= Checkout Script =======
function submitOrder(event) {
  event.preventDefault();

  const form = document.getElementById("order-form");
  const orderDetails = localStorage.getItem("cartItems");

  if (!orderDetails || JSON.parse(orderDetails).length === 0) {
    alert("Cart is empty. Please add products before placing an order.");
    return;
  }

  document.getElementById("order-details").value = orderDetails;
  alert("Order placed successfully! 🎉");

  localStorage.removeItem("cartItems");
  form.reset();
}

// ========== SORTING ==========
function sortFeaturedProducts() {
  const container = document.getElementById("featuredProducts");
  const products = Array.from(container.querySelectorAll(".col-4"));
  const sortValue = document.getElementById("sortSelect").value;

  if (sortValue === "default") return;

  products.sort((a, b) => {
    const priceA = parseFloat(a.getAttribute("data-price"));
    const priceB = parseFloat(b.getAttribute("data-price"));
    return sortValue === "lowToHigh" ? priceA - priceB : priceB - priceA;
  });

  products.forEach(product => container.appendChild(product));
}
// ========= Picture larger view =========


function changeImage(newSrc) {
  var largeImage = document.getElementById("largeImage");
  largeImage.src = newSrc;
}

function openGallery(imgElement) {
  const gallery = document.getElementById("gallery");
  const largeImage = document.getElementById("largeImage");
  const thumbnailContainer = gallery.querySelector(".small-picture");

  // Set main image
  const largeSrc = imgElement.dataset.large || imgElement.src;
  largeImage.src = largeSrc;

  // Clear and add new thumbnails
  thumbnailContainer.innerHTML = "";
  const thumbs = JSON.parse(imgElement.dataset.thumbnails || "[]");

  thumbs.forEach((src) => {
    const thumb = document.createElement("img");
    thumb.src = src;
    thumb.className = "thumbnail";
    thumb.onclick = (e) => {
      e.stopPropagation();
      changeImage(src);
    };
    thumbnailContainer.appendChild(thumb);
  });

  gallery.style.display = "block";
}
// ===== Zooming controls =====
let zoomLevel = 1;
let isDragging = false;
let startX, startY, currentX = 0, currentY = 0;

function zoomImage(direction) {
  const largeImage = document.getElementById("largeImage");

  if (direction === 'in') {
    zoomLevel += 0.1;
  } else if (direction === 'out') {
    zoomLevel = Math.max(1, zoomLevel - 0.1); // don't zoom out below 1
    if (zoomLevel === 1) {
      resetImagePosition();
    }
  }

  updateImageTransform();
}

function updateImageTransform() {
  const largeImage = document.getElementById("largeImage");
  largeImage.style.transform = `scale(${zoomLevel}) translate(${currentX}px, ${currentY}px)`;
  largeImage.style.transition = 'transform 0.1s';
}

function resetImagePosition() {
  currentX = 0;
  currentY = 0;
}

function closeGallery(event) {
  if (event) event.stopPropagation();
  document.getElementById("gallery").style.display = "none";
  zoomLevel = 1;
  resetImagePosition();
  updateImageTransform();
}

// Drag handlers
const largeImage = document.getElementById("largeImage");

largeImage.addEventListener('mousedown', (e) => {
  if (zoomLevel <= 1) return; // only drag when zoomed in

  isDragging = true;
  startX = e.clientX - currentX;
  startY = e.clientY - currentY;
  largeImage.style.cursor = 'grabbing';
  largeImage.style.transition = 'none';
});

window.addEventListener('mouseup', () => {
  isDragging = false;
  largeImage.style.cursor = 'default';
});

window.addEventListener('mousemove', (e) => {
  if (!isDragging) return;

  currentX = e.clientX - startX;
  currentY = e.clientY - startY;
  updateImageTransform();
});


function changeImage(src) {
  document.getElementById("largeImage").src = src;
}

