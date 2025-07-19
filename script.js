/* Get references to DOM elements */
const categoryFilter = document.getElementById("categoryFilter");
const productsContainer = document.getElementById("productsContainer");
const chatForm = document.getElementById("chatForm");
const chatWindow = document.getElementById("chatWindow");
const selectedProductsList = document.getElementById("selectedProductsList");

/* Array to track selected products */
let selectedProducts = [];

/* Array to store conversation history for AI context */
let conversationHistory = [
  {
    role: "system",
    content:
      "You are a helpful beauty and skincare advisor for L'Oréal products. You ONLY respond to questions about skincare routines, beauty products, L'Oréal brands, makeup, haircare, and related beauty topics. If someone asks about anything else (politics, sports, general knowledge, etc.), politely decline and redirect the conversation back to beauty and skincare. For example: 'I'm here to help with your beauty and skincare routine using L'Oréal products. What would you like to know about skincare, makeup, or haircare?' Keep responses concise and helpful.",
  },
];

/* Function to save selected products to localStorage */
function saveSelectedProducts() {
  localStorage.setItem(
    "lorealSelectedProducts",
    JSON.stringify(selectedProducts)
  );
}

/* Function to load selected products from localStorage */
function loadSelectedProducts() {
  const saved = localStorage.getItem("lorealSelectedProducts");
  if (saved) {
    try {
      selectedProducts = JSON.parse(saved);
    } catch (error) {
      console.log("Error loading saved products:", error);
      selectedProducts = [];
    }
  }
}

/* Show initial placeholder until user selects a category */
productsContainer.innerHTML = `
  <div class="placeholder-message">
    Select a category to view products
  </div>
`;

/* Load saved products and initialize selected products display */
loadSelectedProducts();
updateSelectedProductsDisplay();

/* Load product data from JSON file */
async function loadProducts() {
  const response = await fetch("products.json");
  const data = await response.json();
  return data.products;
}

/* Create HTML for displaying product cards */
function displayProducts(products) {
  productsContainer.innerHTML = products
    .map((product) => {
      /* Check if this product is already selected */
      const isSelected = selectedProducts.some((p) => p.id === product.id);
      // Apply the selected style to the container, not the inner card
      const selectedStyle = isSelected
        ? "border: 3px solid #e3a525; box-shadow: 0 0 10px rgba(227, 165, 37, 0.3);"
        : "";

      return `
    <div class="product-card-container" data-product-id="${
      product.id
    }" style="cursor: pointer; perspective: 1000px; height: 250px; flex: 0 1 calc(33.333% - 14px); ${selectedStyle}">
      <div class="product-card-inner" style="position: relative; width: 100%; height: 100%; text-align: center; transition: transform 0.6s; transform-style: preserve-3d;">
        
        <!-- Front side of the card -->
        <div class="product-card-front" style="position: absolute; width: 100%; height: 100%; backface-visibility: hidden; display: flex; flex-direction: column; justify-content: center; align-items: center; background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); padding: 15px; box-sizing: border-box;">
          <img src="${product.image}" alt="${
        product.name
      }" style="width: 80px; height: 80px; object-fit: contain; margin-bottom: 10px;">
          <div class="product-info">
            <h3 style="margin: 5px 0; font-size: 16px; color: #333;">${
              product.name
            }</h3>
            <p style="margin: 5px 0; color: #666; font-size: 14px;">${
              product.brand
            }</p>
          </div>
        </div>
        
        <!-- Back side of the card -->
        <div class="product-card-back" style="position: absolute; width: 100%; height: 100%; backface-visibility: hidden; transform: rotateY(180deg); background: #f8f9fa; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); padding: 15px; box-sizing: border-box; display: flex; flex-direction: column; justify-content: center;">
          <h3 style="margin: 0 0 10px 0; font-size: 16px; color: #333; text-align: center;">${
            product.name
          }</h3>
          <p style="margin: 0 0 8px 0; color: #666; font-size: 13px; text-align: center;"><strong>Brand:</strong> ${
            product.brand
          }</p>
          <p style="margin: 0 0 8px 0; color: #666; font-size: 13px; text-align: center;"><strong>Category:</strong> ${
            product.category
          }</p>
          <p style="margin: 0; color: #555; font-size: 12px; text-align: left; line-height: 1.4; overflow-y: auto;">${
            product.description || "No description available"
          }</p>
        </div>
        
      </div>
    </div>
  `;
    })
    .join("");

  /* Add hover and click event listeners to product cards */
  const productCardContainers = document.querySelectorAll(
    ".product-card-container"
  );
  productCardContainers.forEach((container) => {
    const cardInner = container.querySelector(".product-card-inner");

    /* Add hover effect to flip the card */
    container.addEventListener("mouseenter", () => {
      cardInner.style.transform = "rotateY(180deg)";
    });

    container.addEventListener("mouseleave", () => {
      cardInner.style.transform = "rotateY(0deg)";
    });

    /* Add click event listener */
    container.addEventListener("click", () => {
      const productId = container.getAttribute("data-product-id");
      const product = products.find((p) => p.id == productId);
      if (product) {
        addToSelectedProducts(product);
      }
    });
  });
}

