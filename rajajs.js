// Inventory data structure
let inventory = JSON.parse(localStorage.getItem('inventory')) || [];

// DOM Elements
const inventoryBody = document.getElementById('inventory-body');
const productForm = document.getElementById('product-form');
const productModal = document.getElementById('product-modal');
const modalTitle = document.getElementById('modal-title');
const closeModal = document.querySelector('.close');
const addProductBtn = document.getElementById('add-product-btn');
const totalValueElement = document.getElementById('total-value');
const lowStockCountElement = document.getElementById('low-stock-count');
const totalProductsElement = document.getElementById('total-products');
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    renderInventory();
    updateDashboard();
    
    // Event Listeners
    productForm.addEventListener('submit', handleProductSubmit);
    addProductBtn.addEventListener('click', () => openModal());
    closeModal.addEventListener('click', () => closeModalWindow());
    searchBtn.addEventListener('click', handleSearch);
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === productModal) {
            closeModalWindow();
        }
    });
});

// Render inventory table
function renderInventory(items = inventory) {
    inventoryBody.innerHTML = '';
    
    if (items.length === 0) {
        inventoryBody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center;">No products found. Add some products to get started.</td>
            </tr>
        `;
        return;
    }
    
    items.forEach(item => {
        const row = document.createElement('tr');
        const inventoryValue = item.quantity * item.costPrice;
        const statusClass = item.quantity < 10 ? 'low-stock' : 'adequate-stock';
        const statusText = item.quantity < 10 ? 'Low Stock' : 'In Stock';
        
        row.innerHTML = `
            <td>${item.name}</td>
            <td>${item.category}</td>
            <td>${item.quantity}</td>
            <td>$${item.costPrice.toFixed(2)}</td>
            <td>$${item.sellingPrice.toFixed(2)}</td>
            <td>$${inventoryValue.toFixed(2)}</td>
            <td class="${statusClass}">${statusText}</td>
            <td>
                <button class="action-btn edit-btn" data-id="${item.id}">Edit</button>
                <button class="action-btn delete-btn" data-id="${item.id}">Delete</button>
            </td>
        `;
        
        inventoryBody.appendChild(row);
    });
    
    // Add event listeners to action buttons
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.getAttribute('data-id');
            editProduct(id);
        });
    });
    
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.getAttribute('data-id');
            deleteProduct(id);
        });
    });
}

// Update dashboard with summary statistics
function updateDashboard() {
    // Calculate total inventory value
    const totalValue = inventory.reduce((sum, item) => {
        return sum + (item.quantity * item.costPrice);
    }, 0);
    
    // Count low stock items (less than 10 in stock)
    const lowStockCount = inventory.filter(item => item.quantity < 10).length;
    
    // Update DOM elements
    totalValueElement.textContent = `$${totalValue.toFixed(2)}`;
    lowStockCountElement.textContent = lowStockCount;
    totalProductsElement.textContent = inventory.length;
}

// Handle product form submission
function handleProductSubmit(e) {
    e.preventDefault();
    
    const productId = document.getElementById('product-id').value;
    const name = document.getElementById('product-name').value;
    const category = document.getElementById('product-category').value;
    const quantity = parseInt(document.getElementById('product-quantity').value);
    const costPrice = parseFloat(document.getElementById('product-cost').value);
    const sellingPrice = parseFloat(document.getElementById('product-price').value);
    
    if (productId) {
        // Update existing product
        const index = inventory.findIndex(item => item.id === productId);
        if (index !== -1) {
            inventory[index] = {
                ...inventory[index],
                name,
                category,
                quantity,
                costPrice,
                sellingPrice
            };
        }
    } else {
        // Add new product
        const newProduct = {
            id: Date.now().toString(),
            name,
            category,
            quantity,
            costPrice,
            sellingPrice,
            dateAdded: new Date().toISOString()
        };
        
        inventory.push(newProduct);
    }
    
    // Save to localStorage
    localStorage.setItem('inventory', JSON.stringify(inventory));
    
    // Update UI
    renderInventory();
    updateDashboard();
    closeModalWindow();
    productForm.reset();
}

// Open modal for adding/editing product
function openModal(product = null) {
    if (product) {
        // Editing existing product
        modalTitle.textContent = 'Edit Product';
        document.getElementById('product-id').value = product.id;
        document.getElementById('product-name').value = product.name;
        document.getElementById('product-category').value = product.category;
        document.getElementById('product-quantity').value = product.quantity;
        document.getElementById('product-cost').value = product.costPrice;
        document.getElementById('product-price').value = product.sellingPrice;
    } else {
        // Adding new product
        modalTitle.textContent = 'Add New Product';
        productForm.reset();
        document.getElementById('product-id').value = '';
    }
    
    productModal.style.display = 'block';
}

// Close modal window
function closeModalWindow() {
    productModal.style.display = 'none';
}

// Edit product
function editProduct(id) {
    const product = inventory.find(item => item.id === id);
    if (product) {
        openModal(product);
    }
}

// Delete product
function deleteProduct(id) {
    if (confirm('Are you sure you want to delete this product?')) {
        inventory = inventory.filter(item => item.id !== id);
        localStorage.setItem('inventory', JSON.stringify(inventory));
        renderInventory();
        updateDashboard();
    }
}

// Handle search
function handleSearch() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    
    if (searchTerm === '') {
        renderInventory();
        return;
    }
    
    const filteredInventory = inventory.filter(item => 
        item.name.toLowerCase().includes(searchTerm) || 
        item.category.toLowerCase().includes(searchTerm)
    );
    
    renderInventory(filteredInventory);
}