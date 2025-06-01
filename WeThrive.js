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

window.addToCart = function (productName, productPrice, sizeSelectId, colorSelectId) {
  const colorSelect = document.getElementById(colorSelectId);
  const sizeSelect = document.getElementById(sizeSelectId);

  if (!sizeSelect) return alert("Size selector not found.");
  if (!colorSelect) return alert("Color selector not found.");

  const size = sizeSelect.value;
  const color = colorSelect.value;

  if (size === "Select Size") return alert("Please select a size before adding to cart.");
  if (color === "Select Color" || color === "") return alert("Please select a color before adding to cart.");

  let quantity = 1;
  const productSection = sizeSelect.closest(".ProductDesc, .product-desc");
  if (productSection) {
    const input = productSection.querySelector('input[type="number"]');
    if (input) quantity = parseInt(input.value) || 1;
  }

  const existing = cartItems.find(item =>
    item.name === productName && item.size === size && item.color === color
  );

  if (existing) {
    existing.quantity += quantity;
  } else {
    cartItems.push({
      name: productName,
      price: productPrice,
      quantity,
      size,
      color
    });
  }

  updateCartDisplay();
  saveCart();
  showToast(`Added ${quantity} x ${productName} (${size}) (${color})`);
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
  <img src="${item.image || ''}" alt="${item.name}" style="width:50px;height:auto;margin-right:10px;">
  ${item.name} (${item.size}) (${item.color || 'No color'}) - R${item.price} x ${item.quantity}
  <button onclick="removeCartItem(${index})" style="margin-left: 10px;">❌</button>
`;
    itemDiv.style.display = "flex";
    itemDiv.style.alignItems = "center";
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
    `${item.name} (${item.size}) (${item.color}) x${item.quantity} - R${item.price}\nImage: ${item.image}`
  ).join("\n\n");

  const hiddenInput = document.getElementById("order-details");
  if (hiddenInput) hiddenInput.value = orderDetails;

  showToast("Order placed! Check your email for order confirmation! Thank you!");

  // Clear cart
  cartItems.length = 0;
  localStorage.removeItem("cartItems");
  updateCartDisplay();  // Clear the UI
  saveCart();
  updateCartCount(); // Update cart count
};

document.addEventListener("DOMContentLoaded", function () {
  updateCartDisplay();
});

window.addToCartFromButton = function (btn) {
  const productName = btn.getAttribute("data-name") || "Unnamed Product";
  const productPrice = parseFloat(btn.getAttribute("data-price")) || 0;
  const sizeSelectId = btn.getAttribute("data-size-id");
  const colorSelectId = btn.getAttribute("data-color-id");

  if (!sizeSelectId) {
    alert("Size selector ID is missing.");
    return;
  }

  // Reuse your existing cart function
  window.addToCart(productName, productPrice, sizeSelectId, colorSelectId);
};

window.addToCartFromProduct = function (btn) {
  const parent = btn.closest(".col-4");
  if (!parent) return alert("Product container not found.");

  const price = parseFloat(parent.getAttribute("data-price")) || 0;
  const name = parent.querySelector("img[data-name]")?.getAttribute("data-name") || "Unnamed Product";
  const imgElement = parent.querySelector("img[data-name]");
  const image = imgElement ? imgElement.getAttribute("src") : "";

  // Try to get selects explicitly
  const selects = parent.querySelectorAll(".ProductDesc select");
  if (selects.length < 2) return alert("Size and color selectors not found.");

  const sizeSelect = selects[0];
  const colorSelect = selects[1];

  if (!sizeSelect || !colorSelect) return alert("Selectors missing.");

  const size = sizeSelect.value;
  const color = colorSelect.value;

  if (!size || size === "Select Size") return alert("Please select a size.");
  if (!color || color === "Select Color") return alert("Please select a color.");

  let quantity = 1;
  const quantityInput = parent.querySelector(".ProductDesc input[type='number']");
  if (quantityInput) quantity = parseInt(quantityInput.value) || 1;

  const existing = cartItems.find(item =>
    item.name === name && item.size === size && item.color === color && item.image === image
  );

  if (existing) {
    existing.quantity += quantity;
  } else {
    cartItems.push({ name, price, quantity, size, color, image });
  }

  updateCartDisplay();
  saveCart();
  showToast(`Added ${quantity} x ${name} (${size}) (${color})`);
  updateCartCount(); // Update cart count
};

function updateCartCount() {
  const cartCount = document.getElementById("cart-count");
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  cartCount.textContent = totalItems;
}


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
  const colorSelect = document.getElementById("galleryColorSelect");

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

  // ===== Handle color selection =====
  const colorImages = JSON.parse(imgElement.dataset.colorImages || "{}");

  // Clear previous options
  colorSelect.innerHTML = '<option value="">Select Color</option>';

  // Add color options
  Object.keys(colorImages).forEach(color => {
    const option = document.createElement("option");
    option.value = color;
    option.textContent = color;
    colorSelect.appendChild(option);
  });

  // When color changes, update the large image
  colorSelect.onchange = function () {
    const selectedColor = this.value;
    if (colorImages[selectedColor]) {
      largeImage.src = colorImages[selectedColor];
    }
  };

  // Show gallery
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


// ==== Initialize the Netlify Identity widget ====
  if (window.netlifyIdentity) {
    window.netlifyIdentity.on('init', user => {
      if (!user) {
        window.netlifyIdentity.on('login', () => {
          document.location.href = '/admin/';
        });
      }
    });

    window.netlifyIdentity.init();
  }


// ===== Load Homepage Content from Markdown ====
fetch('/content/homepage.md')
    .then(res => res.text())
    .then(markdown => {
      const parsed = window.matter(markdown);
      // Inject the title and body content dynamically
      document.getElementById('home-title').innerText = parsed.data.title;
      document.getElementById('home-body').innerHTML = parsed.data.body.replace(/\n/g, "<br>");
    });

// ===== Load Reviews Content from Markdown ====
    async function fetchReviews() {
    const reviewFolder = '/content/reviews/'; // where .md files are stored in repo
    const reviewFiles = [
      'asonele.md',
      'yams.md',
      // Add more review filenames here
    ];

    const container = document.getElementById('reviews-container');

    for (const file of reviewFiles) {
      const res = await fetch(`${reviewFolder}${file}`);
      const text = await res.text();

      // Extract frontmatter using regex
      const frontmatter = /---\s*([\s\S]*?)\s*---/.exec(text);
      if (!frontmatter) continue;

      const data = Object.fromEntries(
        frontmatter[1].split('\n').map(line => {
          const [key, ...value] = line.split(':');
          return [key.trim(), value.join(':').trim().replace(/^"|"$/g, '')];
        })
      );

      // Create review element
      const reviewEl = document.createElement('div');
      reviewEl.classList.add('col-3');
      reviewEl.innerHTML = `
        <i class="fa fa-quote-left"></i>
        <p>${data.message}</p>
        <div class="rating">
          ${[...Array(5)].map((_, i) =>
            `<i class="fa fa-star${i < data.rating ? '' : '-o'}"></i>`
          ).join('')}
        </div>
        ${data.image ? `<img src="${data.image}" alt="${data.name}">` : ''}
        <h3>${data.name}</h3>
      `;
      container.appendChild(reviewEl);
    }
  }

  fetchReviews();

  async function loadAllProducts() {
      const container = document.querySelector('.row');
    
      // Fetch file list from GitHub API
      const res = await fetch('https://api.github.com/repos/yamkel-cell/sutiyam/contents/content/products');
      const files = await res.json();
    
      for (let file of files) {
        if (file.name.endsWith('.md')) {
          const productRes = await fetch(file.download_url);
          const md = await productRes.text();
          const { data } = window.matter(md);
    
          const thumbnails = JSON.stringify(data.thumbnails || []);
    
          const productHTML = `
            <div class="col-3">
              <br>
              <img class="product-image" style="flex-basis: 15%; width: 250px; height: 330px;"
                   src="${data.image}" 
                   alt="${data.alt || data.title}" 
                   title="Preview Now"
                   onclick='openGallery(this)' 
                   data-large="${data.image}"
                   data-thumbnails='${thumbnails}'>
              <h4>${data.title}</h4>
            </div>
          `;
          container.insertAdjacentHTML('beforeend', productHTML);
        }
      }
    }
    
    loadAllProducts();

 // ====== RATING SYSTEM ======
  document.querySelectorAll('.rating').forEach(function (ratingBlock) {
  const stars = ratingBlock.querySelectorAll('.fa-star');
  const productId = ratingBlock.getAttribute('data-product-id');

  stars.forEach(function (star) {
    // Hover effect
    star.addEventListener('mouseover', function () {
      const rating = parseInt(this.getAttribute('data-rating'));
      highlightStars(stars, rating);
    });

    // Remove hover effect
    star.addEventListener('mouseout', function () {
      const selected = parseInt(ratingBlock.getAttribute('data-selected')) || 0;
      highlightStars(stars, selected);
    });

    // Click event (select rating)
    star.addEventListener('click', function () {
      const rating = parseInt(this.getAttribute('data-rating'));

      if (hasVoted(productId)) {
        alert("You have already rated this product.");
        return;
      }

      ratingBlock.setAttribute('data-selected', rating);
      highlightStars(stars, rating);

      // Save vote & submit
      registerVote(productId, rating);

      console.log(`You rated product ${productId} with ${rating} stars`);
    });
  });

  // Function to highlight stars
  function highlightStars(stars, rating) {
    stars.forEach(function (star) {
      star.classList.remove('hover', 'selected');
      if (parseInt(star.getAttribute('data-rating')) <= rating) {
        star.classList.add('selected');
      }
    });
  }
});


  function hasVoted(productId) {
  return localStorage.getItem(`voted_${productId}`) === 'true';
}

function registerVote(productId, rating) {
  if (hasVoted(productId)) {
    alert('You have already rated this product.');
    return;
  }
  
  // Save locally
  localStorage.setItem(`voted_${productId}`, 'true');

  // Submit via email
  submitRatingByEmail(productId, rating);
}

function submitRatingByEmail(productId, rating) {
  const email = "sutiyam.orders@gmail.com";
  const subject = `New Rating for Product ID: ${productId}`;
  const body = `User submitted a rating of ${rating} for product ID: ${productId}.`;

  window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
// ====== END OF RATING SYSTEM ======



/*
  // convert all URLs to Netlify Image CDN format

  document.querySelectorAll('.col-4').forEach(product => {
  // Rewrite main-img src
  const img = product.querySelector('.main-img');
  if (!img) return;

  const rewriteUrl = (url, width = 600) => {
    // Remove leading slash if present, to avoid double slashes
    const cleanUrl = url.startsWith('/') ? url.slice(1) : url;
    return `/.netlify/images?url=/${cleanUrl}&w=${width}&fit=cover`;
  };

  // Update src
  const originalSrc = img.getAttribute('src');
  if (originalSrc) img.setAttribute('src', rewriteUrl(originalSrc, 600));

  // Update data-large with bigger size for gallery
  const dataLarge = img.getAttribute('data-large');
  if (dataLarge) img.setAttribute('data-large', rewriteUrl(dataLarge, 1000));

  // Update data-color-images (JSON object)
  const dataColorImages = img.getAttribute('data-color-images');
  if (dataColorImages) {
    try {
      const colorImagesObj = JSON.parse(dataColorImages);
      for (const color in colorImagesObj) {
        colorImagesObj[color] = rewriteUrl(colorImagesObj[color], 600);
      }
      img.setAttribute('data-color-images', JSON.stringify(colorImagesObj));
    } catch (e) {
      console.warn('Invalid JSON in data-color-images', e);
    }
  }

  // Update data-thumbnails (JSON array)
  const dataThumbnails = img.getAttribute('data-thumbnails');
  if (dataThumbnails) {
    try {
      const thumbnailsArr = JSON.parse(dataThumbnails);
      const updatedThumbs = thumbnailsArr.map(url => rewriteUrl(url, 300));
      img.setAttribute('data-thumbnails', JSON.stringify(updatedThumbs));
    } catch (e) {
      console.warn('Invalid JSON in data-thumbnails', e);
    }
  }
});
*/
// ====== END OF SCRIPT ======