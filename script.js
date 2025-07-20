

/* Function to call Mistral AI through Cloudflare Worker - improved with better error handling */
async function callMistralAI(messages) {
  console.log("=== Calling Mistral AI ===");
  console.log("Messages being sent:", messages);

  /* Cloudflare Worker URL that handles the Mistral API requests */
  const workerUrl = "https://steep-band-6628.er2682.workers.dev";

  try {
    /* Make the request to the Cloudflare Worker */
    const response = await fetch(workerUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "mistral-medium-2505",
        messages: messages,
        max_tokens: 500,
        temperature: 0.7,
        api_key_name: "Mistral_API_KEY", // Tell the worker which API key to use
      }),
    });

    console.log("Response status:", response.status);
    console.log("Response headers:", response.headers);

    /* Check if the response is successful */
    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Error Response:", errorText);
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    /* Parse the JSON response */
    const data = await response.json();
    console.log("Full API response:", data);

    /* Check if we have the expected response structure */
    if (
      !data ||
      !data.choices ||
      !data.choices[0] ||
      !data.choices[0].message
    ) {
      console.error("Unexpected response structure:", data);
      throw new Error("Invalid response structure from API");
    }

    /* Return the AI's response message */
    const aiMessage = data.choices[0].message.content;
    console.log("AI Response:", aiMessage);
    return aiMessage;
  } catch (error) {
    /* Log detailed error information for debugging */
    console.error("Error calling Mistral AI:", error);
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
    });

    /* Return a user-friendly error message */
    return "Sorry, I'm having trouble connecting to the AI service right now. Please try again in a moment.";
  }
}

/* Missing chat functions - adding them here */
function addMessageToChat(role, message) {
  const messageDiv = document.createElement("div");
  messageDiv.className = `message ${role}-message`;
  messageDiv.style.cssText = `
    margin: 10px 0;
    padding: 10px;
    border-radius: 8px;
    max-width: 80%;
    word-wrap: break-word;
    ${
      role === "user"
        ? "background: #e3a525; color: white; margin-left: auto;"
        : "background: #f1f1f1; color: #333;"
    }
  `;
  messageDiv.textContent = message;
  chatWindow.appendChild(messageDiv);

  /* Scroll to the top of the new message instead of the bottom of chat window */
  messageDiv.scrollIntoView({ behavior: "smooth", block: "start" });
}

function removeLastMessage() {
  const lastMessage = chatWindow.lastElementChild;
  if (lastMessage) {
    lastMessage.remove();
  }
}

function showPlaceholderMessage() {
  chatWindow.innerHTML = `
    <div style="text-align: center; color: #666; padding: 20px; font-style: italic;">
      Welcome! Start by selecting products and ask me about your skincare routine.
    </div>
  `;
}

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
      "You are a helpful beauty and skincare advisor for L'Oréal products. You ONLY respond to questions about skincare routines, beauty products, L'Oréal brands, makeup, haircare, and related beauty topics. If someone asks about anything else (politics, sports, general knowledge, etc.), politely decline and redirect the conversation back to beauty and skincare. Keep responses concise and helpful.",
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
      const selectedStyle = isSelected
        ? "border: 3px solid #e3a525; box-shadow: 0 0 10px rgba(227,165,37,0.3);"
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
  const isAlreadySelected = selectedProducts.some((p) => p.id === product.id);

  if (!isAlreadySelected) {
    selectedProducts.push(product);
    saveSelectedProducts();
    updateSelectedProductsDisplay();
    refreshCurrentProductDisplay();
  }
}

/* Remove product from selected products list */
function removeFromSelectedProducts(productId) {
  selectedProducts = selectedProducts.filter((p) => p.id != productId);
  saveSelectedProducts();
  updateSelectedProductsDisplay();
  refreshCurrentProductDisplay();
}

/* Function to clear all selected products */
function clearAllSelectedProducts() {
  selectedProducts = [];
  saveSelectedProducts();
  updateSelectedProductsDisplay();
  refreshCurrentProductDisplay();
}