/* Add product to selected products list */
function addToSelectedProducts(product) {
  /* Check if product is already selected */
  const isAlreadySelected = selectedProducts.some((p) => p.id === product.id);

  if (!isAlreadySelected) {
    selectedProducts.push(product);
    saveSelectedProducts(); // Save to localStorage
    updateSelectedProductsDisplay();
    /* Refresh the product display to show the visual selection */
    refreshCurrentProductDisplay();
  }
}

/* Remove product from selected products list */
function removeFromSelectedProducts(productId) {
  console.log("Removing product with ID:", productId); // Debug log
  console.log("Current selected products:", selectedProducts); // Debug log

  /* Filter out the product with matching ID - using == instead of === to handle string/number comparison */
  selectedProducts = selectedProducts.filter((p) => p.id != productId);

  console.log("Selected products after removal:", selectedProducts); // Debug log

  saveSelectedProducts(); // Save to localStorage

  /* Update the selected products display */
  updateSelectedProductsDisplay();

  /* Refresh the product display to remove the visual selection */
  refreshCurrentProductDisplay();
}

/* Function to clear all selected products */
function clearAllSelectedProducts() {
  // Clear the array
  selectedProducts = [];

  // Save empty array to localStorage
  saveSelectedProducts();

  // Update the display
  updateSelectedProductsDisplay();

  // Refresh the product display to remove visual selection styling
  refreshCurrentProductDisplay();
}

/* Make removeFromSelectedProducts and clearAllSelectedProducts globally accessible for onclick handlers */
window.removeFromSelectedProducts = removeFromSelectedProducts;
window.clearAllSelectedProducts = clearAllSelectedProducts;

/* Refresh the current product display to update selection styling */
async function refreshCurrentProductDisplay() {
  const selectedCategory = categoryFilter.value;
  if (selectedCategory) {
    const products = await loadProducts();
    const filteredProducts = products.filter(
      (product) => product.category === selectedCategory
    );
    displayProducts(filteredProducts);
  }
}

/* Update the display of selected products */
function updateSelectedProductsDisplay() {
  /* Show message when no products are selected */
  if (selectedProducts.length === 0) {
    selectedProductsList.innerHTML =
      '<p style="color: #666; font-style: italic;">No products selected yet</p>';
    return;
  }

  /* Create HTML for each selected product */
  selectedProductsList.innerHTML = selectedProducts
    .map(
      (product) => `
      <div class="selected-product-item" style="display: flex; align-items: center; gap: 10px; padding: 8px; border: 1px solid #ddd; border-radius: 4px; margin-bottom: 8px;">
        <img src="${product.image}" alt="${product.name}" style="width: 40px; height: 40px; object-fit: contain;">
        <div style="flex: 1;">
          <strong>${product.name}</strong>
          <br><small>${product.brand}</small>
        </div>
        <button onclick="removeFromSelectedProducts('${product.id}')" style="background: #ff003b; color: white; border: none; border-radius: 4px; padding: 4px 8px; cursor: pointer; font-size: 12px;">
          Remove
        </button>
      </div>
    `
    )
    .join("");
}

/* Filter and display products when category changes */
categoryFilter.addEventListener("change", async (e) => {
  const products = await loadProducts();
  const selectedCategory = e.target.value;

  /* filter() creates a new array containing only products 
     where the category matches what the user selected */
  const filteredProducts = products.filter(
    (product) => product.category === selectedCategory
  );

  displayProducts(filteredProducts);
});

