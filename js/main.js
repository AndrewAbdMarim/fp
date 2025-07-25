        // Existing user data and authentication logic
        let users = [
            {
                id: 1,
                name: "أندرو عبد مريم",
                email: "admin@library.com",
                password: "admin123",
                role: "admin",
                lastLogin: "اليوم"
            },
            {
                id: 2,
                name: "أحمد أبو بكر",
                email: "fatima@email.com",
                password: "user123",
                role: "user",
                lastLogin: "أمس"
            },
            {
                id: 3,
                name: "ندى حربي",
                email: "mohamed@email.com",
                password: "user123",
                role: "user",
                lastLogin: "منذ 3 أيام"
            },
            {
                id: 4,
                name: "حساب تجريبي",
                email: "user@library.com",
                password: "user123",
                role: "user",
                lastLogin: "اليوم"
            }
        ];

        let currentUser = null;

        let books = [];
        let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
        let cart = JSON.parse(localStorage.getItem('cart')) || [];


        async function fetchBooks() {
            const booksGrid = document.getElementById('booksGrid');
            if (booksGrid) {
                booksGrid.innerHTML = `
                    <div class="loading-spinner">
                        <div class="spinner"></div>
                        <p>جاري تحميل الكتب...</p>
                    </div>
                `;
            }
            try {
                const response = await fetch('https://edu-me01.github.io/Json-Data/Digital-Library.json');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                books = data.books.map(book => ({
                    id: Number(book.id),
                    title: book.title,
                    author: book.author,
                    description: book.description,
                    category: book.category,
                    price: 25
                }));
                updateStats();
                if (currentUser) {
                    displayBooks();
                }
            } catch (error) {
                console.error("Failed to fetch books:", error);
                Swal.fire({
                    icon: 'error',
                    title: 'فشل التحميل',
                    text: 'تعذر تحميل الكتب من الخادم. يرجى المحاولة لاحقًا.'
                });
                if (booksGrid) {
                    booksGrid.innerHTML = `
                        <div class="empty-state">
                            <div>⚠️</div>
                            <h3>فشل تحميل الكتب</h3>
                            <p>حدث خطأ أثناء الاتصال بالخادم. يرجى التحقق من اتصالك بالإنترنت.</p>
                        </div>
                    `;
                }
            }
        }


        function login() {
            const email = document.getElementById('loginEmail').value.trim();
            const password = document.getElementById('loginPassword').value.trim();

            if (!email || !password) {
                Swal.fire({
                    icon: 'warning',
                    title: 'حقول فارغة',
                    text: 'يرجى ملء جميع الحقول المطلوبة'
                });
                return;
            }

            const user = users.find(u => u.email === email && u.password === password);

            if (user) {
                currentUser = user;
                user.lastLogin = "الآن";

                document.getElementById('authNav').style.display = 'none';
                document.getElementById('mainNav').style.display = 'flex';

                if (user.role === 'admin') {
                    document.getElementById('accountsBtn').style.display = 'block';
                }

                document.getElementById('userWelcome').textContent = `مرحباً ${user.name}!`;
                document.getElementById('userRole').textContent = user.role === 'admin' ? 'مسؤول النظام' : 'مستخدم';

                showPage('home');
                displayBooks();
                updateStats();
                displayUsersList();

                Swal.fire({
                    icon: 'success',
                    title: 'تم تسجيل الدخول بنجاح',
                    text: `مرحباً ${user.name}! ✅`
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'فشل تسجيل الدخول',
                    text: 'البريد الإلكتروني أو كلمة المرور غير صحيحة ❌'
                });
            }
        }

        function register() {
            const name = document.getElementById('registerName').value.trim();
            const email = document.getElementById('registerEmail').value.trim();
            const password = document.getElementById('registerPassword').value.trim();
            const confirmPassword = document.getElementById('confirmPassword').value.trim();

            if (!name || !email || !password || !confirmPassword) {
                Swal.fire({
                    icon: 'warning',
                    title: 'حقول فارغة',
                    text: 'يرجى ملء جميع الحقول المطلوبة'
                });
                return;
            }

            if (password !== confirmPassword) {
                Swal.fire({
                    icon: 'error',
                    title: 'كلمات المرور غير متطابقة',
                    text: 'يرجى التأكد من تطابق كلمة المرور وتأكيدها'
                });
                return;
            }

            if (users.find(u => u.email === email)) {
                Swal.fire({
                    icon: 'info',
                    title: 'بريد إلكتروني مستخدم',
                    text: 'هذا البريد الإلكتروني مستخدم بالفعل'
                });
                return;
            }

            const newUser = {
                id: users.length + 1,
                name,
                email,
                password,
                role: 'user',
                lastLogin: 'لم يسجل دخول بعد'
            };

            users.push(newUser);

            document.getElementById('registerName').value = '';
            document.getElementById('registerEmail').value = '';
            document.getElementById('registerPassword').value = '';
            document.getElementById('confirmPassword').value = '';

            Swal.fire({
                icon: 'success',
                title: 'تم إنشاء الحساب',
                text: 'يمكنك الآن تسجيل الدخول ✅'
            });
            showPage('login');
        }

        function logout() {
            Swal.fire({
                icon: 'question',
                title: 'هل أنت متأكد؟',
                text: 'هل تريد تسجيل الخروج من حسابك؟',
                showCancelButton: true,
                confirmButtonText: 'نعم، تسجيل الخروج',
                cancelButtonText: 'إلغاء'
            }).then((result) => {
                if (result.isConfirmed) {
                    currentUser = null;

                    document.getElementById('authNav').style.display = 'flex';
                    document.getElementById('mainNav').style.display = 'none';

                    document.getElementById('accountsBtn').style.display = 'none';

                    showPage('landing');

                    document.getElementById('loginEmail').value = '';
                    document.getElementById('loginPassword').value = '';
                    
                    Swal.fire('تم تسجيل الخروج!', 'تم تسجيل خروجك بنجاح.', 'success');
                }
            });
        }

        function fillLogin(email, password) {
            document.getElementById('loginEmail').value = email;
            document.getElementById('loginPassword').value = password;
        }

        function requireAuth() {
            if (!currentUser) {
                Swal.fire({
                    icon: 'info',
                    title: 'تسجيل الدخول مطلوب',
                    text: 'يجب تسجيل الدخول أولاً للوصول إلى هذه الميزة.'
                });
                showPage('login');
                return false;
            }
            return true;
        }

        function requireAdmin() {
            if (!requireAuth()) return false;
            if (currentUser.role !== 'admin') {
                Swal.fire({
                    icon: 'error',
                    title: 'غير مصرح لك',
                    text: 'هذه الميزة متاحة للمسؤولين فقط'
                });
                return false;
            }
            return true;
        }

        function displayUsersList() {
            const usersList = document.getElementById('usersList');
            if (!usersList) return;
            
            usersList.innerHTML = users.map(user => `
                <div class="user-card">
                    <div class="user-info">
                        <h3>${user.name}${user.role === 'admin' ? ' (المسؤول)' : ''}</h3>
                        <p>${user.email}</p>
                        <p>آخر دخول: ${user.lastLogin}</p>
                    </div>
                    <span class="user-role ${user.role === 'admin' ? 'admin-role' : 'user-role-regular'}">
                        ${user.role === 'admin' ? 'مسؤول' : 'مستخدم'}
                    </span>
                </div>
            `).join('');
        }
        
        function displayBooks(booksToShow = books) {
            const booksGrid = document.getElementById('booksGrid');
            if (!booksGrid) return;
            
            if (booksToShow.length === 0) {
                booksGrid.innerHTML = `
                    <div class="empty-state">
                        <div>📚</div>
                        <h3>لا توجد كتب متاحة</h3>
                        <p>قم بإضافة بعض الكتب من صفحة إدارة الحسابات</p>
                    </div>
                `;
                return;
            }

            booksGrid.innerHTML = booksToShow.map(book => `
                <div class="book-card">
                    <h3 class="book-title">${book.title}</h3>
                    <p class="book-author">المؤلف: ${book.author}</p>
                    <p class="book-description">${book.description}</p>
                    <div class="book-actions">
                        <button class="btn btn-favorite ${favorites.includes(book.id) ? 'favorited' : ''}"
                                onclick="toggleFavorite(event, ${book.id})">
                            ${favorites.includes(book.id) ? '❤️ مفضل' : '🤍 إضافة للمفضلة'}
                        </button>
                        <button class="btn btn-add-to-cart" onclick="addToCart(${book.id})">
                            🛒 إضافة للسلة
                        </button>
                    </div>
                </div>
            `).join('');
        }

        function displayFavorites() {
            const favoriteBooksGrid = document.getElementById('favoriteBooksGrid');
            if (!favoriteBooksGrid) return;

            const favoriteBooks = books.filter(book => favorites.includes(book.id));

            if (favoriteBooks.length === 0) {
                favoriteBooksGrid.innerHTML = `
                    <div class="empty-state">
                        <div>💝</div>
                        <h3>لا توجد كتب مفضلة بعد</h3>
                        <p>قم بإضافة بعض الكتب إلى المفضلة من الصفحة الرئيسية</p>
                    </div>
                `;
                return;
            }

            favoriteBooksGrid.innerHTML = favoriteBooks.map(book => `
                <div class="book-card">
                    <h3 class="book-title">${book.title}</h3>
                    <p class="book-author">المؤلف: ${book.author}</p>
                    <p class="book-description">${book.description}</p>
                    <div class="book-actions">
                        <button class="btn btn-favorite favorited" onclick="toggleFavorite(event, ${book.id})">
                            ❤️ إزالة من المفضلة
                        </button>
                        <button class="btn btn-add-to-cart" onclick="addToCart(${book.id})">
                            🛒 إضافة للسلة
                        </button>
                    </div>
                </div>
            `).join('');
        }

        function toggleFavorite(event, bookId) {
            if (!requireAuth()) return;

            const button = event.currentTarget;
            button.classList.remove('animate-pop');
            void button.offsetWidth;
            button.classList.add('animate-pop');

            if (favorites.includes(bookId)) {
                favorites = favorites.filter(id => id !== bookId);
            } else {
                favorites.push(bookId);
            }

            localStorage.setItem('favorites', JSON.stringify(favorites));

            if (favorites.includes(bookId)) {
                button.classList.add('favorited');
                button.innerHTML = '❤️ مفضل';
            } else {
                button.classList.remove('favorited');
                button.innerHTML = '🤍 إضافة للمفضلة';
            }
            displayBooks();
            displayFavorites();
            updateStats();
        }

        function readBook(title) {
            if (!requireAuth()) return;
            Swal.fire({
                icon: 'info',
                title: 'جاري فتح الكتاب',
                text: `جاري فتح كتاب: ${title}\n\nسيتم توجيهك لصفحة القراءة...`,
                showConfirmButton: false,
                timer: 2000
            });
        }

        function addBook() {
            if (!requireAdmin()) return;

            const title = document.getElementById('bookTitle').value.trim();
            const author = document.getElementById('bookAuthor').value.trim();
            const description = document.getElementById('bookDescription').value.trim();
            const category = document.getElementById('bookCategory').value.trim();

            if (!title || !author || !description) {
                Swal.fire({
                    icon: 'warning',
                    title: 'حقول فارغة',
                    text: 'يرجى ملء جميع الحقول المطلوبة'
                });
                return;
            }

            const newBook = {
                id: Date.now(),
                title,
                author,
                description,
                category: category || 'غير محدد',
                price: 25
            };

            books.push(newBook);

            document.getElementById('bookTitle').value = '';
            document.getElementById('bookAuthor').value = '';
            document.getElementById('bookDescription').value = '';
            document.getElementById('bookCategory').value = '';

            displayBooks();
            updateStats();
            Swal.fire({
                icon: 'success',
                title: 'تمت الإضافة',
                text: 'تم إضافة الكتاب بنجاح! ✅'
            });
        }

        function searchBooks(query) {
            if (!query.trim()) {
                displayBooks();
                return;
            }

            const filteredBooks = books.filter(book =>
                book.title.toLowerCase().includes(query.toLowerCase()) ||
                book.author.toLowerCase().includes(query.toLowerCase()) ||
                book.description.toLowerCase().includes(query.toLowerCase())
            );

            displayBooks(filteredBooks);
        }

        function addToCart(bookId) {
            if (!requireAuth()) return;

            const bookToAdd = books.find(book => book.id === bookId);
            if (!bookToAdd) return;

            const existingCartItem = cart.find(item => item.bookId === bookId);
            if (existingCartItem) {
                Swal.fire({
                    icon: 'info',
                    title: 'الكتاب موجود بالفعل',
                    text: 'هذا الكتاب موجود بالفعل في سلة المشتريات!'
                });
            } else {
                cart.push({ bookId: bookToAdd.id, title: bookToAdd.title, price: bookToAdd.price });
                localStorage.setItem('cart', JSON.stringify(cart));
                updateCartBadge();
                Swal.fire({
                    icon: 'success',
                    title: 'تمت الإضافة للسلة',
                    text: `تم إضافة "${bookToAdd.title}" إلى سلة المشتريات.`
                });
            }
        }

        function removeFromCart(bookId) {
            Swal.fire({
                icon: 'warning',
                title: 'هل أنت متأكد؟',
                text: 'هل تريد إزالة هذا الكتاب من سلة المشتريات؟',
                showCancelButton: true,
                confirmButtonText: 'نعم، إزالة',
                cancelButtonText: 'إلغاء'
            }).then((result) => {
                if (result.isConfirmed) {
                    cart = cart.filter(item => item.bookId !== bookId);
                    localStorage.setItem('cart', JSON.stringify(cart));
                    displayCart();
                    updateCartBadge();
                    Swal.fire('تمت الإزالة!', 'تمت إزالة الكتاب من السلة.', 'success');
                }
            });
        }

        function displayCart() {
            const cartGrid = document.getElementById('cartGrid');
            if (!cartGrid) return;
            const cartTotal = document.getElementById('cartTotal');

            if (cart.length === 0) {
                cartGrid.innerHTML = `
                    <div class="empty-state">
                        <div>🛍️</div>
                        <h3>سلة المشتريات فارغة</h3>
                        <p>أضف بعض الكتب إليها من الصفحة الرئيسية</p>
                    </div>
                `;
                cartTotal.style.display = 'none';
                return;
            }

            cartGrid.innerHTML = cart.map(item => `
                <div class="cart-item">
                    <h3>${item.title}</h3>
                    <p style="white-space: nowrap;">${item.price} ريال</p>
                    <button class="btn btn-remove" onclick="removeFromCart(${item.bookId})">
                        🗑️ إزالة
                    </button>
                </div>
            `).join('');

            const total = cart.reduce((sum, item) => sum + item.price, 0);
            document.getElementById('totalPrice').textContent = total;
            cartTotal.style.display = 'block';
        }
        
        function updateCartBadge() {
            const badge = document.getElementById('cartBadge');
            if (!badge) return;
            if (cart.length > 0) {
                badge.textContent = cart.length;
                badge.style.display = 'block';
            } else {
                badge.style.display = 'none';
            }
        }

        function sendContactMessage() {
            const name = document.getElementById('contactName').value.trim();
            const email = document.getElementById('contactEmail').value.trim();
            const message = document.getElementById('contactMessage').value.trim();

            if (!name || !email || !message) {
                Swal.fire({
                    icon: 'warning',
                    title: 'حقول فارغة',
                    text: 'يرجى ملء جميع الحقول لإرسال الرسالة.'
                });
                return;
            }

            Swal.fire({
                icon: 'success',
                title: 'تم الإرسال',
                text: 'تم إرسال رسالتك بنجاح! شكراً لتواصلك معنا.'
            });

            document.getElementById('contactName').value = '';
            document.getElementById('contactEmail').value = '';
            document.getElementById('contactMessage').value = '';
        }

        let currentPageId = 'landing';

        function showPage(pageId) {
            if (['home', 'favorites', 'cart', 'contact', 'accounts'].includes(pageId) && !currentUser) {
                showPage('login');
                return;
            }

            if (pageId === 'accounts' && (!currentUser || currentUser.role !== 'admin')) {
                Swal.fire({
                    icon: 'error',
                    title: 'غير مصرح لك',
                    text: 'هذه الصفحة متاحة للمسؤولين فقط'
                });
                return;
            }

            const activePageElement = document.getElementById(currentPageId);
            const nextPageElement = document.getElementById(pageId);

            if (activePageElement && activePageElement.classList.contains('active')) {
                activePageElement.classList.remove('active');
                activePageElement.addEventListener('transitionend', function handler() {
                    activePageElement.style.display = 'none';
                    activePageElement.removeEventListener('transitionend', handler);

                    nextPageElement.style.display = 'block';
                    void nextPageElement.offsetWidth;
                    nextPageElement.classList.add('active');
                });
            } else {
                document.querySelectorAll('.page').forEach(page => {
                    page.style.display = 'none';
                    page.classList.remove('active');
                });
                nextPageElement.style.display = 'block';
                void nextPageElement.offsetWidth;
                nextPageElement.classList.add('active');
            }
            
            // Toggle navigation bar visibility based on user status
            if (currentUser) {
                document.getElementById('authNav').style.display = 'none';
                document.getElementById('mainNav').style.display = 'flex';
                if (currentUser.role === 'admin') {
                     document.getElementById('accountsBtn').style.display = 'block';
                }
            } else {
                document.getElementById('authNav').style.display = 'flex';
                document.getElementById('mainNav').style.display = 'none';
            }

            document.querySelectorAll('.nav-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            const activeBtn = Array.from(document.querySelectorAll('.nav-btn')).find(btn =>
                btn.getAttribute('onclick') && btn.getAttribute('onclick').includes(`'${pageId}'`)
            );
            if (activeBtn) {
                activeBtn.classList.add('active');
            }

            currentPageId = pageId;

            if (pageId === 'favorites') {
                displayFavorites();
            } else if (pageId === 'accounts') {
                displayUsersList();
            } else if (pageId === 'cart') {
                displayCart();
            } else if (pageId === 'home' && currentUser) {
                displayBooks();
            }
        }

        function updateStats() {
            document.getElementById('totalBooks').textContent = books.length;
            document.getElementById('favoriteCount').textContent = favorites.length;
            document.getElementById('totalUsers').textContent = users.length;
            updateCartBadge();
        }

        window.onload = function() {
            fetchBooks();
            showPage('landing');
            updateStats();

            document.getElementById('loginPassword').addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    login();
                }
            });

            document.getElementById('confirmPassword').addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    register();
                }
            });
        };