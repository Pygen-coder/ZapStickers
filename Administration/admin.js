document.addEventListener("DOMContentLoaded", () => {
    // --- Firebase Configuration ---
    const firebaseConfig = {
        apiKey: "AIzaSyBMmGBNL2t0eEa_gHUcFdJg9TkTEaNsZ6g",
        authDomain: "zapstickers-85f48.firebaseapp.com",
        projectId: "zapstickers-85f48",
        storageBucket: "zapstickers-85f48.appspot.com",
        messagingSenderId: "245400540535",
        appId: "1:245400540535:web:f6aa0s8ddaf7abbebb3d72"
    };

    // Initialize Firebase
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
    
    const db = firebase.firestore();
    const auth = firebase.auth();

    // --- Firestore References ---
    const productsRef = db.collection('products');
    const couponsRef = db.collection('coupons');

    // --- Product DOM Elements ---
    const productForm = document.getElementById('product-form');
    const productListContainer = document.getElementById('product-list-container');
    const formTitle = document.getElementById('form-title');
    const submitBtn = document.getElementById('form-submit-btn');
    const cancelBtn = document.getElementById('form-cancel-btn');
    const productIdField = document.getElementById('product-id');
    const productImageFile = document.getElementById('product-image-file');
    const imagePreview = document.getElementById('image-preview');
    const imagePreviewText = document.getElementById('image-preview-text');
    const productImageBase64 = document.getElementById('product-image-base64');

    // --- Coupon DOM Elements ---
    const couponForm = document.getElementById('coupon-form');
    const couponListContainer = document.getElementById('coupon-list-container');
    const couponFormTitle = document.getElementById('coupon-form-title');
    const couponSubmitBtn = document.getElementById('coupon-form-submit-btn');
    const couponCancelBtn = document.getElementById('coupon-form-cancel-btn');
    const couponIdField = document.getElementById('coupon-id');

    // --- State ---
    let isEditMode = false;
    let isCouponEditMode = false;

    // --- Product Functions ---
    const resetForm = () => {
        productForm.reset();
        productIdField.value = '';
        productImageBase64.value = ''; // Clear Base64 data
        formTitle.textContent = 'Add New Product';
        submitBtn.textContent = 'Add Product';
        submitBtn.disabled = false;
        cancelBtn.classList.add('hidden');
        isEditMode = false;

        // Reset image preview
        imagePreview.classList.add('hidden');
        imagePreviewText.classList.remove('hidden');
        imagePreview.src = '#';
    };

    const populateFormForEdit = (product, id) => {
        formTitle.textContent = 'Edit Product';
        submitBtn.textContent = 'Save Changes';
        cancelBtn.classList.remove('hidden');
        
        productIdField.value = id;
        document.getElementById('product-name').value = product.name;
        document.getElementById('product-price').value = product.price;
        document.getElementById('product-category').value = product.category;
        document.getElementById('product-description').value = product.description || '';
        document.getElementById('product-keywords').value = product.keywords ? product.keywords.join(', ') : '';
        
        // Handle image preview for existing product
        if (product.image) {
            productImageBase64.value = product.image; // Store the existing Base64 string
            imagePreview.src = product.image; // Display it
            imagePreview.classList.remove('hidden');
            imagePreviewText.classList.add('hidden');
        }
        
        isEditMode = true;
        productForm.scrollIntoView({ behavior: 'smooth' });
    };

    const renderProducts = (products) => {
        productListContainer.innerHTML = '';
        const productsByCategory = products.reduce((acc, product) => {
            const category = product.category || 'uncategorized';
            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push(product);
            return acc;
        }, {});
        const categoryOrder = ['skin-mobile', 'skin-laptop', 'skin-tablet', 'sticker', 'decal'];
        const sortedCategories = Object.keys(productsByCategory).sort((a, b) => {
            const indexA = categoryOrder.indexOf(a);
            const indexB = categoryOrder.indexOf(b);
            if (indexA === -1) return 1;
            if (indexB === -1) return -1;
            return indexA - indexB;
        });
        if (sortedCategories.length === 0) {
            productListContainer.innerHTML = '<p>No products found. Add one to get started!</p>';
            return;
        }
        for (const category of sortedCategories) {
            const categoryName = category.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            const section = document.createElement('div');
            section.className = 'category-section';
            section.innerHTML = `<h3>${categoryName}</h3><div class="product-grid-admin"></div>`;
            const grid = section.querySelector('.product-grid-admin');
            productsByCategory[category].forEach(product => {
                const isFeatured = product.isFeatured === true;
                const card = document.createElement('div');
                card.className = 'product-card-admin';
                card.dataset.id = product.id;
                card.innerHTML = `
                    <div class="card-actions">
                        <button class="btn-icon btn-star ${isFeatured ? 'featured' : ''}" title="Toggle Featured"><i class="fa-solid fa-star"></i></button>
                        <button class="btn-icon btn-edit" title="Edit Product"><i class="fa-solid fa-pencil"></i></button>
                        <button class="btn-icon btn-delete" title="Delete Product"><i class="fa-solid fa-trash"></i></button>
                    </div>
                    <img src="${product.image}" alt="${product.name}" onerror="this.src='https://placehold.co/200x150/2c2c2c/f0f2f5?text=No+Image'">
                    <div>
                        <h3>${product.name}</h3>
                        <p>₹${product.price.toFixed(2)}</p>
                    </div>
                `;
                grid.appendChild(card);
            });
            productListContainer.appendChild(section);
        }
    };

    // --- Coupon Functions ---
    const resetCouponForm = () => {
        couponForm.reset();
        couponIdField.value = '';
        couponFormTitle.textContent = 'Add New Coupon';
        couponSubmitBtn.textContent = 'Add Coupon';
        couponCancelBtn.classList.add('hidden');
        isCouponEditMode = false;
    };

    const populateCouponFormForEdit = (coupon, id) => {
        couponFormTitle.textContent = 'Edit Coupon';
        couponSubmitBtn.textContent = 'Save Changes';
        couponCancelBtn.classList.remove('hidden');
        document.getElementById('coupon-id').value = id;
        document.getElementById('coupon-code').value = coupon.code;
        document.getElementById('coupon-type').value = coupon.type;
        document.getElementById('coupon-value').value = coupon.value;
        document.getElementById('min-purchase').value = coupon.minPurchase || '';
        document.getElementById('usage-limit').value = coupon.usageLimit || '';
        if (coupon.expiryDate) {
            document.getElementById('expiry-date').value = coupon.expiryDate.toDate().toISOString().split('T')[0];
        } else {
            document.getElementById('expiry-date').value = '';
        }
        isCouponEditMode = true;
        couponForm.scrollIntoView({ behavior: 'smooth' });
    };

    const renderCoupons = (coupons) => {
        couponListContainer.innerHTML = '';
        if (coupons.length === 0) {
            couponListContainer.innerHTML = '<p>No coupons found. Add one to get started!</p>';
            return;
        }
        coupons.forEach(coupon => {
            const card = document.createElement('div');
            card.className = 'coupon-card-admin';
            card.dataset.id = coupon.id;
            const discountText = coupon.type === 'percentage' ? `${coupon.value}% OFF` : `₹${coupon.value} OFF`;
            const expiryText = coupon.expiryDate ? `Expires on: ${coupon.expiryDate.toLocaleDateString()}` : 'No expiry';
            const minPurchaseText = coupon.minPurchase ? ` | Min Purchase: ₹${coupon.minPurchase}` : '';
            const usageText = coupon.usageLimit ? `Uses: ${coupon.timesUsed} / ${coupon.usageLimit}` : 'Unlimited uses';

            card.innerHTML = `
                <div class="coupon-details">
                    <h3>${coupon.code}</h3>
                    <p><strong>${discountText}</strong>${minPurchaseText}</p>
                    <p>${expiryText} | ${usageText}</p>
                </div>
                <div class="coupon-card-actions">
                    <button class="btn-icon btn-edit-coupon" title="Edit Coupon"><i class="fa-solid fa-pencil"></i></button>
                    <button class="btn-icon btn-delete-coupon" title="Delete Coupon"><i class="fa-solid fa-trash"></i></button>
                </div>
            `;
            couponListContainer.appendChild(card);
        });
    };

    // --- Authentication & Real-time Listeners ---
    auth.signInAnonymously().catch(error => {
        console.error("Anonymous sign-in failed:", error);
        alert("Could not connect to the database. Check console for details.");
    });

    auth.onAuthStateChanged(user => {
        if (user) {
            productsRef.orderBy('createdAt', 'desc').onSnapshot(snapshot => {
                const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                renderProducts(products);
            }, error => console.error("Error fetching products: ", error));

            couponsRef.orderBy('createdAt', 'desc').onSnapshot(snapshot => {
                const coupons = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                renderCoupons(coupons);
            }, error => console.error("Error fetching coupons: ", error));

        } else {
            productListContainer.innerHTML = '<p>Please sign in to manage products.</p>';
            couponListContainer.innerHTML = '<p>Please sign in to manage coupons.</p>';
        }
    });

    // --- EVENT LISTENERS ---
    
    // Image to Base64 Handler
    productImageFile.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            // Check file size
            if (file.size > 1048576) { // 1 MiB limit
                alert("Image is too large! Please select an image smaller than 1 MB.");
                productImageFile.value = ""; // Clear the file input
                return;
            }
            
            const reader = new FileReader();
            reader.onload = (event) => {
                const base64String = event.target.result;
                imagePreview.src = base64String;
                productImageBase64.value = base64String; // Store the string
                imagePreview.classList.remove('hidden');
                imagePreviewText.classList.add('hidden');
            };
            reader.onerror = (error) => {
                console.error("Error reading file:", error);
                alert("Failed to read the image file.");
            };
            reader.readAsDataURL(file); // This generates the Base64 string
        }
    });

    // Product Form Submission
    productForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const id = productIdField.value;
        const imageBase64 = productImageBase64.value;

        if (!imageBase64) {
            alert('Please select an image for the product.');
            return;
        }

        submitBtn.disabled = true;
        const keywordsArray = document.getElementById('product-keywords').value.trim().split(',').map(kw => kw.trim()).filter(kw => kw !== '');
        
        const productData = {
            name: document.getElementById('product-name').value,
            price: parseFloat(document.getElementById('product-price').value),
            image: imageBase64, // Save the Base64 string
            category: document.getElementById('product-category').value,
            description: document.getElementById('product-description').value,
            keywords: keywordsArray
        };

        try {
            if (isEditMode && id) {
                await productsRef.doc(id).update(productData);
                alert('Product updated successfully!');
            } else {
                productData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
                productData.isFeatured = false;
                await productsRef.add(productData);
                alert('Product added successfully!');
            }
            resetForm();
        } catch (error) {
            console.error("Database error:", error);
            alert("Error saving product: " + error.message + "\n\nThis might be because the image is too large for the database document (limit is ~1MB).");
            submitBtn.disabled = false;
        }
    });

    cancelBtn.addEventListener('click', resetForm);

    productListContainer.addEventListener('click', (e) => {
        const button = e.target.closest('.btn-icon');
        if (!button) return;
        const card = button.closest('.product-card-admin');
        const productId = card.dataset.id;
        if (button.classList.contains('btn-edit')) {
            productsRef.doc(productId).get().then(doc => {
                if (doc.exists) populateFormForEdit(doc.data(), doc.id);
            });
        }
        if (button.classList.contains('btn-delete')) {
            if (confirm('Are you sure you want to delete this product?')) {
                productsRef.doc(productId).delete().catch(error => alert("Error deleting product: " + error.message));
            }
        }
        if (button.classList.contains('btn-star')) {
            productsRef.doc(productId).get().then(doc => {
                if (doc.exists) {
                    const currentStatus = doc.data().isFeatured || false;
                    productsRef.doc(productId).update({ isFeatured: !currentStatus });
                }
            });
        }
    });

    couponForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = couponIdField.value;
        const expiryDateValue = document.getElementById('expiry-date').value;
        const couponData = {
            code: document.getElementById('coupon-code').value.toUpperCase().trim(),
            type: document.getElementById('coupon-type').value,
            value: parseFloat(document.getElementById('coupon-value').value),
            minPurchase: parseFloat(document.getElementById('min-purchase').value) || 0,
            usageLimit: parseInt(document.getElementById('usage-limit').value) || null,
            expiryDate: expiryDateValue ? firebase.firestore.Timestamp.fromDate(new Date(expiryDateValue)) : null,
        };
        try {
            if (isCouponEditMode && id) {
                await couponsRef.doc(id).update(couponData);
                alert('Coupon updated successfully!');
            } else {
                couponData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
                couponData.timesUsed = 0;
                await couponsRef.add(couponData);
                alert('Coupon added successfully!');
            }
            resetCouponForm();
        } catch (error) {
            console.error("Database error:", error);
            alert("Error saving coupon: " + error.message);
        }
    });

    couponCancelBtn.addEventListener('click', resetCouponForm);

    couponListContainer.addEventListener('click', (e) => {
        const button = e.target.closest('.btn-icon');
        if (!button) return;
        const card = button.closest('.coupon-card-admin');
        const couponId = card.dataset.id;
        if (button.classList.contains('btn-edit-coupon')) {
            couponsRef.doc(couponId).get().then(doc => {
                if (doc.exists) populateCouponFormForEdit(doc.data(), doc.id);
            });
        }
        if (button.classList.contains('btn-delete-coupon')) {
            if (confirm('Are you sure you want to delete this coupon?')) {
                couponsRef.doc(couponId).delete().catch(error => alert("Error deleting coupon: " + error.message));
            }
        }
    });
});