/* Chat form submission handler - connect to Mistral API */
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  /* Get the user's message from the input field */
  const userInput = document.getElementById("userInput");
  const userMessage = userInput.value.trim();

  /* Don't process empty messages */
  if (!userMessage) {
    return;
  }

  /* Show user's message in chat window */
  chatWindow.innerHTML += `
    <div style="margin-bottom: 15px; padding: 10px; background: #f0f0f0; border-radius: 8px;">
      <strong>You:</strong> ${userMessage}
    </div>
  `;

  /* Show loading message while waiting for AI response */
  chatWindow.innerHTML += `
    <div id="loadingMessage" style="margin-bottom: 15px; padding: 10px; background: #e8f4f8; border-radius: 8px; color: #666;">
      <strong>AI:</strong> Thinking...
    </div>
  `;

  /* Clear the input field */
  userInput.value = "";

  /* Scroll to bottom of chat window to show user message and loading */
  chatWindow.scrollTop = chatWindow.scrollHeight;

  /* Create context about selected products for the AI */
  let productContext = "";
  if (selectedProducts.length > 0) {
    productContext = `\n\nSelected products: ${selectedProducts
      .map((p) => `${p.name} by ${p.brand} (${p.category})`)
      .join(", ")}`;
  }

  /* Add user message to conversation history */
  conversationHistory.push({
    role: "user",
    content: userMessage + productContext,
  });

  try {
    /* Use full conversation history for AI response */
    const aiResponse = await callMistralAPI(conversationHistory);

    /* Add AI response to conversation history */
    conversationHistory.push({
      role: "assistant",
      content: aiResponse,
    });

    /* Remove loading message */
    document.getElementById("loadingMessage").remove();

    /* Show AI response in chat window */
    const aiResponseElement = document.createElement("div");
    aiResponseElement.style.cssText =
      "margin-bottom: 15px; padding: 10px; background: #e8f4f8; border-radius: 8px;";
    aiResponseElement.innerHTML = `<strong>AI:</strong> ${aiResponse}`;
    chatWindow.appendChild(aiResponseElement);

    /* Scroll to show the beginning of the AI response */
    aiResponseElement.scrollIntoView({ behavior: "smooth", block: "start" });
  } catch (error) {
    /* Remove loading message */
    document.getElementById("loadingMessage").remove();

    /* Show error message */
    chatWindow.innerHTML += `
      <div style="margin-bottom: 15px; padding: 10px; background: #ffe6e6; border-radius: 8px; color: #d00;">
        <strong>Error:</strong> Sorry, I couldn't get a response right now. Please try again.
      </div>
    `;

    /* Scroll to bottom to show error message */
    chatWindow.scrollTop = chatWindow.scrollHeight;
  }
});

/* Generate skincare routine using selected products */
async function generateRoutine() {
  /* Check if any products are selected */
  if (selectedProducts.length === 0) {
    /* Show message in chat window if no products selected */
    chatWindow.innerHTML += `
      <div style="margin-bottom: 15px; padding: 10px; background: #ffe6e6; border-radius: 8px; color: #d00;">
        <strong>Notice:</strong> Please select some products first before generating a routine.
      </div>
    `;
    chatWindow.scrollTop = chatWindow.scrollHeight;
    return;
  }

  /* Show loading message in chat window */
  chatWindow.innerHTML += `
    <div id="routineLoadingMessage" style="margin-bottom: 15px; padding: 10px; background: #e8f4f8; border-radius: 8px; color: #666;">
      <strong>AI:</strong> Creating your personalized routine...
    </div>
  `;

  /* Scroll to bottom of chat window to show loading */
  chatWindow.scrollTop = chatWindow.scrollHeight;

  /* Create detailed product information for the AI */
  const productDetails = selectedProducts
    .map((product) => {
      return `${product.name} by ${product.brand} (${product.category}) - ${
        product.description || "No description available"
      }`;
    })
    .join("\n");

  /* Create routine generation message using conversation history */
  const routineMessage = `Please create a personalized skincare routine using these specific products:\n\n${productDetails}\n\nProvide a step-by-step morning and evening routine with explanations for the order and benefits of each product.`;

  /* Add routine request to conversation history */
  conversationHistory.push({
    role: "user",
    content: routineMessage,
  });

  try {
    /* Use conversation history for routine generation */
    const routineResponse = await callMistralAPI(conversationHistory);

    /* Add routine response to conversation history */
    conversationHistory.push({
      role: "assistant",
      content: routineResponse,
    });

    /* Remove loading message */
    document.getElementById("routineLoadingMessage").remove();

    /* Show generated routine in chat window */
    const routineElement = document.createElement("div");
    routineElement.style.cssText =
      "margin-bottom: 15px; padding: 15px; background: #f0f8ff; border-radius: 8px; border-left: 4px solid #4CAF50;";
    routineElement.innerHTML = `
      <strong>🌟 Your Personalized Routine:</strong><br><br>
      ${routineResponse.replace(/\n/g, "<br>")}
    `;
    chatWindow.appendChild(routineElement);

    /* Scroll to show the beginning of the routine response */
    routineElement.scrollIntoView({ behavior: "smooth", block: "start" });
  } catch (error) {
    /* Remove loading message */
    document.getElementById("routineLoadingMessage").remove();

    /* Show error message */
    chatWindow.innerHTML += `
      <div style="margin-bottom: 15px; padding: 10px; background: #ffe6e6; border-radius: 8px; color: #d00;">
        <strong>Error:</strong> Sorry, I couldn't generate your routine right now. Please try again.
      </div>
    `;

    /* Scroll to bottom to show error message */
    chatWindow.scrollTop = chatWindow.scrollHeight;
  }
}

/* Make generateRoutine function globally accessible for onclick handlers */
window.generateRoutine = generateRoutine;

/* Debugging logs - check if functions are loaded correctly */
console.log("generateRoutine function loaded:", typeof generateRoutine);
console.log("callMistralAPI function available:", typeof callMistralAPI);
