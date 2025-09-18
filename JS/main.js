document.addEventListener("DOMContentLoaded", () => {
    // Firebase configuration
    const firebaseConfig = {
        apiKey: "AIzaSyBMmGBNL2t0eEa_gHUcFdJg9TkTEaNsZ6g",
        authDomain: "zapstickers-85f48.firebaseapp.com",
        projectId: "zapstickers-85f48",
        storageBucket: "zapstickers-85f48.firebasestorage.app",
        messagingSenderId: "245400540535",
        appId: "1:245400540535:web:f6aa0s8ddaf7abbebb3d72"
    };

    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
    
    const auth = firebase.auth();
    const db = firebase.firestore();
    const googleProvider = new firebase.auth.GoogleAuthProvider();
    const githubProvider = new firebase.auth.GithubAuthProvider();

    let unsubscribeCartListener = null;
    let unsubscribeWishlistListener = null;
    let unsubscribeAddressListener = null;
    

    const indianStatesAndDistricts = {
        "Andaman and Nicobar Islands": ["Nicobar", "North and Middle Andaman", "South Andaman"],
        "Andhra Pradesh": ["Anantapur", "Chittoor", "East Godavari", "Guntur", "Krishna", "Kurnool", "Prakasam", "SPSR Nellore", "Srikakulam", "Visakhapatnam", "Vizianagaram", "West Godavari", "YSR Kadapa"],
        "Arunachal Pradesh": ["Tawang", "West Kameng", "East Kameng", "Papum Pare", "Kurung Kumey", "Kra Daadi", "Lower Subansiri", "Upper Subansiri", "West Siang", "East Siang", "Siang", "Upper Siang", "Lower Siang", "Lower Dibang Valley", "Dibang Valley", "Anjaw", "Lohit", "Namsai", "Changlang", "Tirap", "Longding"],
        "Assam": ["Baksa", "Barpeta", "Biswanath", "Bongaigaon", "Cachar", "Charaideo", "Chirang", "Darrang", "Dhemaji", "Dhubri", "Dibrugarh", "Dima Hasao", "Goalpara", "Golaghat", "Hailakandi", "Hojai", "Jorhat", "Kamrup", "Kamrup Metropolitan", "Karbi Anglong", "Karimganj", "Kokrajhar", "Lakhimpur", "Majuli", "Morigaon", "Nagaon", "Nalbari", "Sivasagar", "Sonitpur", "South Salmara-Mankachar", "Tinsukia", "Udalguri", "West Karbi Anglong"],
        "Bihar": ["Araria", "Arwal", "Aurangabad", "Banka", "Begusarai", "Bhagalpur", "Bhojpur", "Buxar", "Darbhanga", "East Champaran", "Gaya", "Gopalganj", "Jamui", "Jehanabad", "Kaimur", "Katihar", "Khagaria", "Kishanganj", "Lakhisarai", "Madhepura", "Madhubani", "Munger", "Muzaffarpur", "Nalanda", "Nawada", "Patna", "Purnia", "Rohtas", "Saharsa", "Samastipur", "Saran", "Sheikhpura", "Sheohar", "Sitamarhi", "Siwan", "Supaul", "Vaishali", "West Champaran"],
        "Chandigarh": ["Chandigarh"],
        "Chhattisgarh": ["Balod", "Baloda Bazar", "Balrampur", "Bastar", "Bemetara", "Bijapur", "Bilaspur", "Dantewada", "Dhamtari", "Durg", "Gariaband", "Janjgir-Champa", "Jashpur", "Kabirdham", "Kanker", "Kondagaon", "Korba", "Koriya", "Mahasamund", "Mungeli", "Narayanpur", "Raigarh", "Raipur", "Rajnandgaon", "Sukma", "Surajpur", "Surguja"],
        "Dadra and Nagar Haveli and Daman and Diu": ["Dadra and Nagar Haveli", "Daman", "Diu"],
        "Delhi": ["Central Delhi", "East Delhi", "New Delhi", "North Delhi", "North East Delhi", "North West Delhi", "Shahdara", "South Delhi", "South East Delhi", "South West Delhi", "West Delhi"],
        "Goa": ["North Goa", "South Goa"],
        "Gujarat": ["Ahmedabad", "Amreli", "Anand", "Aravalli", "Banaskantha", "Bharuch", "Bhavnagar", "Botad", "Chhota Udaipur", "Dahod", "Dang", "Devbhoomi Dwarka", "Gandhinagar", "Gir Somnath", "Jamnagar", "Junagadh", "Kheda", "Kutch", "Mahisagar", "Mehsana", "Morbi", "Narmada", "Navsari", "Panchmahal", "Patan", "Porbandar", "Rajkot", "Sabarkantha", "Surat", "Surendranagar", "Tapi", "Vadodara", "Valsad"],
        "Haryana": ["Ambala", "Bhiwani", "Charkhi Dadri", "Faridabad", "Fatehabad", "Gurugram", "Hisar", "Jhajjar", "Jind", "Kaithal", "Karnal", "Kurukshetra", "Mahendragarh", "Nuh", "Palwal", "Panchkula", "Panipat", "Rewari", "Rohtak", "Sirsa", "Sonipat", "Yamunanagar"],
        "Himachal Pradesh": ["Bilaspur", "Chamba", "Hamirpur", "Kangra", "Kinnaur", "Kullu", "Lahaul and Spiti", "Mandi", "Shimla", "Sirmaur", "Solan", "Una"],
        "Jammu and Kashmir": ["Anantnag", "Bandipora", "Baramulla", "Budgam", "Doda", "Ganderbal", "Jammu", "Kathua", "Kishtwar", "Kulgam", "Kupwara", "Poonch", "Pulwama", "Rajouri", "Ramban", "Reasi", "Samba", "Shopian", "Srinagar", "Udhampur"],
        "Jharkhand": ["Bokaro", "Chatra", "Deoghar", "Dhanbad", "Dumka", "East Singhbhum", "Garhwa", "Giridih", "Godda", "Gumla", "Hazaribagh", "Jamtara", "Khunti", "Koderma", "Latehar", "Lohardaga", "Pakur", "Palamu", "Ramgarh", "Ranchi", "Sahebganj", "Seraikela Kharsawan", "Simdega", "West Singhbhum"],
        "Karnataka": ["Bagalkot", "Ballari", "Belagavi", "Bengaluru Rural", "Bengaluru Urban", "Bidar", "Chamarajanagar", "Chikballapur", "Chikkamagaluru", "Chitradurga", "Dakshina Kannada", "Davanagere", "Dharwad", "Gadag", "Hassan", "Haveri", "Kalaburagi", "Kodagu", "Kolar", "Koppal", "Mandya", "Mysuru", "Raichur", "Ramanagara", "Shivamogga", "Tumakuru", "Udupi", "Uttara Kannada", "Vijayapura", "Yadgir"],
        "Kerala": ["Alappuzha", "Ernakulam", "Idukki", "Kannur", "Kasaragod", "Kollam", "Kottayam", "Kozhikode", "Malappuram", "Palakkad", "Pathanamthitta", "Thiruvananthapuram", "Thrissur", "Wayanad"],
        "Ladakh": ["Kargil", "Leh"],
        "Lakshadweep": ["Lakshadweep"],
        "Madhya Pradesh": ["Agar Malwa", "Alirajpur", "Anuppur", "Ashoknagar", "Balaghat", "Barwani", "Betul", "Bhind", "Bhopal", "Burhanpur", "Chhatarpur", "Chhindwara", "Damoh", "Datia", "Dewas", "Dhar", "Dindori", "Guna", "Gwalior", "Harda", "Hoshangabad", "Indore", "Jabalpur", "Jhabua", "Katni", "Khandwa", "Khargone", "Mandla", "Mandsaur", "Morena", "Narsinghpur", "Neemuch", "Panna", "Raisen", "Rajgarh", "Ratlam", "Rewa", "Sagar", "Satna", "Sehore", "Seoni", "Shahdol", "Shajapur", "Sheopur", "Shivpuri", "Sidhi", "Singrauli", "Tikamgarh", "Ujjain", "Umaria", "Vidisha"],
        "Maharashtra": ["Ahmednagar", "Akola", "Amravati", "Aurangabad", "Beed", "Bhandara", "Buldhana", "Chandrapur", "Dhule", "Gadchiroli", "Gondia", "Hingoli", "Jalgaon", "Jalna", "Kolhapur", "Latur", "Mumbai City", "Mumbai Suburban", "Nagpur", "Nanded", "Nandurbar", "Nashik", "Osmanabad", "Palghar", "Parbhani", "Pune", "Raigad", "Ratnagiri", "Sangli", "Satara", "Sindhudurg", "Solapur", "Thane", "Wardha", "Washim", "Yavatmal"],
        "Manipur": ["Bishnupur", "Chandel", "Churachandpur", "Imphal East", "Imphal West", "Jiribam", "Kakching", "Kamjong", "Kangpokpi", "Noney", "Pherzawl", "Senapati", "Tamenglong", "Tengnoupal", "Thoubal", "Ukhrul"],
        "Meghalaya": ["East Garo Hills", "East Jaintia Hills", "East Khasi Hills", "North Garo Hills", "Ri Bhoi", "South Garo Hills", "South West Garo Hills", "South West Khasi Hills", "West Garo Hills", "West Jaintia Hills", "West Khasi Hills"],
        "Mizoram": ["Aizawl", "Champhai", "Kolasib", "Lawngtlai", "Lunglei", "Mamit", "Saiha", "Serchhip"],
        "Nagaland": ["Dimapur", "Kiphire", "Kohima", "Longleng", "Mokokchung", "Mon", "Peren", "Phek", "Tuensang", "Wokha", "Zunheboto"],
        "Odisha": ["Angul", "Balangir", "Balasore", "Bargarh", "Bhadrak", "Boudh", "Cuttack", "Deogarh", "Dhenkanal", "Gajapati", "Ganjam", "Jagatsinghpur", "Jajpur", "Jharsuguda", "Kalahandi", "Kandhamal", "Kendrapara", "Kendujhar", "Khordha", "Koraput", "Malkangiri", "Mayurbhanj", "Nabarangpur", "Nayagarh", "Nuapada", "Puri", "Rayagada", "Sambalpur", "Sonepur", "Sundargarh"],
        "Puducherry": ["Karaikal", "Mahe", "Puducherry", "Yanam"],
        "Punjab": ["Amritsar", "Barnala", "Bathinda", "Faridkot", "Fatehgarh Sahib", "Fazilka", "Ferozepur", "Gurdaspur", "Hoshiarpur", "Jalandhar", "Kapurthala", "Ludhiana", "Mansa", "Moga", "Muktsar", "Pathankot", "Patiala", "Rupnagar", "Sahibzada Ajit Singh Nagar", "Sangrur", "Shahid Bhagat Singh Nagar", "Sri Muktsar Sahib", "Tarn Taran"],
        "Rajasthan": ["Ajmer", "Alwar", "Banswara", "Baran", "Barmer", "Bharatpur", "Bhilwara", "Bikaner", "Bundi", "Chittorgarh", "Churu", "Dausa", "Dholpur", "Dungarpur", "Hanumangarh", "Jaipur", "Jaisalmer", "Jalore", "Jhalawar", "Jhunjhunu", "Jodhpur", "Karauli", "Kota", "Nagaur", "Pali", "Pratapgarh", "Rajsamand", "Sawai Madhopur", "Sikar", "Sirohi", "Sri Ganganagar", "Tonk", "Udaipur"],
        "Sikkim": ["East Sikkim", "North Sikkim", "South Sikkim", "West Sikkim"],
        "Tamil Nadu": ["Ariyalur", "Chengalpattu", "Chennai", "Coimbatore", "Cuddalore", "Dharmapuri", "Dindigul", "Erode", "Kallakurichi", "Kanchipuram", "Kanyakumari", "Karur", "Krishnagiri", "Madurai", "Nagapattinam", "Namakkal", "Nilgiris", "Perambalur", "Pudukkottai", "Ramanathapuram", "Ranipet", "Salem", "Sivaganga", "Tenkasi", "Thanjavur", "Theni", "Thoothukudi", "Tiruchirappalli", "Tirunelveli", "Tirupathur", "Tiruppur", "Tiruvallur", "Tiruvannamalai", "Tiruvarur", "Vellore", "Viluppuram", "Virudhunagar"],
        "Telangana": ["Adilabad", "Bhadradri Kothagudem", "Hyderabad", "Jagtial", "Jangaon", "Jayashankar Bhupalpally", "Jogulamba Gadwal", "Kamareddy", "Karimnagar", "Khammam", "Komaram Bheem", "Mahabubabad", "Mahabubnagar", "Mancherial", "Medak", "Medchal-Malkajgiri", "Nagarkurnool", "Nalgonda", "Nirmal", "Nizamabad", "Peddapalli", "Rajanna Sircilla", "Ranga Reddy", "Sangareddy", "Siddipet", "Suryapet", "Vikarabad", "Wanaparthy", "Warangal Rural", "Warangal Urban", "Yadadri Bhuvanagiri"],
        "Tripura": ["Dhalai", "Gomati", "Khowai", "North Tripura", "Sepahijala", "South Tripura", "Unakoti", "West Tripura"],
        "Uttar Pradesh": ["Agra", "Aligarh", "Ambedkar Nagar", "Amethi", "Amroha", "Auraiya", "Ayodhya", "Azamgarh", "Baghpat", "Bahraich", "Ballia", "Balrampur", "Banda", "Barabanki", "Bareilly", "Basti", "Bhadohi", "Bijnor", "Budaun", "Bulandshahr", "Chandauli", "Chitrakoot", "Deoria", "Etah", "Etawah", "Farrukhabad", "Fatehpur", "Firozabad", "Gautam Buddh Nagar", "Ghaziabad", "Ghazipur", "Gonda", "Gorakhpur", "Hamirpur", "Hapur", "Hardoi", "Hathras", "Jalaun", "Jaunpur", "Jhansi", "Kannauj", "Kanpur Dehat", "Kanpur Nagar", "Kasganj", "Kaushambi", "Kheri", "Kushinagar", "Lalitpur", "Lucknow", "Maharajganj", "Mahoba", "Mainpuri", "Mathura", "Mau", "Meerut", "Mirzapur", "Moradabad", "Muzaffarnagar", "Pilibhit", "Pratapgarh", "Prayagraj", "Raebareili", "Rampur", "Saharanpur", "Sambhal", "Sant Kabir Nagar", "Shahjahanpur", "Shamli", "Shravasti", "Siddharthnagar", "Sitapur", "Sonbhadra", "Sultanpur", "Unnao", "Varanasi"],
        "Uttarakhand": ["Almora", "Bageshwar", "Chamoli", "Champawat", "Dehradun", "Haridwar", "Nainital", "Pauri Garhwal", "Pithoragarh", "Rudraprayag", "Tehri Garhwal", "Udham Singh Nagar", "Uttarkashi"],
        "West Bengal": ["Alipurduar", "Bankura", "Birbhum", "Cooch Behar", "Dakshin Dinajpur", "Darjeeling", "Hooghly", "Howrah", "Jalpaiguri", "Jhargram", "Kalimpong", "Kolkata", "Malda", "Murshidabad", "Nadia", "North 24 Parganas", "Paschim Bardhaman", "Paschim Medinipur", "Purba Bardhaman", "Purba Medinipur", "Purulia", "South 24 Parganas", "Uttar Dinajpur"]
    };

    const initializeNavbarScripts = () => {
        const hamburgerBtn = document.querySelector('.hamburger-btn');
        const mobileNav = document.querySelector('.mobile-nav');
        const mobileNavCloseBtn = document.querySelector('.mobile-nav-close-btn');
        const body = document.body;

        if (hamburgerBtn && mobileNav) {
            hamburgerBtn.addEventListener('click', () => {
                body.classList.toggle('mobile-nav-active');
            });

            if (mobileNavCloseBtn) {
                mobileNavCloseBtn.addEventListener('click', () => {
                    body.classList.remove('mobile-nav-active');
                });
            }

            mobileNav.addEventListener('click', (e) => {
                if (e.target.tagName === 'A') {
                    body.classList.remove('mobile-nav-active');
                }
            });
        }

        const mobileSearchBtn = document.querySelector('.mobile-search-btn');

        const createMobileSearchOverlay = () => {
            let overlay = document.querySelector('.mobile-search-overlay');
            if (!overlay) {
                const overlayHTML = `
                    <div class="mobile-search-overlay">
                        <div class="search-wrapper" style="display: block; justify-self: center;">
                            <div class="search-container">
                                <input type="text" class="search-input" placeholder="Search...">
                            </div>
                            <div class="search-results-overlay" style="position: static; margin-top: 15px; width: 100%; opacity: 1; visibility: visible; transform: none; pointer-events: auto; box-shadow: none;">
                                <div class="search-result-item">
                                    <span>Popular Searches</span>
                                    <a href="#">Anime Stickers</a>
                                    <a href="#">Laptop Skins</a>
                                    <a href="#">Matte Decals</a>
                                </div>
                                <div class="search-result-item">
                                    <span>Recent</span>
                                    <a href="#">Holographic Vinyl</a>
                                </div>
                            </div>
                        </div>
                    </div>`;
                document.body.insertAdjacentHTML('beforeend', overlayHTML);
                overlay = document.querySelector('.mobile-search-overlay');
                
                overlay.addEventListener('click', function(e) {
                    if (e.target === this || e.target.classList.contains('mobile-search-overlay')) {
                        this.classList.remove('show');
                    }
                });

                const searchWrapperInOverlay = overlay.querySelector('.search-wrapper');
                if (searchWrapperInOverlay) {
                    searchWrapperInOverlay.addEventListener('click', (e) => {
                        e.stopPropagation();
                    });
                }
            }
            return overlay;
        };

        if (mobileSearchBtn) {
            mobileSearchBtn.addEventListener('click', () => {
                const overlay = createMobileSearchOverlay();
                overlay.classList.add('show');
                overlay.querySelector('.search-input').focus();
            });
        }
    };

    const loadComponent = (componentPath, placeholderId) => {
        const placeholder = document.getElementById(placeholderId);
        if (!placeholder) {
            return Promise.resolve();
        }
        return fetch(componentPath)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Network response was not ok for ${componentPath}`);
                }
                return response.text();
            })
            .then(data => {
                placeholder.outerHTML = data; 
                if (placeholderId === 'navbar-placeholder') {
                    initializeNavbarScripts(); 
                }
            })
            .catch(error => {
                console.error(`Error fetching component: ${componentPath}`, error);
                if (placeholder) placeholder.innerHTML = `<p>Error loading component: ${componentPath}.</p>`;
            });
    };
    
    const getOrCreateConfirmationModal = () => {
        let modal = document.getElementById('confirmation-modal');
        if (!modal) {
            const modalHTML = `
                <div class="modal-container" id="confirmation-modal">
                    <div class="modal-card">
                        <h2 id="modal-title">Confirm Action</h2>
                        <p id="modal-message">Are you sure?</p>
                        <div class="modal-actions">
                            <button class="btn-explore ghost" id="modal-cancel-btn">Cancel</button>
                            <button class="btn-explore" id="modal-confirm-btn">Confirm</button>
                        </div>
                    </div>
                </div>`;
            document.body.insertAdjacentHTML('beforeend', modalHTML);
            modal = document.getElementById('confirmation-modal');
        }
        return modal;
    };

    const showCustomMessageBox = (message, title = 'Message') => {
        const modal = getOrCreateConfirmationModal();
        if (!modal) {
            console.error("Custom modal not found! Falling back to alert.");
            alert(`${title}: ${message}`); 
            return;
        }

        const modalTitle = modal.querySelector('#modal-title');
        const modalMessage = modal.querySelector('#modal-message');
        const confirmBtn = modal.querySelector('#modal-confirm-btn');
        const cancelBtn = modal.querySelector('#modal-cancel-btn');

        modalTitle.textContent = title;
        modalMessage.textContent = message;

        cancelBtn.classList.add('hidden'); 
        confirmBtn.textContent = 'OK'; 

        const newConfirmBtn = confirmBtn.cloneNode(true);
        confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);

        const closeMessageHandler = () => {
            modal.classList.remove('show');
            cancelBtn.classList.remove('hidden'); 
            newConfirmBtn.textContent = 'Confirm'; 
        };

        newConfirmBtn.addEventListener('click', closeMessageHandler, { once: true });
        
        modal.classList.add('show'); 
        
        const keydownHandler = (e) => {
            if (e.key === 'Escape') {
                closeMessageHandler();
                document.removeEventListener('keydown', keydownHandler);
            }
        };
        document.addEventListener('keydown', keydownHandler);

        const outsideClickHandler = (e) => {
             if (e.target === modal) {
                closeMessageHandler();
                modal.removeEventListener('click', outsideClickHandler);
             }
        };
        modal.addEventListener('click', outsideClickHandler);
    };

    const showConfirmationModal = (onConfirm, message = 'Are you sure?', title = 'Confirm Action') => {
        const modal = getOrCreateConfirmationModal();
        if (!modal) {
            if (confirm(message)) {
                onConfirm();
            }
            return;
        }

        const modalTitle = modal.querySelector('#modal-title');
        const modalMessage = modal.querySelector('#modal-message');
        const confirmBtn = modal.querySelector('#modal-confirm-btn');
        const cancelBtn = modal.querySelector('#modal-cancel-btn');

        modalTitle.textContent = title;
        modalMessage.textContent = message;
        cancelBtn.classList.remove('hidden'); 
        confirmBtn.textContent = 'Confirm';

        const newConfirmBtn = confirmBtn.cloneNode(true);
        confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
        const newCancelBtn = cancelBtn.cloneNode(true);
        cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);

        const close = () => {
            modal.classList.remove('show');
        };

        newConfirmBtn.addEventListener('click', () => {
            close();
            onConfirm(); 
        }, { once: true }); 

        newCancelBtn.addEventListener('click', close, { once: true });
        
        const keydownHandler = (e) => {
            if (e.key === 'Escape') {
                close();
                document.removeEventListener('keydown', keydownHandler);
            }
        };
        document.addEventListener('keydown', keydownHandler);

        const outsideClickHandler = (e) => {
             if (e.target === modal) {
                close();
                modal.removeEventListener('click', outsideClickHandler);
             }
        };
        modal.addEventListener('click', outsideClickHandler);

        modal.classList.add('show');
    };

    const openAddressModal = (title = 'Add New Address', address = {}) => {
        const addressModal = document.getElementById('address-modal');
        const addressForm = document.getElementById('address-form');
        if (!addressModal || !addressForm) return;

        document.getElementById('address-modal-title').textContent = title;
        document.getElementById('address-id').value = address.id || '';
        document.getElementById('address-title').value = address.title || '';
        document.getElementById('address-line1').value = address.line1 || '';
        document.getElementById('address-line2').value = address.line2 || '';
        document.getElementById('address-landmark').value = address.landmark || '';
        document.getElementById('address-pincode').value = address.pincode || '';
        
        const stateDropdown = document.getElementById('address-state');
        const districtDropdown = document.getElementById('address-district');

        stateDropdown.value = address.state || ''; 

        if (address.state) {
            populateDistricts(address.state);
            districtDropdown.value = address.district || ''; 
            districtDropdown.disabled = false;
        } else {
            districtDropdown.innerHTML = '<option value="" disabled selected>Select District</option>';
            districtDropdown.disabled = true;
        }
        
        addressModal.classList.add('show'); 
    };
    
    const populateStates = () => {
        const stateDropdown = document.getElementById('address-state');
        if (!stateDropdown) return;
        stateDropdown.innerHTML = '<option value="" disabled selected>Select State</option>'; 
        const states = Object.keys(indianStatesAndDistricts);
        states.forEach(state => {
            const option = document.createElement('option');
            option.value = state;
            option.textContent = state;
            stateDropdown.appendChild(option);
        });
    };

    const populateDistricts = (state) => {
        const districtDropdown = document.getElementById('address-district');
        if (!districtDropdown) return;
        districtDropdown.innerHTML = '<option value="" disabled selected>Select District</option>'; 
        const districts = indianStatesAndDistricts[state] || []; 
        districts.forEach(district => {
            const option = document.createElement('option');
            option.value = district;
            option.textContent = district;
            districtDropdown.appendChild(option);
        });
        districtDropdown.disabled = districts.length === 0; 
    };

    const highlightActiveNav = () => {
        const currentPath = window.location.pathname.split('/').pop(); 
        const navLinks = document.querySelectorAll('.main-nav a, .mobile-nav a');

        navLinks.forEach(link => {
            link.classList.remove('active-link'); 
            const linkPath = link.getAttribute('href').split('/').pop();

            if (currentPath === '' || currentPath === 'index.html') {
                if (linkPath === 'index.html') {
                    link.classList.add('active-link');
                }
            } 
            else if (linkPath === currentPath) {
                link.classList.add('active-link');
            }
            if (currentPath === 'Browse_Page.html' && linkPath === 'Browse_Page.html') {
                link.classList.add('active-link');
            }
            if (currentPath === 'skins.html') {
                 const urlHash = window.location.hash;
                 if (linkPath === 'skins.html' && urlHash === '') { 
                     link.classList.add('active-link');
                 } else if (link.classList.contains('skin-toggle') && urlHash !== '') {
                     link.classList.add('active-link');
                 }
            }
        });
    };
    
    // Updated function to load products dynamically with better filtering
    const loadProducts = (categoryFilter, containerId, limit = 0, excludeId = null) => {
        const productGrid = document.getElementById(containerId);
        if (!productGrid) return;

        productGrid.classList.add('reloading');

        const render = (snapshot) => {
            productGrid.innerHTML = ''; 
            let count = 0; // Keep track of rendered items for the limit

            if (snapshot.empty) {
                productGrid.innerHTML = '<p>No similar products found.</p>';
            } else {
                snapshot.forEach(doc => {
                    // Stop if we've hit the limit
                    if (limit > 0 && count >= limit) {
                        return;
                    }
                    // Skip if this is the product to be excluded
                    if (doc.id === excludeId) {
                        return;
                    }

                    const product = doc.data();
                    const productId = doc.id;
                    const productCardHTML = `
                        <div class="product-card" data-category="${product.category}">
                            <a href="ItemCard.html?id=${productId}" class="product-card-link"
                            data-name="${product.name}"
                            data-image="${product.image}"
                            data-price="${product.price}">
                                <img src="${product.image}" alt="${product.name}" onerror="this.src='https://placehold.co/200x200/2c2c2c/f0f2f5?text=No+Image'">
                                <h3>${product.name}</h3>
                                <p class="lowest-ask">Starting from</p>
                                <div class="price-actions-wrapper">
                                    <p class="price">₹${product.price.toFixed(2)}</p>
                                    <div class="product-card-actions">
                                        <button class="btn-add-to-wishlist" aria-label="Add to Wishlist"><i class="fa-regular fa-heart"></i></button>
                                        <button class="btn-add-to-cart-grid" aria-label="Add to Cart"><i class="fa-solid fa-cart-plus"></i></button>
                                    </div>
                                </div>
                            </a>
                        </div>
                    `;
                    productGrid.insertAdjacentHTML('beforeend', productCardHTML);
                    count++; // Increment the counter
                });

                if (count === 0) {
                    productGrid.innerHTML = '<p>No other products in this category.</p>';
                }
            }
            setTimeout(() => productGrid.classList.remove('reloading'), 10);
        };

        let query = db.collection('products');

        if (categoryFilter === 'featured') {
            query = query.where('isFeatured', '==', true).orderBy('createdAt', 'desc');
        } else if (categoryFilter === 'all-products') {
            query = query.orderBy('createdAt', 'desc');
        } else if (categoryFilter === 'all-skins') {
            query = query.where('category', '>=', 'skin-').where('category', '<=', 'skin-\uf8ff');
        } else {
            query = query.where('category', '==', categoryFilter);
        }
        
        // We fetch more than the limit initially to account for excluding the current item
        if (limit > 0) {
            query = query.limit(limit + 1);
        }

        setTimeout(() => {
            query.get().then(render).catch(error => {
                console.error("Error loading products: ", error);
                productGrid.innerHTML = '<p>Error loading products. Please try again later.</p>';
                productGrid.classList.remove('reloading');
            });
        }, 300);
    };

    const initializeSearch = () => {
        const searchInput = document.querySelector('.search-input');
        const searchResultsContainer = document.getElementById('search-results-container');
        const searchWrapper = document.querySelector('.search-wrapper');

        if (!searchInput || !searchResultsContainer || !searchWrapper) return;

        let allProducts = [];
        
        // Fetch all products once and cache them for searching.
        db.collection('products').get().then(snapshot => {
            snapshot.forEach(doc => {
                allProducts.push({ id: doc.id, ...doc.data() });
            });
        }).catch(error => {
            console.error("Error fetching products for search:", error);
        });

        // Renders the search results in the dropdown.
        const renderSearchResults = (results, title) => {
            if (results.length === 0) {
                searchResultsContainer.innerHTML = `<div class="search-result-item-v2"><span>No products found.</span></div>`;
                searchWrapper.classList.add('search-active');
                return;
            }

            const resultsHtml = results.map(item => {
                const product = item.product || item; // Handle both ranked results and direct products
                const productPrice = product.price ? `₹${product.price.toFixed(2)}` : 'Price not available';
                return `
                    <a href="ItemCard.html?id=${product.id}" class="search-result-item-v2">
                        <img src="${product.image}" alt="${product.name}" onerror="this.src='https://placehold.co/50x50/2c2c2c/f0f2f5?text=Img'">
                        <div class="search-result-details">
                            <h4>${product.name}</h4>
                            <p>${productPrice}</p>
                        </div>
                    </a>
                `;
            }).join('');

            // Conditionally add the title
            const finalHtml = title ? `<div class="search-result-item"><span>${title}</span></div>` + resultsHtml : resultsHtml;

            searchResultsContainer.innerHTML = finalHtml;
            searchWrapper.classList.add('search-active');
        };
        
        // NEW: Fetches and displays featured products on demand
        const showFeaturedResults = () => {
             db.collection('products')
              .where('isFeatured', '==', true)
              .orderBy('createdAt', 'desc')
              .limit(3)
              .get()
              .then(snapshot => {
                  const featuredProducts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                  if (featuredProducts.length > 0) {
                      renderSearchResults(featuredProducts, 'Featured Products');
                  } else {
                      searchResultsContainer.innerHTML = '<div class="search-result-item-v2"><span>No featured products available.</span></div>';
                  }
              }).catch(error => {
                  // NEW: Better error handling for missing index
                  console.error("Error fetching featured products:", error);
                  if (error.code === 'failed-precondition') {
                       searchResultsContainer.innerHTML = `<div class="search-result-item-v2" style="flex-direction: column; align-items: flex-start; gap: 5px; padding: 15px;">
                           <h4 style="color: #f87171;">Database Index Required</h4>
                           <p style="color: var(--text-muted-color); font-size: 13px; line-height: 1.4;">To show featured products, a Firestore index needs to be created. Please check the browser's developer console (F12) for a direct link to create it automatically.</p>
                       </div>`;
                  } else {
                       searchResultsContainer.innerHTML = '<div class="search-result-item-v2"><span>Error loading products.</span></div>';
                  }
              });
        }

        // Listen for input events on the search bar.
        searchInput.addEventListener('input', () => {
            const query = searchInput.value.trim().toLowerCase();

            if (query.length < 2) {
                searchResultsContainer.innerHTML = ''; // Clear results if query is too short
                searchWrapper.classList.remove('search-active');
                return;
            }

            const rankedResults = allProducts.map(product => {
                let score = 0;
                const name = (product.name || '').toLowerCase();
                const description = (product.description || '').toLowerCase();
                const keywords = product.keywords || [];
                
                if (keywords.some(kw => kw.toLowerCase().includes(query))) score += 10;
                if (name.includes(query)) score += 5;
                if (description.includes(query)) score += 2;

                return { product, score };
            })
            .filter(item => item.score > 0)
            .sort((a, b) => b.score - a.score);

            renderSearchResults(rankedResults.slice(0, 10), 'Search Results');
        });

        // Hide results when clicking outside the search wrapper.
        document.addEventListener('click', (event) => {
            if (!searchWrapper.contains(event.target)) {
                searchWrapper.classList.remove('search-active');
            }
        });

        // Show featured results on focus if input is empty.
        searchInput.addEventListener('focus', () => {
            if (searchInput.value.trim() === '') {
                 showFeaturedResults();
            }
        });
    };


    const initializeAppScripts = () => {
        
        // Load products on relevant pages

        if (document.getElementById('featured-products-grid')) {
            loadProducts('featured', 'featured-products-grid', 5);
        }
        if (document.getElementById('new-arrivals-grid')) {
            loadProducts('all-products', 'new-arrivals-grid', 5);
        }
        if (document.getElementById('skins-grid')) {
            loadProducts('all-skins', 'skins-grid');
        }
        if (document.getElementById('stickers-grid')) {
            loadProducts('sticker', 'stickers-grid');
        }
        if (document.getElementById('decals-grid')) {
            loadProducts('decal', 'decals-grid');
        }
        
        initializeSearch();

        const setupGlobalModals = () => {
            const addressModal = document.getElementById('address-modal');
            if (addressModal) {
                populateStates(); 
                const stateDropdown = document.getElementById('address-state');
                
                stateDropdown.addEventListener('change', () => {
                    populateDistricts(stateDropdown.value);
                });
                
                const cancelBtn = document.getElementById('modal-cancel-address-btn');
                const addressForm = document.getElementById('address-form');

                const closeModal = () => {
                    addressModal.classList.remove('show');
                    addressForm.reset();
                    document.getElementById('address-id').value = ''; 
                    document.getElementById('address-district').innerHTML = '<option value="" disabled selected>Select District</option>';
                    document.getElementById('address-district').disabled = true;
                };

                cancelBtn.addEventListener('click', closeModal);
                addressModal.addEventListener('click', (e) => {
                    if (e.target === addressModal) closeModal();
                });

                addressForm.addEventListener('submit', async (e) => {
                    e.preventDefault();
                    const user = auth.currentUser;
                    if (!user) { 
                        showCustomMessageBox("You must be logged in to save an address.", "Login Required");
                        return; 
                    }

                    const addressId = document.getElementById('address-id').value;
                    const newAddress = {
                        title: document.getElementById('address-title').value,
                        line1: document.getElementById('address-line1').value,
                        line2: document.getElementById('address-line2').value,
                        landmark: document.getElementById('address-landmark').value,
                        pincode: document.getElementById('address-pincode').value,
                        country: document.getElementById('address-country').value,
                        state: document.getElementById('address-state').value,
                        district: document.getElementById('address-district').value,
                    };
                    
                    const userAddressesRef = db.collection('users').doc(user.uid).collection('addresses');
                    const snapshot = await userAddressesRef.limit(1).get();
                    if (snapshot.empty && !addressId) {
                        newAddress.isDefault = true;
                    }

                    try {
                        if (addressId) {
                            await userAddressesRef.doc(addressId).update(newAddress);
                            showCustomMessageBox("Address updated successfully!", "Success");
                        } else {
                            await userAddressesRef.add(newAddress);
                            showCustomMessageBox("Address added successfully!", "Success");
                        }
                        closeModal(); 
                    } catch (error) {
                        console.error("Error saving address:", error);
                        showCustomMessageBox("Failed to save address. Please try again.", "Error");
                    }
                });
            }
        };

        const updateNavbarCartTotal = (total) => {
            const cartButtonSpan = document.querySelector('.btn-cart-capsule span');
            if (cartButtonSpan) {
                cartButtonSpan.textContent = `₹${total.toFixed(2)}`;
            }
        };

        // NEW: Logic for the "Proceed to Payment" button on the checkout page
        if (window.location.pathname.includes('Buy_page.html')) {
            const checkoutButton = document.querySelector('.btn-checkout');
            if (checkoutButton) {
                checkoutButton.addEventListener('click', async (e) => {
                    e.preventDefault(); // Prevent navigating immediately
        
                    const user = auth.currentUser;
                    const savedCouponString = localStorage.getItem('appliedCoupon');
        
                    if (user && savedCouponString) {
                        const savedCoupon = JSON.parse(savedCouponString);
                        
                        if (savedCoupon && savedCoupon.id) {
                            const couponRef = db.collection('coupons').doc(savedCoupon.id);
                            // NEW: Reference to the user's specific coupon usage document
                            const userUsedCouponRef = db.collection('users').doc(user.uid).collection('usedCoupons').doc(savedCoupon.code);
        
                            try {
                                // NEW: Use a batched write to update both documents at once
                                const batch = db.batch();
        
                                // 1. Atomically increment the global usage count on the coupon
                                batch.update(couponRef, {
                                    timesUsed: firebase.firestore.FieldValue.increment(1)
                                });
        
                                // 2. Mark the coupon as used for this specific user to prevent reuse
                                batch.set(userUsedCouponRef, {
                                    usedAt: firebase.firestore.FieldValue.serverTimestamp(),
                                    couponId: savedCoupon.id
                                });
        
                                await batch.commit(); // Commit both changes together
        
                                console.log(`Coupon ${savedCoupon.code} usage count updated and recorded for user.`);
                            } catch (error) {
                                console.error("Error updating coupon count:", error);
                                // Decide if you want to block the user or just log the error
                                // For now, we'll let them proceed but log it.
                            }
                        }
                    }
                    
                    // After attempting to update the coupon, proceed to the (mock) payment page
                    // In a real app, this would redirect to a payment gateway.
                    showCustomMessageBox("Redirecting to payment gateway...", "Proceeding");
                    // You can add a window.location.href redirect here in a real scenario
                });
            }
        }

        const updateCartUI = async (cartItems, appliedCoupon = null) => {
            const cartItemsList = document.querySelector('.cart-items-list');
            const emptyCartMessage = document.querySelector('.empty-cart-message');
            const orderSummaryCard = document.querySelector('.order-summary-card');
            // NEW: Get the coupon usage notice element
            const couponNotice = document.querySelector('.coupon-usage-notice');
            let cart = cartItems || []; 
        
            if (!cartItemsList || !emptyCartMessage || !orderSummaryCard) return;
        
            if (cart.length === 0) {
                emptyCartMessage.classList.remove('hidden');
                orderSummaryCard.classList.add('hidden');
                cartItemsList.innerHTML = ''; 
            } else {
                emptyCartMessage.classList.add('hidden');
                orderSummaryCard.classList.remove('hidden');
        
                let subtotal = 0;
                cartItemsList.innerHTML = ''; 
        
                cart.forEach(item => {
                    subtotal += item.price * item.quantity;
                    const itemImageSrc = item.image && item.image !== '' ? item.image : `https://placehold.co/100x100/CCCCCC/FFFFFF?text=No+Image`;
                    const itemHTML = `
                        <div class="cart-item-card" data-id="${item.id}">
                            <img src="${itemImageSrc}" alt="${item.name}" class="cart-item-image">
                            <div class="cart-item-details">
                                <span class="item-category">${item.category}</span>
                                <h3>${item.name}</h3>
                                <p class="item-price">₹${item.price.toFixed(2)}</p>
                            </div>
                            <div class="cart-item-actions">
                                <div class="quantity-selector">
                                    <button class="quantity-btn minus-btn"><i class="fa-solid fa-minus"></i></button>
                                    <input type="number" class="quantity-input" value="${item.quantity}" min="1" data-id="${item.id}">
                                    <button class="quantity-btn plus-btn"><i class="fa-solid fa-plus"></i></button>
                                </div>
                                <button class="remove-item-btn" aria-label="Remove item" data-id="${item.id}"><i class="fa-solid fa-trash-can"></i></button>
                            </div>
                        </div>`;
                    cartItemsList.insertAdjacentHTML('beforeend', itemHTML);
                });
        
                let discount = 0;
                const discountRow = document.getElementById('discount-row');
                const discountAmountEl = document.getElementById('discount-amount');
        
                if (appliedCoupon && subtotal >= (appliedCoupon.minPurchase || 0)) {
                    if (appliedCoupon.type === 'percentage') {
                        discount = subtotal * (appliedCoupon.value / 100);
                    } else {
                        discount = Math.min(subtotal, appliedCoupon.value);
                    }
                    discountRow.classList.remove('hidden');
                    discountAmountEl.textContent = `- ₹${discount.toFixed(2)}`;
                    // NEW: Show the notice when a coupon is active
                    if (couponNotice) couponNotice.style.display = 'block';
                } else {
                    discountRow.classList.add('hidden');
                    // NEW: Hide the notice if no coupon is active
                    if (couponNotice) couponNotice.style.display = 'none';
                    if (appliedCoupon) {
                        localStorage.removeItem('appliedCoupon');
                    }
                }
        
                const finalTotal = subtotal - discount;
        
                const subtotalEl = document.getElementById('cart-subtotal');
                const totalEl = orderSummaryCard.querySelector('.total-price');
                
                if(subtotalEl) subtotalEl.textContent = `₹${subtotal.toFixed(2)}`;
                if (totalEl) totalEl.textContent = `₹${finalTotal.toFixed(2)}`;
            }
        };

        const updateWishlistUI = (wishlistItems) => {
            const wishlistGrid = document.querySelector('.wishlist-grid');
            const emptyWishlistMessage = document.querySelector('.empty-wishlist-message');
            let wishlist = wishlistItems || []; 

            if (!wishlistGrid || !emptyWishlistMessage) return;

            if (wishlist.length === 0) {
                emptyWishlistMessage.classList.remove('hidden');
                wishlistGrid.innerHTML = ''; 
            } else {
                emptyWishlistMessage.classList.add('hidden');
                wishlistGrid.innerHTML = ''; 

                wishlist.forEach(item => {
                    const itemImageSrc = item.image && item.image !== '' ? item.image : `https://placehold.co/200x200/CCCCCC/FFFFFF?text=No+Image`;
                    const itemHTML = `
                        <div class="wishlist-card" data-id="${item.id}">
                            <button class="remove-wishlist-item" aria-label="Remove from Wishlist" data-id="${item.id}"><i class="fa-solid fa-xmark"></i></button>
                            <img src="${itemImageSrc}" alt="${item.name}" class="wishlist-item-image">
                            <div class="wishlist-card-details">
                                <h3>${item.name}</h3>
                                <p class="item-price">₹${item.price.toFixed(2)}</p>
                            </div>
                            <div class="wishlist-card-actions">
                                <button class="btn-add-to-cart" data-id="${item.id}"><i class="fa-solid fa-cart-plus"></i> Add to Cart</button>
                            </div>
                        </div>`;
                    wishlistGrid.insertAdjacentHTML('beforeend', itemHTML);
                });
            }
        };
        
        const updateAccountUI = (user) => {
            const accountButtonSpan = document.querySelector('.btn-account-capsule span');
            const dropdownMenu = document.querySelector('.dropdown-right .dropdown-menu');
            const authContainer = document.querySelector('.auth-container');
            const authCard = document.getElementById('auth-card');
            const capsuleIconContainer = document.getElementById('account-capsule-icon');
        
            if (!dropdownMenu) {
                console.error("Account dropdown menu element not found. The script may have run too early.");
                return;
            }
            console.log("updateAccountUI is running. User is authenticated:", !!user);
        
            if (user) {
                let name;
                if (user.displayName) {
                    name = user.displayName.split(' ')[0]; 
                } else if (user.providerData?.[0]?.providerId === 'github.com' && user.providerData[0].displayName) {
                    name = user.providerData[0].displayName; 
                } else {
                    name = user.email.split('@')[0]; 
                }
        
                const photoURL = user.photoURL;
                const userEmail = user.email || 'No email provided';
                const fullName = user.displayName || name; 
        
                if (accountButtonSpan) {
                    accountButtonSpan.textContent = name;
                }
                if (capsuleIconContainer) {
                    if (photoURL) {
                        capsuleIconContainer.innerHTML = `<img src="${photoURL}" alt="Profile Picture" class="capsule-profile-pic">`;
                    } else {
                        const initial = name.charAt(0).toUpperCase();
                        capsuleIconContainer.innerHTML = `<div class="dropdown-profile-initial" style="width: 26px; height: 26px; font-size: 14px;">${initial}</div>`;
                    }
                }
        
                if (photoURL) {
                    localStorage.setItem('zapUserProfilePic', photoURL);
                } else {
                    localStorage.removeItem('zapUserProfilePic');
                }
                localStorage.setItem('zapUsername', name); 
                localStorage.setItem('zapUserEmail', userEmail);
                localStorage.setItem('zapUserFullName', fullName); 
        
                let profilePicHtml;
                if (photoURL) {
                    profilePicHtml = `<img src="${photoURL}" alt="Profile Picture" class="dropdown-profile-pic">`;
                } else {
                    const initial = fullName ? fullName.charAt(0).toUpperCase() : '?';
                    profilePicHtml = `<div class="dropdown-profile-initial">${initial}</div>`;
                }
        
                dropdownMenu.innerHTML = `
                    <div class="dropdown-header">
                        ${profilePicHtml}
                        <div class="user-details">
                            <div class="user-name">${fullName}</div>
                            <div class="user-email">${userEmail}</div>
                        </div>
                    </div>
                    <hr class="dropdown-divider">
                    <a href="profile.html"><i class="fa-solid fa-user-gear"></i><span>My Profile</span></a>
                    <a href="profile.html#orders"><i class="fa-solid fa-box-archive"></i><span>My Orders</span></a>
                    <a href="cart.html"><i class="fa-solid fa-cart-shopping"></i><span>My Cart</span></a>
                    <a href="wishlist.html"><i class="fa-solid fa-heart"></i><span>Wishlist</span></a>
                    <hr class="dropdown-divider">
                    <a href="help.html"><i class="fa-solid fa-circle-info"></i><span>Help</span></a>
                    <button class="btn-logout-dropdown"><i class="fa-solid fa-arrow-right-from-bracket"></i><span>Sign Out</span></button>
                `;
        
                const logoutBtn = dropdownMenu.querySelector('.btn-logout-dropdown');
                if (logoutBtn) {
                    logoutBtn.addEventListener('click', () => {
                        auth.signOut().then(() => {
                        }).catch(error => {
                            console.error("Error signing out:", error);
                            showCustomMessageBox("Failed to sign out. Please try again.", "Error");
                        });
                    });
                }
        
            } else {
                if (accountButtonSpan) {
                    accountButtonSpan.textContent = 'Account';
                }
                if (capsuleIconContainer) {
                    capsuleIconContainer.innerHTML = `<i class="fa-solid fa-user"></i>`;
                }
                localStorage.removeItem('zapUsername');
                localStorage.removeItem('zapUserEmail');
                localStorage.removeItem('zapUserFullName');
                localStorage.removeItem('zapUserProfilePic');
        
                dropdownMenu.innerHTML = `
                    <div class="dropdown-header">
                        <div class="dropdown-profile-initial"><i class="fa-regular fa-user"></i></div>
                        <div class="user-details">
                            <div class="user-name">Welcome</div>
                            <div class="user-email">Sign in or create an account</div>
                        </div>
                    </div>
                    <hr class="dropdown-divider">
                    <a href="profile.html"><i class="fa-solid fa-user-gear"></i><span>My Profile</span></a>
                    <a href="profile.html#orders"><i class="fa-solid fa-box-archive"></i><span>My Orders</span></a>
                    <a href="cart.html"><i class="fa-solid fa-cart-shopping"></i><span>My Cart</span></a>
                    <a href="wishlist.html"><i class="fa-solid fa-heart"></i><span>Wishlist</span></a>
                    <hr class="dropdown-divider">
                    <div class="dropdown-auth-buttons">
                         <button class="btn-login-dropdown">Login</button>
                         <button class="btn-signup-dropdown">Sign Up</button>
                    </div>
                `;
        
                const loginBtn = dropdownMenu.querySelector('.btn-login-dropdown');
                const signupBtn = dropdownMenu.querySelector('.btn-signup-dropdown');
                if (loginBtn && signupBtn) {
                    loginBtn.addEventListener('click', () => {
                        if (authCard) authCard.classList.remove("right-panel-active");
                        if (authContainer) authContainer.classList.add('show');
                    });
                    signupBtn.addEventListener('click', () => {
                        if (authCard) authCard.classList.add("right-panel-active");
                        if (authContainer) authContainer.classList.add('show');
                    });
                }
            }
        };

        const updateAddressUI = (addresses) => {
            const addressList = document.querySelector('.address-list');
            if (!addressList) return;
        
            const sortedAddresses = addresses.sort((a, b) => {
                if (a.isDefault) return -1;
                if (b.isDefault) return 1;
                return 0;
            });
        
            addressList.innerHTML = ''; 
            if (sortedAddresses.length > 0) {
                sortedAddresses.forEach(address => {
                    const setDefaultBtn = !address.isDefault
                        ? `<button class="icon-btn-sm set-default-btn" title="Set as default" data-id="${address.id}"><i class="fa-solid fa-star"></i></button>`
                        : '';
                    
                    const fullAddress = [
                        address.line1,
                        address.line2,
                        address.landmark,
                        `${address.district}, ${address.state} - ${address.pincode}`
                    ].filter(Boolean).join(', '); 

                    const addressCard = `
                        <div class="address-card" data-id="${address.id}">
                            <div class="address-details">
                                ${address.isDefault ? '<span class="address-type default">Default</span>' : ''}
                                <strong>${address.title}</strong>
                                <p>${fullAddress}</p>
                            </div>
                            <div class="address-actions">
                                ${setDefaultBtn}
                                <button class="icon-btn-sm edit-address-btn" data-id="${address.id}"><i class="fa-solid fa-pencil"></i></button>
                                <button class="icon-btn-sm remove remove-address-btn" data-id="${address.id}"><i class="fa-solid fa-trash"></i></button>
                            </div>
                        </div>
                    `;
                    addressList.insertAdjacentHTML('beforeend', addressCard);
                });
            } else {
                addressList.innerHTML = '<p>No saved addresses. Add one to get started!</p>';
            }
        };

        let initialAuthCheck = true;
        auth.onAuthStateChanged(user => {
            if (initialAuthCheck) {
                initialAuthCheck = false;
            } else {
                location.reload();
                return;
            }
        
            updateAccountUI(user);

            if (unsubscribeCartListener) unsubscribeCartListener();
            if (unsubscribeWishlistListener) unsubscribeWishlistListener();
            if (unsubscribeAddressListener) unsubscribeAddressListener();

            if (user) {
                unsubscribeCartListener = db.collection('users').doc(user.uid).collection('cart')
                    .onSnapshot(snapshot => {
                        let total = 0;
                        let cartItems = [];
                        snapshot.forEach(doc => {
                            const item = doc.data();
                            total += (item.price * item.quantity);
                            cartItems.push({ id: doc.id, ...item });
                        });
                        updateNavbarCartTotal(total); 
                        if (window.location.pathname.includes('cart.html')) {
                            const savedCoupon = JSON.parse(localStorage.getItem('appliedCoupon'));
                            updateCartUI(cartItems, savedCoupon); 
                        }
                        if (window.location.pathname.includes('Buy_page.html')) {
                            populateCheckoutPage(user); 
                        }
                    }, error => {
                        console.error("Error listening to cart changes:", error);
                        showCustomMessageBox("Failed to synchronize cart. Please try again.", "Error");
                    });

                unsubscribeWishlistListener = db.collection('users').doc(user.uid).collection('wishlist')
                    .onSnapshot(snapshot => {
                        let wishlistItems = [];
                        snapshot.forEach(doc => {
                            wishlistItems.push({ id: doc.id, ...doc.data() });
                        });
                        if (window.location.pathname.includes('wishlist.html')) {
                            updateWishlistUI(wishlistItems); 
                        }
                    }, error => {
                        console.error("Error listening to wishlist changes:", error);
                        showCustomMessageBox("Failed to synchronize wishlist. Please try again.", "Error");
                    });
                
                const addressesRef = db.collection('users').doc(user.uid).collection('addresses');
                unsubscribeAddressListener = addressesRef.onSnapshot(snapshot => {
                    const addresses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    if (window.location.pathname.includes('profile.html')) {
                        updateAddressUI(addresses); 
                    }
                    if (window.location.pathname.includes('Buy_page.html')) {
                        populateCheckoutPage(user); 
                    }
                }, error => {
                    console.error("Error listening to address changes:", error);
                });
                
                if (window.location.pathname.includes('profile.html')) {
                    populateProfileData(user);
                }

            } else {
                 updateNavbarCartTotal(0); 
                 if (window.location.pathname.includes('profile.html') || window.location.pathname.includes('Buy_page.html')) {
                    const mainContent = document.querySelector('.profile-layout') || document.querySelector('.checkout-layout');
                    if (mainContent) {
                        mainContent.innerHTML = `<div class="empty-wishlist-message" style="text-align:center;"><i class="fa-solid fa-lock"></i><h2>Access Denied</h2><p>You must be logged in to view this page.</p><a href="index.html"><button class="btn-explore">Go to Homepage</button></a></div>`;
                    }
                 }
                 if (window.location.pathname.includes('cart.html')) {
                    updateCartUI([]);
                 }
                 if (window.location.pathname.includes('wishlist.html')) {
                    updateWishlistUI([]);
                 }
            }
        });
        
        const themeToggler = document.querySelector('.theme-toggler');
        const body = document.body;
        const setTheme = (theme) => {
            body.classList.toggle('light-mode', theme === 'light');
            localStorage.setItem('theme', theme); 
            const themeLogos = document.querySelectorAll('.theme-logo');
            themeLogos.forEach(logo => {
                logo.src = (theme === 'light') ? logo.dataset.lightSrc : logo.dataset.darkSrc;
            });
        };

        if (themeToggler) {
            themeToggler.addEventListener('click', () => {
                const isLight = body.classList.contains('light-mode');
                setTheme(isLight ? 'dark' : 'light'); 
            });
            const savedTheme = localStorage.getItem('theme') || 'dark';
            setTheme(savedTheme);
        }

        const authContainer = document.querySelector('.auth-container');
        if (authContainer) {
            const authCard = document.getElementById('auth-card');
            const signUpBtnCard = document.getElementById('signUp');
            const signInBtnCard = document.getElementById('signIn');
            const signUpForm = document.querySelector('.sign-up-container form');
            const signInForm = document.querySelector('.sign-in-container form');

            const signUpEmailInput = document.getElementById('signup-email');
            const signInEmailInput = document.getElementById('signin-email');
            const signUpPasswordInput = document.getElementById('signup-password');

            const signUpEmailError = document.getElementById('signup-email-error');
            const signInEmailError = document.getElementById('signin-email-error');
            const signUpPasswordError = document.getElementById('signup-password-error');

            const validateEmail = (email) => {
                const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                return re.test(String(email).toLowerCase());
            };

            const handleValidation = (input, errorElement, validationFn, message) => {
                if (validationFn(input.value) || input.value === '') {
                    input.classList.remove('invalid');
                    errorElement.style.display = 'none';
                    return true;
                } else {
                    input.classList.add('invalid');
                    errorElement.textContent = message;
                    errorElement.style.display = 'block';
                    return false;
                }
            };
            
            const validatePassword = (password) => password.length >= 6;

            if (signUpEmailInput && signUpEmailError) {
                signUpEmailInput.addEventListener('keyup', () => handleValidation(signUpEmailInput, signUpEmailError, validateEmail, 'Please enter a valid email address.'));
            }

            if (signInEmailInput && signInEmailError) {
                signInEmailInput.addEventListener('keyup', () => handleValidation(signInEmailInput, signInEmailError, validateEmail, 'Please enter a valid email address.'));
            }
            
            if (signUpPasswordInput && signUpPasswordError) {
                signUpPasswordInput.addEventListener('keyup', () => handleValidation(signUpPasswordInput, signUpPasswordError, validatePassword, 'Password must be at least 6 characters.'));
            }

            if (signUpBtnCard && signInBtnCard && authCard) {
                signUpBtnCard.addEventListener('click', () => authCard.classList.add("right-panel-active"));
                signInBtnCard.addEventListener('click', () => authCard.classList.remove("right-panel-active"));
            }

            authContainer.addEventListener('click', (event) => {
                if (event.target === authContainer) {
                    authContainer.classList.remove('show');
                }
            });

            const socialSignInButtons = document.querySelectorAll('.social-container a[data-provider]');
            socialSignInButtons.forEach(button => {
                button.addEventListener('click', (e) => {
                    e.preventDefault();
                    const providerName = e.currentTarget.dataset.provider;
                    let provider;
                    switch (providerName) {
                        case 'google':
                            provider = googleProvider;
                            break;
                        case 'github':
                            provider = githubProvider;
                            break;
                        default:
                            console.error('Unknown provider:', providerName);
                            return;
                    }
                    auth.signInWithPopup(provider)
                        .then((result) => {
                            if (authContainer) authContainer.classList.remove('show'); 
                        }).catch((error) => {
                            if (error.code === 'auth/account-exists-with-different-credential') {
                                showCustomMessageBox(
                                    'An account with this email already exists using a different sign-in method. Please sign in with the original provider (e.g., Google, GitHub).',
                                    'Account Exists'
                                );
                            } else {
                                showCustomMessageBox(`An unexpected error occurred. Please try again.`, 'Authentication Error');
                            }
                        });
                });
            });

            if (signUpForm) {
                signUpForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    const isEmailValid = handleValidation(signUpEmailInput, signUpEmailError, validateEmail, 'Please enter a valid email address.');
                    const isPasswordValid = handleValidation(signUpPasswordInput, signUpPasswordError, validatePassword, 'Password must be at least 6 characters.');
                    
                    if (!isEmailValid || !isPasswordValid) return; 

                    const name = signUpForm.querySelector('input[type="text"]').value;
                    const email = signUpEmailInput.value;
                    const password = signUpPasswordInput.value;
                    auth.createUserWithEmailAndPassword(email, password)
                        .then((userCredential) => {
                            return userCredential.user.updateProfile({
                                displayName: name
                            }).then(() => {
                                updateAccountUI(userCredential.user); 
                                if (authContainer) authContainer.classList.remove('show'); 
                            });
                        })
                        .catch((error) => {
                             if (error.code === 'auth/email-already-in-use') {
                                showCustomMessageBox('An account with this email already exists. Please sign in or use a different email.', 'Email in Use');
                            } else {
                                showCustomMessageBox('Could not create an account. Please try again.', 'Sign Up Error');
                            }
                        });
                });
            }

            if (signInForm) {
                signInForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    const isEmailValid = handleValidation(signInEmailInput, signInEmailError, validateEmail, 'Please enter a valid email address.');
                    if (!isEmailValid) return; 

                    const email = signInEmailInput.value;
                    const password = signInForm.querySelector('input[type="password"]').value;
                    auth.signInWithEmailAndPassword(email, password)
                        .then((userCredential) => {
                            if (authContainer) authContainer.classList.remove('show'); 
                        })
                        .catch((error) => {
                            switch (error.code) {
                                case 'auth/user-not-found':
                                case 'auth/invalid-credential': 
                                    showCustomMessageBox('No account found with this email and password combination. Please check your credentials or sign up.', 'Login Error');
                                    break;
                                default:
                                    showCustomMessageBox(`An unexpected error occurred. Please try again.`, 'Login Error');
                            }
                        });
                });
            }
        }

        const searchWrapper = document.querySelector('.search-wrapper');
        const searchInput = document.querySelector('.search-input');
        if (searchWrapper && searchInput) {
            searchInput.addEventListener('focus', () => searchWrapper.classList.add('search-active'));
            document.addEventListener('click', (event) => {
                if (!searchWrapper.contains(event.target)) {
                    searchWrapper.classList.remove('search-active');
                }
            });
        }

        const scrollToTopBtn = document.getElementById('scrollToTopBtn');
        if (scrollToTopBtn) {
            window.addEventListener('scroll', () => {
                scrollToTopBtn.classList.toggle('show', window.scrollY > 300);
            });
            scrollToTopBtn.addEventListener('click', (e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }
        
        const notificationBtn = document.querySelector('.btn-notification-capsule');
        if (notificationBtn) {
            const notificationDropdown = notificationBtn.nextElementSibling; 
            notificationBtn.addEventListener('click', (event) => {
                event.stopPropagation(); 
                notificationDropdown.classList.toggle('active');
            });
            document.addEventListener('click', (event) => {
                if (!notificationDropdown.contains(event.target) && !notificationBtn.contains(event.target)) {
                    notificationDropdown.classList.remove('active');
                }
            });
        }

        const switcherContainer = document.querySelector('.product-category-switcher');
        if (switcherContainer) {
            const switcherButtons = switcherContainer.querySelectorAll('.switcher-btn');
            
            const moveHighlight = (activeButton) => {
                if (!activeButton) return;
                switcherContainer.style.setProperty('--highlight-left', `${activeButton.offsetLeft}px`);
                switcherContainer.style.setProperty('--highlight-width', `${activeButton.offsetWidth}px`);
            };

            switcherButtons.forEach(button => {
                button.addEventListener('click', () => {
                    if (button.classList.contains('active')) return; 

                    switcherButtons.forEach(btn => btn.classList.remove('active'));
                    button.classList.add('active');
                    moveHighlight(button); 

                    const category = button.dataset.category;
                    if (category === 'all') {
                        loadProducts('all-skins', 'skins-grid');
                    } else {
                        loadProducts(`skin-${category}`, 'skins-grid');
                    }
                });
            });

            const handleHashChange = () => {
                const urlHash = window.location.hash.substring(1); 
                const targetButton = document.querySelector(`.switcher-btn[data-category="${urlHash}"]`);
                if (targetButton && !targetButton.classList.contains('active')) {
                    targetButton.click(); 
                } else if (urlHash === '' && document.querySelector('.switcher-btn[data-category="all"]')) {
                    document.querySelector('.switcher-btn[data-category="all"]').click();
                }
            };

            window.addEventListener('hashchange', handleHashChange);

            setTimeout(() => {
                if (window.location.hash) {
                    handleHashChange();
                } else {
                    const initialActiveButton = switcherContainer.querySelector('.switcher-btn.active');
                    if (initialActiveButton) {
                        moveHighlight(initialActiveButton);
                    }
                }
            }, 100); 
        }
        
        const initializeProfileTabs = () => {
            const profileNavLinks = document.querySelectorAll('.profile-nav-link');
            if (profileNavLinks.length === 0) return;

            const handleTabSwitch = (hash) => {
                const targetId = hash.substring(1); 
                const targetTab = document.getElementById(targetId);

                if(targetTab) {
                    document.querySelector('.profile-nav-link.active')?.classList.remove('active');
                    document.querySelector('.profile-tab-content.active')?.classList.remove('active');
                    
                    document.querySelector(`.profile-nav-link[href="#${targetId}"]`)?.classList.add('active');
                    targetTab.classList.add('active');
                }
            };

            profileNavLinks.forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault(); 
                    const newHash = link.getAttribute('href');
                    history.pushState(null, null, newHash); 
                    handleTabSwitch(newHash); 
                });
            });
            
            if (window.location.hash) {
                handleTabSwitch(window.location.hash);
            } else {
                handleTabSwitch('#profile'); 
            }

            window.addEventListener('popstate', () => {
                handleTabSwitch(window.location.hash || '#profile');
            });
        };
        
        const populateProfileData = (user) => {
            if (!user) return;
        
            const picWrapper = document.querySelector('.profile-pic-wrapper');
            const profileNameElement = document.querySelector('.profile-user-header h3');
            const profileEmailElement = document.querySelector('.profile-user-header p');
            const formNameInput = document.getElementById('profile-name');
            const formPhoneInput = document.getElementById('profile-phone');
            const formEmailInput = document.getElementById('profile-email');
            let displayName = user.displayName || user.email.split('@')[0]; 
        
            if (picWrapper) {
                const photoURL = user.photoURL;
                if (photoURL) {
                    picWrapper.innerHTML = `<img src="${photoURL}" alt="User Profile Picture" class="profile-page-pic">`;
                } else {
                    const initial = displayName.charAt(0).toUpperCase();
                    picWrapper.innerHTML = `<div class="profile-page-initial">${initial}</div>`;
                }
            }
            if (profileNameElement) profileNameElement.textContent = displayName;
            if (profileEmailElement && user.email) profileEmailElement.textContent = user.email;
            if (formNameInput) formNameInput.value = displayName;
            
             db.collection('users').doc(user.uid).get().then(doc => {
                if (doc.exists && doc.data().phoneNumber) {
                    if(formPhoneInput) formPhoneInput.value = doc.data().phoneNumber;
                }
            }).catch(error => {
                console.error("Error fetching phone number:", error);
            });
            if (formEmailInput && user.email) formEmailInput.value = user.email;
        
            const profileForm = document.querySelector('#profile .profile-form');
            if (profileForm && !profileForm.dataset.listenerAttached) {
                profileForm.dataset.listenerAttached = 'true';
                profileForm.addEventListener('submit', async (e) => {
                    e.preventDefault();
                    const nameInput = document.getElementById('profile-name');
                    const phoneInput = document.getElementById('profile-phone');
                    const newFullName = nameInput.value.trim();
                    const newPhoneNumber = phoneInput.value.trim();
        
                    showConfirmationModal(async () => {
                        const saveButton = profileForm.querySelector('button[type="submit"]');
                        saveButton.disabled = true;
                        saveButton.textContent = 'Saving...';
                        try {
                            const userDocRef = db.collection('users').doc(user.uid);
                            const updates = {};
                            
                            if (newFullName && newFullName !== user.displayName) {
                                await user.updateProfile({ displayName: newFullName });
                                await user.reload(); 
                                const updatedUser = auth.currentUser;
                                updateAccountUI(updatedUser); 
                                populateProfileData(updatedUser); 
                            }
        
                            const userDoc = await userDocRef.get();
                            const currentPhoneNumber = userDoc.exists ? userDoc.data().phoneNumber : '';
                            if (newPhoneNumber && newPhoneNumber !== currentPhoneNumber) {
                                updates.phoneNumber = newPhoneNumber;
                            }
        
                            if (Object.keys(updates).length > 0) {
                                await userDocRef.set(updates, { merge: true }); 
                            }
                            
                            showCustomMessageBox('Profile updated successfully!', 'Success');
                        } catch (error) {
                            console.error('Error during profile update:', error);
                            showCustomMessageBox(`An error occurred: ${error.message}`, 'Error');
                        } finally {
                            saveButton.disabled = false;
                            saveButton.textContent = 'Save Changes';
                        }
                    }, 'Are you sure you want to save these profile changes?', 'Confirm Profile Update');
                });
            }
        };
        
        const setupAddressPageSpecifics = () => {
            const addNewAddressBtn = document.getElementById('add-new-address-btn');
            const addressList = document.querySelector('.address-list');

            if (!addNewAddressBtn || !addressList) {
                return; 
            }

            addNewAddressBtn.addEventListener('click', () => openAddressModal());
            
            addressList.addEventListener('click', async (e) => {
                const user = auth.currentUser;
                if (!user) return; 

                const userAddressesRef = db.collection('users').doc(user.uid).collection('addresses');

                const editBtn = e.target.closest('.edit-address-btn');
                if (editBtn) {
                    const card = editBtn.closest('.address-card');
                    const addressId = card.dataset.id;
                    const doc = await userAddressesRef.doc(addressId).get();
                    if (doc.exists) {
                        openAddressModal('Edit Address', { id: doc.id, ...doc.data() });
                    } else {
                        showCustomMessageBox("Address not found.", "Error");
                    }
                }

                const deleteBtn = e.target.closest('.remove-address-btn');
                if (deleteBtn) {
                    const card = deleteBtn.closest('.address-card');
                    const addressId = card.dataset.id;
                    const addressDoc = await userAddressesRef.doc(addressId).get();
                    const wasDefault = addressDoc.exists && addressDoc.data().isDefault; 

                    showConfirmationModal(async () => {
                        try {
                            await userAddressesRef.doc(addressId).delete();
                            
                            if (wasDefault) {
                                const remainingAddresses = await userAddressesRef.limit(1).get();
                                if (!remainingAddresses.empty) {
                                    const newDefaultId = remainingAddresses.docs[0].id;
                                    await userAddressesRef.doc(newDefaultId).update({ isDefault: true });
                                }
                            }
                            showCustomMessageBox("Address deleted successfully.", "Success");
                        } catch (error) {
                            console.error("Error deleting address:", error);
                            showCustomMessageBox("Failed to delete address. Please try again.", "Error");
                        }
                    }, "Are you sure you want to delete this address?", "Confirm Deletion");
                }
                
                const setDefaultBtn = e.target.closest('.set-default-btn');
                if (setDefaultBtn) {
                    const newDefaultId = setDefaultBtn.closest('.address-card').dataset.id;
                    const batch = db.batch(); 
                    const addressesSnapshot = await userAddressesRef.get();
                    
                    addressesSnapshot.forEach(doc => {
                        batch.update(doc.ref, { isDefault: doc.id === newDefaultId });
                    });
                    
                    try {
                        await batch.commit();
                        showCustomMessageBox("Default address updated.", "Success");
                    } catch (error) {
                        console.error("Error setting default address: ", error);
                        showCustomMessageBox("Failed to update default address. Please try again.", "Error");
                    }
                }
            });
        };

        const populateCheckoutPage = async (user) => {
            if (!user || !window.location.pathname.includes('Buy_page.html')) return;
        
            const namePlaceholder = document.getElementById('shipping-name-placeholder');
            const phoneContent = document.getElementById('shipping-phone-content');
            const orderItemsList = document.querySelector('.order-items-list');
            const totalItemsPlaceholder = document.getElementById('total-items-placeholder');
            const subtotalPlaceholder = document.getElementById('summary-subtotal-placeholder');
            const totalPaymentPlaceholder = document.getElementById('total-payment-placeholder');
            const checkoutButton = document.querySelector('.btn-checkout');
            // NEW: Get the coupon usage notice element for this page
            const couponNotice = document.querySelector('.coupon-usage-notice');
        
            if (namePlaceholder) {
                namePlaceholder.textContent = user.displayName || 'No name provided';
            }
        
            const userDocRef = db.collection('users').doc(user.uid);
            const userDoc = await userDocRef.get();
            if (userDoc.exists && userDoc.data().phoneNumber) {
                if (phoneContent) phoneContent.textContent = userDoc.data().phoneNumber;
            } else {
                if (phoneContent) phoneContent.innerHTML = `<button class="btn-add-info" onclick="window.location.href='profile.html#profile'">Add Phone</button>`;
            }
            
            const addressesRef = userDocRef.collection('addresses');
            const addressSnapshot = await addressesRef.get();
            let addresses = addressSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            addresses.sort((a, b) => (a.isDefault ? -1 : b.isDefault ? 1 : 0));
            
            const addressListContainer = document.getElementById('checkout-address-list');
            const checkoutAddAddressBtn = document.getElementById('checkout-add-address-btn');
            if (addressListContainer) {
                addressListContainer.innerHTML = ''; 
                if (addresses.length > 0) {
                    addresses.forEach(address => {
                        const isDefault = address.isDefault || false;
                        const fullAddress = [address.line1, address.line2, `${address.district}, ${address.state} - ${address.pincode}`].filter(Boolean).join(', ');
                        const addressHTML = `
                            <label class="address-radio-card ${isDefault ? 'selected' : ''}" data-id="${address.id}">
                                <input type="radio" name="shippingAddress" value="${address.id}" ${isDefault ? 'checked' : ''}>
                                <div class="address-radio-content">
                                    <strong>${address.title}</strong>
                                    <p>${fullAddress}</p>
                                    ${isDefault ? '<span class="address-type default">Default</span>' : ''}
                                </div>
                                <button class="icon-btn-sm edit-address-btn" data-id="${address.id}"><i class="fa-solid fa-pencil"></i></button>
                            </label>
                        `;
                        addressListContainer.insertAdjacentHTML('beforeend', addressHTML);
                    });
                    addressListContainer.addEventListener('click', (e) => {
                        const card = e.target.closest('.address-radio-card');
                        if (card) {
                            document.querySelector('.address-radio-card.selected')?.classList.remove('selected');
                            card.classList.add('selected');
                            card.querySelector('input[type="radio"]').checked = true;
                        }
                        const editBtn = e.target.closest('.edit-address-btn');
                        if (editBtn) {
                            e.preventDefault(); 
                            const addressId = editBtn.dataset.id;
                            const addressToEdit = addresses.find(a => a.id === addressId);
                            if (addressToEdit) openAddressModal('Edit Address', addressToEdit);
                        }
                    });
                } else {
                    addressListContainer.innerHTML = '<p>No saved addresses. Please add one to continue.</p>';
                }
            }
        
            if (checkoutAddAddressBtn) {
                checkoutAddAddressBtn.addEventListener('click', () => openAddressModal());
            }
        
            const cartRef = userDocRef.collection('cart');
            const cartSnapshot = await cartRef.get();
            let subtotal = 0;
            let totalItems = 0;
            if (orderItemsList) orderItemsList.innerHTML = ''; 
        
            if (cartSnapshot.empty) {
                if (orderItemsList) orderItemsList.innerHTML = `<div class="empty-checkout-message"><i class="fa-solid fa-cart-arrow-down"></i><h2>Your order is empty</h2><p>Add some items to continue.</p><a href="Browse_Page.html"><button class="btn-explore">Browse Products</button></a></div>`;
                if (checkoutButton) checkoutButton.disabled = true; 
            } else {
                if (checkoutButton) checkoutButton.disabled = false; 
                cartSnapshot.forEach(doc => {
                    const item = doc.data();
                    subtotal += item.price * item.quantity;
                    totalItems += item.quantity;
                    const itemImageSrc = item.image || `https://placehold.co/100x100/CCCCCC/FFFFFF?text=No+Image`;
                    const itemHTML = `
                        <div class="cart-item-card" data-id="${doc.id}">
                            <img src="${itemImageSrc}" alt="${item.name}" class="cart-item-image">
                            <div class="cart-item-details">
                                <span class="item-category">${item.category}</span>
                                <h3>${item.name}</h3>
                                <p class="item-price">₹${item.price.toFixed(2)}</p>
                            </div>
                            <div class="checkout-item-actions">
                                <div class="quantity-selector">
                                    <button class="quantity-btn minus-btn"><i class="fa-solid fa-minus"></i></button>
                                    <input type="number" class="quantity-input" value="${item.quantity}" min="1" data-id="${doc.id}">
                                    <button class="quantity-btn plus-btn"><i class="fa-solid fa-plus"></i></button>
                                </div>
                                <button class="remove-item-btn" aria-label="Remove item" data-id="${doc.id}"><i class="fa-solid fa-trash-can"></i></button>
                            </div>
                        </div>`;
                    if (orderItemsList) orderItemsList.insertAdjacentHTML('beforeend', itemHTML);
                });
            }
        
            if (totalItemsPlaceholder) totalItemsPlaceholder.textContent = totalItems;
            if (subtotalPlaceholder) subtotalPlaceholder.textContent = `₹${subtotal.toFixed(2)}`;
            
            const savedCouponString = localStorage.getItem('appliedCoupon');
            const discountPlaceholder = document.getElementById('discount-placeholder');
            let discount = 0;
            let isCouponValid = false; // Flag to track if coupon is applied successfully
        
            if (savedCouponString) {
                const savedCoupon = JSON.parse(savedCouponString);
                if (subtotal >= (savedCoupon.minPurchase || 0)) {
                    isCouponValid = true; // Coupon is valid for this cart
                    if (savedCoupon.type === 'percentage') {
                        discount = subtotal * (savedCoupon.value / 100);
                    } else {
                        discount = Math.min(subtotal, savedCoupon.value);
                    }
                    if (discountPlaceholder) {
                         discountPlaceholder.parentElement.classList.remove('hidden');
                         discountPlaceholder.textContent = `- ₹${discount.toFixed(2)}`;
                    }
                } else {
                     localStorage.removeItem('appliedCoupon');
                     if(discountPlaceholder) discountPlaceholder.parentElement.classList.add('hidden');
                }
            } else {
                if(discountPlaceholder) discountPlaceholder.parentElement.classList.add('hidden');
            }
        
            // NEW: Show or hide the usage notice based on whether a valid coupon is applied
            if (couponNotice) {
                couponNotice.style.display = isCouponValid ? 'block' : 'none';
            }
        
            const shippingCharges = 0;
            const finalTotal = subtotal - discount + shippingCharges;
            if (totalPaymentPlaceholder) totalPaymentPlaceholder.textContent = `₹${finalTotal.toFixed(2)}`;
        };

        if (document.querySelector('.profile-layout')) {
            initializeProfileTabs(); 
            setupAddressPageSpecifics(); 
            
            const settingsThemeSwitch = document.querySelector('#settings .switch input');
            if (settingsThemeSwitch) {
                settingsThemeSwitch.checked = (localStorage.getItem('theme') || 'dark') === 'dark';
                settingsThemeSwitch.addEventListener('change', () => setTheme(settingsThemeSwitch.checked ? 'dark' : 'light'));
            }
        }
        
        document.body.addEventListener('click', async e => {
            let itemName, itemImage, itemPrice, itemCategory;
            let targetButton = e.target.closest('.btn-add-to-cart-grid') || e.target.closest('#add-to-cart-detail-btn') || e.target.closest('.wishlist-card .btn-add-to-cart');

            if (targetButton) {
                e.preventDefault(); 
                e.stopPropagation(); 

                const user = auth.currentUser;
                if (!user) {
                    showCustomMessageBox('You must be logged in to add items to your cart.', 'Login Required');
                    return;
                }

                const isFromDetailButton = targetButton.id === 'add-to-cart-detail-btn';
                const isFromWishlist = targetButton.closest('.wishlist-card');

                if (isFromDetailButton) {
                    itemName = document.getElementById('item-name').textContent;
                    itemImage = document.getElementById('item-image').src;
                    itemPrice = parseFloat(document.getElementById('item-price').textContent.replace('₹', ''));
                    itemCategory = "Product"; 
                } else if (isFromWishlist) {
                    const card = targetButton.closest('.wishlist-card');
                    itemName = card.querySelector('h3').textContent;
                    itemImage = card.querySelector('.wishlist-item-image').src;
                    itemPrice = parseFloat(card.querySelector('.item-price').textContent.replace('₹', ''));
                    itemCategory = "Product"; 
                } else {
                    const cardLink = targetButton.closest('.product-card-link');
                    itemName = cardLink.dataset.name;
                    itemImage = cardLink.dataset.image;
                    itemPrice = parseFloat(cardLink.dataset.price);
                    itemCategory = cardLink.querySelector('.lowest-ask')?.textContent || 'Product';
                }

                const userCartRef = db.collection('users').doc(user.uid).collection('cart');

                try {
                    const existingItemQuery = await userCartRef.where('name', '==', itemName).limit(1).get();
                    if (!existingItemQuery.empty) {
                        const existingDoc = existingItemQuery.docs[0];
                        await userCartRef.doc(existingDoc.id).update({
                            quantity: firebase.firestore.FieldValue.increment(1)
                        });
                        showCustomMessageBox(`${itemName} quantity updated in cart!`, 'Item in Cart');
                    } else {
                        await userCartRef.add({
                            productId: itemName.replace(/\s/g, '_').toLowerCase(), 
                            name: itemName,
                            category: itemCategory,
                            price: itemPrice,
                            image: itemImage,
                            quantity: 1,
                            addedAt: firebase.firestore.FieldValue.serverTimestamp() 
                        });
                        showCustomMessageBox(`${itemName} has been added to your cart!`, 'Item Added');
                    }
                    
                    if (isFromWishlist) {
                        const wishlistItemId = targetButton.closest('.wishlist-card').dataset.id; 
                        const userWishlistRef = db.collection('users').doc(user.uid).collection('wishlist');
                        await userWishlistRef.doc(wishlistItemId).delete();
                    }
                } catch (error) {
                    console.error("Error adding/updating item in cart:", error);
                    showCustomMessageBox(`Failed to add ${itemName} to cart. Please try again.`, 'Error');
                }
            }
            if (e.target.closest('.btn-add-to-wishlist') || e.target.closest('#add-to-wishlist-detail-btn')) {
                e.preventDefault(); 
                e.stopPropagation();

                const user = auth.currentUser;
                if (!user) {
                    showCustomMessageBox('You must be logged in to add items to your wishlist.', 'Login Required');
                    return;
                }

                const isFromDetailWishlistButton = e.target.closest('#add-to-wishlist-detail-btn');
                let itemName, itemImage, itemPrice, itemCategory;

                if (isFromDetailWishlistButton) {
                    itemName = document.getElementById('item-name').textContent;
                    itemImage = document.getElementById('item-image').src;
                    itemPrice = parseFloat(document.getElementById('item-price').textContent.replace('₹', ''));
                    itemCategory = "Product";
                } else {
                    const card = e.target.closest('.product-card-link');
                    itemName = card.dataset.name;
                    itemImage = card.dataset.image;
                    itemPrice = parseFloat(card.dataset.price);
                    itemCategory = card.querySelector('.lowest-ask')?.textContent || 'Product';
                }

                const userWishlistRef = db.collection('users').doc(user.uid).collection('wishlist');

                try {
                    const existingItemQuery = await userWishlistRef.where('name', '==', itemName).limit(1).get();
                    if (existingItemQuery.empty) {
                        await userWishlistRef.add({
                            productId: itemName.replace(/\s/g, '_').toLowerCase() + '-wish', 
                            name: itemName,
                            category: itemCategory,
                            price: itemPrice,
                            image: itemImage,
                            addedAt: firebase.firestore.FieldValue.serverTimestamp()
                        });
                        showCustomMessageBox(`${itemName} has been added to your wishlist!`, 'Item Added to Wishlist');
                    } else {
                        showCustomMessageBox(`${itemName} is already in your wishlist!`, 'Already in Wishlist');
                    }
                } catch (error) {
                    console.error("Error adding item to wishlist:", error);
                }
            }
        });

        if (window.location.pathname.includes('ItemCard.html')) {
            const urlParams = new URLSearchParams(window.location.search);
            const productId = urlParams.get('id');

            if (productId) {
                db.collection('products').doc(productId).get().then(doc => {
                    if (doc.exists) {
                        const product = doc.data();
                        document.getElementById('item-name').textContent = product.name;
                        document.getElementById('item-image').src = product.image;
                        document.getElementById('item-price').textContent = '₹' + product.price.toFixed(2);
                        document.querySelector('.item-description').textContent = product.description;

                        const addToCartDetailBtn = document.getElementById('add-to-cart-detail-btn');
                        if (addToCartDetailBtn) {
                            addToCartDetailBtn.dataset.name = product.name;
                            addToCartDetailBtn.dataset.image = product.image;
                            addToCartDetailBtn.dataset.price = product.price;
                        }

                        loadProducts(product.category, 'similar-products-grid', 4, productId);
                    } else {
                        console.error("No such product!");
                        // Handle product not found case
                        const mainContent = document.querySelector('.item-page-layout');
                        if(mainContent) {
                            mainContent.innerHTML = `<div class="empty-cart-message" style="grid-column: 1 / -1;"><i class="fa-solid fa-question-circle"></i><h2>Product Not Found</h2><p>The product you are looking for does not exist or has been removed.</p><a href="index.html"><button class="btn-explore">Go to Homepage</button></a></div>`;
                        }
                    }
                }).catch(error => {
                    console.error("Error getting product:", error);
                });
            }
        } 

        if (document.querySelector('.cart-layout')) {
            localStorage.removeItem('appliedCoupon'); // Clear any old coupon when visiting the cart
            let appliedCoupon = null;

            const applyPromoBtn = document.querySelector('.promo-apply-btn');
            const promoInput = document.querySelector('.promo-code-input');
            const promoMessageEl = document.getElementById('promo-message');

            applyPromoBtn.addEventListener('click', async () => {
                const code = promoInput.value.toUpperCase().trim();
                if (!code) return;
            
                promoMessageEl.textContent = '';
                promoMessageEl.className = 'promo-message';
                const user = auth.currentUser;
                if (!user) {
                    showCustomMessageBox("Please log in to apply coupons.", "Login Required");
                    return;
                }
            
                const couponsRef = db.collection('coupons');
                const querySnapshot = await couponsRef.where('code', '==', code).limit(1).get();
            
                if (querySnapshot.empty) {
                    promoMessageEl.textContent = 'Invalid coupon code.';
                    promoMessageEl.classList.add('error');
                    appliedCoupon = null;
                } else {
                    const couponDoc = querySnapshot.docs[0];
                    const coupon = { id: couponDoc.id, ...couponDoc.data() };
                    const now = new Date();
            
                    // NEW: Check if the user has already used this specific coupon
                    const userUsedCouponRef = db.collection('users').doc(user.uid).collection('usedCoupons').doc(coupon.code);
                    const userUsedCouponDoc = await userUsedCouponRef.get();
            
                    if (userUsedCouponDoc.exists) {
                        promoMessageEl.textContent = 'You have already used this coupon code.';
                        promoMessageEl.classList.add('error');
                        appliedCoupon = null;
                    } else if (coupon.usageLimit && coupon.timesUsed >= coupon.usageLimit) {
                        promoMessageEl.textContent = 'This coupon has reached its usage limit.';
                        promoMessageEl.classList.add('error');
                        appliedCoupon = null;
                    } else if (coupon.expiryDate && coupon.expiryDate.toDate() < now) {
                        promoMessageEl.textContent = 'This coupon has expired.';
                        promoMessageEl.classList.add('error');
                        appliedCoupon = null;
                    } else {
                        const cartSnapshot = await db.collection('users').doc(user.uid).collection('cart').get();
                        let subtotal = 0;
                        cartSnapshot.forEach(doc => {
                            subtotal += doc.data().price * doc.data().quantity;
                        });
            
                        if (subtotal < (coupon.minPurchase || 0)) {
                            promoMessageEl.textContent = `You must spend at least ₹${coupon.minPurchase.toFixed(2)} to use this coupon.`;
                            promoMessageEl.classList.add('error');
                            appliedCoupon = null;
                        } else {
                            promoMessageEl.textContent = `Success! "${coupon.code}" applied.`;
                            promoMessageEl.classList.add('success');
                            appliedCoupon = coupon;
                            localStorage.setItem('appliedCoupon', JSON.stringify(appliedCoupon));
                        }
                    }
                }
                
                const cartSnapshot = await db.collection('users').doc(user.uid).collection('cart').get();
                const cartItems = cartSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                updateCartUI(cartItems, appliedCoupon);
            });
            
            const cartItemsList = document.querySelector('.cart-items-list');
            cartItemsList.addEventListener('click', async (e) => {
                const user = auth.currentUser;
                if (!user) return;
                const userCartRef = db.collection('users').doc(user.uid).collection('cart');

                if (e.target.closest('.remove-item-btn')) {
                    const docId = e.target.closest('.remove-item-btn').dataset.id;
                    await userCartRef.doc(docId).delete();
                } else if (e.target.closest('.plus-btn') || e.target.closest('.minus-btn')) {
                    const card = e.target.closest('.cart-item-card');
                    const docId = card.dataset.id;
                    const increment = e.target.closest('.plus-btn') ? 1 : -1;
                    const input = card.querySelector('.quantity-input');
                    if (parseInt(input.value) + increment >= 1) {
                         await userCartRef.doc(docId).update({ quantity: firebase.firestore.FieldValue.increment(increment) });
                    }
                }
            });

            cartItemsList.addEventListener('change', async (e) => {
                if (e.target.classList.contains('quantity-input')) {
                    const user = auth.currentUser;
                    if (!user) return;
                    const docId = e.target.closest('.cart-item-card').dataset.id;
                    let newQuantity = parseInt(e.target.value);
                    if (isNaN(newQuantity) || newQuantity < 1) {
                        newQuantity = 1;
                        e.target.value = 1; 
                    }
                    await db.collection('users').doc(user.uid).collection('cart').doc(docId).update({ quantity: newQuantity });
                }
            });
        }
        
        if (document.querySelector('.checkout-layout')) {
            const orderItemsList = document.querySelector('.order-items-list');

            orderItemsList.addEventListener('click', async (e) => {
                const user = auth.currentUser;
                if (!user) return;
                const userCartRef = db.collection('users').doc(user.uid).collection('cart');

                if (e.target.closest('.remove-item-btn')) {
                    await userCartRef.doc(e.target.closest('.remove-item-btn').dataset.id).delete();
                } else if (e.target.closest('.plus-btn') || e.target.closest('.minus-btn')) {
                    const card = e.target.closest('.cart-item-card');
                    const docId = card.dataset.id;
                    const increment = e.target.closest('.plus-btn') ? 1 : -1;
                    const input = card.querySelector('.quantity-input');
                     if (parseInt(input.value) + increment >= 1) {
                         await userCartRef.doc(docId).update({ quantity: firebase.firestore.FieldValue.increment(increment) });
                    }
                }
            });

            orderItemsList.addEventListener('change', async (e) => {
                if (e.target.classList.contains('quantity-input')) {
                    const user = auth.currentUser;
                    if (!user) return;
                    const docId = e.target.closest('.cart-item-card').dataset.id;
                    let newQuantity = parseInt(e.target.value);
                    if (isNaN(newQuantity) || newQuantity < 1) {
                        newQuantity = 1;
                        e.target.value = 1;
                    }
                    await userCartRef.doc(docId).update({ quantity: newQuantity });
                }
            });
        }

        if (document.querySelector('.wishlist-grid')) {
            const wishlistGrid = document.querySelector('.wishlist-grid');

            wishlistGrid.addEventListener('click', async (e) => {
                const user = auth.currentUser;
                if (!user) return;
                
                if (e.target.closest('.remove-wishlist-item')) {
                    const docId = e.target.closest('.remove-wishlist-item').dataset.id;
                    await db.collection('users').doc(user.uid).collection('wishlist').doc(docId).delete();
                }
            });
        }

        const profileLogoutBtn = document.querySelector('.profile-logout-btn');
        if (profileLogoutBtn) {
            profileLogoutBtn.addEventListener('click', () => {
                showConfirmationModal(() => {
                    auth.signOut().catch(error => {
                        console.error("Error signing out:", error);
                    });
                }, 'Are you sure you want to sign out?', 'Confirm Sign Out');
            });
        }

        if (document.querySelector('.faq-container')) {
            const chatbotContainer = document.querySelector('.chatbot-container');
            const chatbotInput = document.getElementById('chatbot-input');
            const chatbotSendBtn = document.getElementById('chatbot-send-btn');
            const chatbotMessages = document.getElementById('chatbot-messages');
            const helpSearchForm = document.getElementById('help-search-form');
            const helpSearchInput = document.getElementById('help-search-input');
            const categoryCards = document.querySelectorAll('.help-category-card');
            const faqCategories = document.querySelectorAll('.faq-category');

            const knowledgeBase = {
                "track": "You can track your order from the 'My Orders' section in your profile. You will also receive an email with the tracking link once it ships.",
                "status": "You can check your order status (e.g., Processing, Shipped) at any time in the 'My Orders' section of your profile page.",
                "modify": "Unfortunately, orders cannot be modified once placed. You can request a cancellation from your 'My Orders' section within 2 hours of placing the order.",
                "cancel": "You can request a cancellation within 2 hours of placing the order from the 'My Orders' section. After that, cancellation isn't possible as the order goes into production.",
                "how long": "Orders are typically dispatched from our location in Bhubaneswar within 2-3 business days. Delivery then takes another 3-7 business days depending on your location in India.",
                "delivery time": "Orders are typically dispatched from our location in Bhubaneswar within 2-3 business days. Delivery then takes another 3-7 business days depending on your location in India.",
                "apply": "To apply a skin: 1. Clean the device. 2. Align the skin carefully. 3. Use a card to smoothly press it down while peeling the backing. A hairdryer on low heat can help with curved edges.",
                "bubbles": "To avoid bubbles, apply the skin slowly from one end to the other, using a card to smooth it out as you go. If a bubble appears, you can gently lift that section and re-apply it.",
                "remove": "Yes, our skins and decals can be removed easily. Just gently peel from a corner. They are designed to not leave any sticky residue behind.",
                "residue": "Our products are made from high-quality vinyl that is designed to be removed without leaving any sticky residue on your device.",
                "waterproof": "Yes! All our vinyl stickers, skins, and decals are 100% waterproof and scratch-resistant.",
                "material": "We use premium, durable vinyl for all our products to ensure a great look, easy application, and long-lasting protection.",
                "return": "We accept returns for manufacturing defects within 7 days of delivery. As most items are made to order, we do not accept returns for incorrect size selection or change of mind.",
                "refund": "Refunds for eligible returns are processed within 5-7 business days after we receive and inspect the returned item.",
                "payment": "We accept all major credit/debit cards, UPI, and several popular digital wallets.",
                "shipping charges": "We offer free shipping on all pre-paid orders across India! A standard fee may apply for Cash on Delivery orders.",
                "cod": "Cash on Delivery (COD) availability depends on your pincode and will be shown as an option at checkout if available.",
                "custom": "Yes, we love custom orders! You can upload your own design on our 'Custom' page, and we'll turn it into a high-quality sticker, skin, or decal for you.",
                "upload": "Please visit the 'Custom' page from the main menu to upload your design. We recommend using high-resolution PNG or SVG files for the best results.",
                "contact": "You can reach our support team by emailing us at support@zapstickers.com. We're happy to help!",
                "email": "Our support email is support@zapstickers.com. We typically respond within one business day.",
                "about": "ZapStickers is your home for premium, stylish vinyl stickers, skins, and decals. We're based in Bhubaneswar, India, and are passionate about helping you express your style!",
                "default": "I'm sorry, I don't have an answer for that. You can try rephrasing your question or contact our support team by emailing support@zapstickers.com."
            };

            const getBotResponse = (userInput) => {
                userInput = userInput.toLowerCase();
                let responses = [];
                for (const keyword in knowledgeBase) {
                    if (keyword !== 'default' && userInput.includes(keyword)) {
                        responses.push(knowledgeBase[keyword]);
                    }
                }
                return responses.length > 0 ? responses.join('\n\n') : knowledgeBase['default'];
            };

            const sendMessage = () => {
                const userInput = chatbotInput.value.trim();
                if (userInput === '') return;
                const userMessageElem = document.createElement('div');
                userMessageElem.className = 'chat-message user';
                userMessageElem.textContent = userInput;
                chatbotMessages.appendChild(userMessageElem);
                const botResponse = getBotResponse(userInput);
                const botMessageElem = document.createElement('div');
                botMessageElem.className = 'chat-message bot';
                botMessageElem.textContent = botResponse;
                chatbotMessages.appendChild(botMessageElem);
                chatbotInput.value = '';
                chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
            };

            chatbotSendBtn.addEventListener('click', sendMessage);
            chatbotInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') sendMessage(); });
            
            if (helpSearchForm) {
                helpSearchForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    const query = helpSearchInput.value.trim();
                    if (query) {
                        chatbotInput.value = query;
                        sendMessage();
                        helpSearchInput.value = '';
                        chatbotContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                });
            }

            const showCategory = (targetId) => {
                let found = false;
                faqCategories.forEach(cat => {
                    if (cat.id === targetId) {
                        cat.classList.add('active');
                        found = true;
                    } else {
                        cat.classList.remove('active');
                    }
                });
                if (found) document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            };

            categoryCards.forEach(card => {
                card.addEventListener('click', (e) => { e.preventDefault(); showCategory(card.dataset.target); });
            });

            document.querySelectorAll('.faq-question').forEach(question => {
                question.addEventListener('click', () => {
                    const answer = question.nextElementSibling;
                    const wasActive = question.classList.contains('active');
                    question.closest('.faq-category').querySelectorAll('.faq-question').forEach(q => {
                        q.classList.remove('active');
                        q.nextElementSibling.style.maxHeight = null;
                    });
                    if (!wasActive) {
                        question.classList.add('active');
                        answer.style.maxHeight = answer.scrollHeight + "px";
                    }
                });
            });
        }
        
        setupGlobalModals();
    };
    
        Promise.all([
            loadComponent('./Components/navbar.html', 'navbar-placeholder'),
            loadComponent('./Components/auth_modal.html', 'auth-modal-placeholder'),
            loadComponent('./Components/address_modal.html', 'address-modal-placeholder')
        ]).then(() => {
            initializeAppScripts(); 
            highlightActiveNav(); 
        }).catch(error => {
            console.error("Failed to load one or more essential components.", error);
        });

        if (window.location.pathname.includes('skins.html')) {
            window.addEventListener('hashchange', highlightActiveNav);
        }
    });