/* Make functions globally accessible for onclick handlers */
window.removeFromSelectedProducts = removeFromSelectedProducts;
window.clearAllSelectedProducts = clearAllSelectedProducts;
window.generateRoutine = generateRoutine;

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
  if (selectedProducts.length === 0) {
    selectedProductsList.innerHTML =
      '<p style="color: #666; font-style: italic;">No products selected yet</p>';
    return;
  }

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
  const filteredProducts = products.filter(
    (product) => product.category === selectedCategory
  );
  displayProducts(filteredProducts);
});

/* Chat form submission handler - improved error handling */
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const userInput = document.getElementById("userInput");
  const userMessage = userInput.value.trim();

  /* Don't process empty messages */
  if (!userMessage) {
    return;
  }

  /* Add user message to chat window */
  addMessageToChat("user", userMessage);

  /* Show loading message while waiting for AI response */
  addMessageToChat("assistant", "Thinking...");

  /* Clear the input field */
  userInput.value = "";

  /* Create context about selected products if any are selected */
  let productContext = "";
  if (selectedProducts.length > 0) {
    productContext = `\n\nSelected products: ${selectedProducts
      .map((p) => `${p.name} by ${p.brand} (${p.category})`)
      .join(", ")}`;
  }

  /* Add user message to conversation history for context */
  conversationHistory.push({
    role: "user",
    content: userMessage + productContext,
  });

  try {
    console.log("Sending conversation history:", conversationHistory);

    /* Get AI response using the Mistral API */
    const aiResponse = await callMistralAI(conversationHistory);

    /* Add AI response to conversation history */
    conversationHistory.push({
      role: "assistant",
      content: aiResponse,
    });

    /* Remove loading message and add AI response */
    removeLastMessage();
    addMessageToChat("assistant", aiResponse);
  } catch (error) {
    console.error("Chat error:", error);
    /* Remove loading message and show error */
    removeLastMessage();
    addMessageToChat(
      "assistant",
      "Sorry, I couldn't get a response right now. Please check your internet connection and try again."
    );
  }
});

/* Generate skincare routine using selected products - improved error handling */
async function generateRoutine() {
  /* Check if user has selected any products */
  if (selectedProducts.length === 0) {
    addMessageToChat(
      "assistant",
      "Please select some products first before generating a routine."
    );
    return;
  }

  /* Add user request to chat window */
  addMessageToChat("user", "Generate my skincare routine");

  /* Show loading message */
  addMessageToChat("assistant", "Creating your personalized routine...");

  /* Create detailed product information for the AI */
  const productDetails = selectedProducts
    .map((product) => {
      return `${product.name} by ${product.brand} (${product.category}) - ${
        product.description || "No description available"
      }`;
    })
    .join("\n");

  /* Create the routine generation message */
  const routineMessage = `Please create a personalized skincare routine using these specific products:\n\n${productDetails}\n\nProvide a step-by-step morning and evening routine with explanations for the order and benefits of each product.`;

  /* Add routine request to conversation history */
  conversationHistory.push({
    role: "user",
    content: routineMessage,
  });

  try {
    console.log("Generating routine with products:", selectedProducts);

    /* Get routine response from AI */
    const routineResponse = await callMistralAI(conversationHistory);

    /* Add routine response to conversation history */
    conversationHistory.push({
      role: "assistant",
      content: routineResponse,
    });

    /* Remove loading message and add routine */
    removeLastMessage();
    addMessageToChat(
      "assistant",
      `🌟 Your Personalized Routine:\n\n${routineResponse}`
    );
  } catch (error) {
    console.error("Routine generation error:", error);
    /* Remove loading message and show error */
    removeLastMessage();
    addMessageToChat(
      "assistant",
      "Sorry, I couldn't generate your routine right now. Please check your internet connection and try again."
    );
  }
}

/* Initialize the application */
document.addEventListener("DOMContentLoaded", function () {
  showPlaceholderMessage();
});
