try {
    console.log("Initializing Library App...");
    
    // State
    let books = JSON.parse(localStorage.getItem('books')) || [];
    let members = JSON.parse(localStorage.getItem('members')) || [];
    let issuedBooks = JSON.parse(localStorage.getItem('issuedBooks')) || [];

    // Elements check
    const totalBooksEl = document.getElementById('total-books');
    const availableBooksEl = document.getElementById('available-books');
    const borrowedBooksEl = document.getElementById('borrowed-books');
    const totalMembersEl = document.getElementById('total-members');
    const bookForm = document.getElementById('book-form');
    const memberForm = document.getElementById('member-form');
    const issueForm = document.getElementById('issue-form');
    const bookList = document.getElementById('book-list');
    const memberList = document.getElementById('member-list');
    const issueList = document.getElementById('issue-list');
    const selectBook = document.getElementById('select-book');
    const selectMember = document.getElementById('select-member');
    const tabButtons = document.querySelectorAll('.tab-btn');
    const sections = document.querySelectorAll('.section');

    if (!bookForm) console.error("Missing #book-form in DOM!");

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            sections.forEach(sec => sec.classList.remove('active'));
            button.classList.add('active');
            const targetSection = document.getElementById(button.getAttribute('data-target'));
            if (targetSection) targetSection.classList.add('active');
        });
    });

    function saveData() {
        localStorage.setItem('books', JSON.stringify(books));
        localStorage.setItem('members', JSON.stringify(members));
        localStorage.setItem('issuedBooks', JSON.stringify(issuedBooks));
        init();
    }

    window.deleteBook = function(isbn) {
        if (issuedBooks.some(issue => issue.isbn === isbn)) {
            alert('Cannot delete a book that is currently issued!');
            return;
        }
        books = books.filter(book => book.isbn !== isbn);
        saveData();
    };

    window.deleteMember = function(memberId) {
        if (issuedBooks.some(issue => issue.memberId === memberId)) {
            alert('Cannot delete a member with active borrowed books!');
            return;
        }
        members = members.filter(member => member.memberId !== memberId);
        saveData();
    };

    window.returnBook = function(isbn) {
        const book = books.find(b => b.isbn === isbn);
        if (book) book.status = 'Available';
        issuedBooks = issuedBooks.filter(issue => issue.isbn !== isbn);
        saveData();
    };

    if (bookForm) {
        bookForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const title = document.getElementById('title').value.trim();
            const author = document.getElementById('author').value.trim();
            const genre = document.getElementById('genre').value.trim();
            const isbn = document.getElementById('isbn').value.trim();

            if (books.some(book => book.isbn === isbn)) {
                alert('A book with this ISBN already exists!');
                return;
            }
            books.push({ title, author, genre, isbn, status: 'Available' });
            bookForm.reset();
            saveData();
        });
    }

    if (memberForm) {
        memberForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('member-name').value.trim();
            const email = document.getElementById('member-email').value.trim();
            const phone = document.getElementById('member-phone').value.trim();
            const memberId = 'MEM-' + Math.floor(1000 + Math.random() * 9000);
            members.push({ memberId, name, email, phone });
            memberForm.reset();
            saveData();
        });
    }

    if (issueForm) {
        issueForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const isbn = selectBook.value;
            const memberId = selectMember.value;
            if (!isbn || !memberId) {
                alert('Please select both a book and a member.');
                return;
            }
            const book = books.find(b => b.isbn === isbn);
            if (book) book.status = 'Borrowed';
            const member = members.find(m => m.memberId === memberId);
            issuedBooks.push({
                isbn,
                bookTitle: book ? book.title : 'Unknown',
                memberId,
                memberName: member ? member.name : 'Unknown',
                issueDate: new Date().toLocaleDateString()
            });
            issueForm.reset();
            saveData();
        });
    }

    function init() {
        if (totalBooksEl) totalBooksEl.textContent = books.length;
        const availableCount = books.filter(b => b.status === 'Available').length;
        if (availableBooksEl) availableBooksEl.textContent = availableCount;
        if (borrowedBooksEl) borrowedBooksEl.textContent = books.length - availableCount;
        if (totalMembersEl) totalMembersEl.textContent = members.length;

        if (bookList) {
            bookList.innerHTML = '';
            books.forEach(book => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${book.title}</td>
                    <td>${book.author}</td>
                    <td>${book.genre}</td>
                    <td>${book.isbn}</td>
                    <td><span class="status-badge ${book.status.toLowerCase()}">${book.status}</span></td>
                    <td><button class="btn-danger" onclick="deleteBook('${book.isbn}')">Delete</button></td>
                `;
                bookList.appendChild(row);
            });
        }

        if (memberList) {
            memberList.innerHTML = '';
            members.forEach(member => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${member.memberId}</td>
                    <td>${member.name}</td>
                    <td>${member.email}</td>
                    <td>${member.phone}</td>
                    <td><button class="btn-danger" onclick="deleteMember('${member.memberId}')">Delete</button></td>
                `;
                memberList.appendChild(row);
            });
        }

        if (selectBook) {
            selectBook.innerHTML = '<option value="">-- Choose Book --</option>';
            books.filter(b => b.status === 'Available').forEach(book => {
                const option = document.createElement('option');
                option.value = book.isbn;
                option.textContent = `${book.title} (ISBN: ${book.isbn})`;
                selectBook.appendChild(option);
            });
        }

        if (selectMember) {
            selectMember.innerHTML = '<option value="">-- Choose Member --</option>';
            members.forEach(member => {
                const option = document.createElement('option');
                option.value = member.memberId;
                option.textContent = `${member.name} (${member.memberId})`;
                selectMember.appendChild(option);
            });
        }

        if (issueList) {
            issueList.innerHTML = '';
            issuedBooks.forEach(issue => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${issue.bookTitle}</td>
                    <td>${issue.isbn}</td>
                    <td>${issue.memberName}</td>
                    <td>${issue.issueDate}</td>
                    <td><button class="btn-return" onclick="returnBook('${issue.isbn}')">Return Book</button></td>
                `;
                issueList.appendChild(row);
            });
        }
    }

    init();
} catch (err) {
    console.error("Critical JS Error:", err);
}