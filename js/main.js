const STORAGE_KEY = 'BOOK_COLLECTION_KEY';
const bookForm = document.getElementById('bookForm');
const searchTitleInput = document.getElementById('searchBookTitle');
const searchBtn = document.getElementById('searchSubmit');
const completeBookList = document.getElementById('completeBookList');
const incompleteBookList = document.getElementById('incompleteBookList');
const bookFormTitle = document.getElementById('bookFormTitle');
const bookFormAuthor = document.getElementById('bookFormAuthor');
const bookFormYear = document.getElementById('bookFormYear');
const bookFormIsComplete = document.getElementById('bookFormIsComplete');
const bookFormSubmit = document.getElementById('bookFormSubmit');

// Utility
function isStorageAvailable() {
  return typeof Storage !== 'undefined';
}

function createUniqueID() {
  const randomStr = Math.random().toString(36).substring(2, 15);
  const timestamp = Date.now().toString(36);
  return `${randomStr}${timestamp}`;
}

function getStoredBooks() {
  if (isStorageAvailable()) {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  }
  return [];
}

function saveBookList(data) {
  if (isStorageAvailable()) {
    const currentBooks = getStoredBooks();
    currentBooks.unshift(data);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(currentBooks));
  }
}

function refreshBookList(updatedBooks) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedBooks));
}

// CRUD
function removeBook(bookId) {
  const userConfirmed = confirm('Apakah anda yakin ingin menghapus buku ini?');
  if (userConfirmed) {
    const filteredBooks = getStoredBooks().filter((book) => book.id !== bookId);
    refreshBookList(filteredBooks);
    alert('Buku telah dihapus!');
    resetSearchAndDisplay();
  }
}

function toggleCompletionStatus(bookId) {
  const updatedBooks = getStoredBooks().map((book) => {
    if (book.id === bookId) {
      book.isComplete = !book.isComplete;
    }
    return book;
  });
  refreshBookList(updatedBooks);
  resetSearchAndDisplay();
}

function startEditingBook(bookId) {
  const bookToEdit = getStoredBooks().find((book) => book.id === bookId);
  if (bookToEdit) {
    bookFormTitle.value = bookToEdit.title;
    bookFormAuthor.value = bookToEdit.author;
    bookFormYear.value = bookToEdit.year;
    bookFormIsComplete.checked = bookToEdit.isComplete;
    bookFormSubmit.textContent = 'Edit Buku';
    bookFormSubmit.dataset.bookId = bookId;
  }
}

function resetSearchAndDisplay() {
  searchTitleInput.value = '';
  renderBooks();
}

// Render
function renderBooks(books = getStoredBooks()) {
  completeBookList.innerHTML = '';
  incompleteBookList.innerHTML = '';

  books.forEach((book) => {
    const bookCard = document.createElement('div');
    bookCard.classList.add('card', 'shadow');
    bookCard.setAttribute('data-bookid', book.id);
    bookCard.setAttribute('data-testid', 'bookItem');

    const toggleButtonText = book.isComplete
      ? 'Belum Selesai'
      : 'Selesai Dibaca';

    bookCard.innerHTML = `
      <h3 class="title-card" data-testid="bookItemTitle">${book.title}</h3>
      <p class="author-card" data-testid="bookItemAuthor">Penulis: ${book.author}</p>
      <p class="year-card" data-testid="bookItemYear">Tahun: ${book.year}</p>
      <div class="action-card">
        <button class="btn-finish" data-testid="bookItemIsCompleteButton">${toggleButtonText}</button>
        <button class="btn-delete" data-testid="bookItemDeleteButton">Hapus</button>
        <button class="btn-edit" data-testid="bookItemEditButton">Edit</button>
      </div>
    `;

    const deleteBtn = bookCard.querySelector(
      '[data-testid="bookItemDeleteButton"]'
    );
    const toggleBtn = bookCard.querySelector(
      '[data-testid="bookItemIsCompleteButton"]'
    );
    const editBtn = bookCard.querySelector(
      '[data-testid="bookItemEditButton"]'
    );

    deleteBtn.addEventListener('click', () => removeBook(book.id));
    toggleBtn.addEventListener('click', () => toggleCompletionStatus(book.id));
    editBtn.addEventListener('click', () => {
      window.scrollTo({top: 0, behavior: 'smooth'});
      startEditingBook(book.id);
    });

    if (book.isComplete) {
      completeBookList.appendChild(bookCard);
    } else {
      incompleteBookList.appendChild(bookCard);
    }
  });
}

// Event Handler
bookForm.addEventListener('submit', function (event) {
  event.preventDefault();
  const title = bookFormTitle.value;
  const author = bookFormAuthor.value;
  const year = parseInt(bookFormYear.value, 10);
  const isComplete = bookFormIsComplete.checked;
  const bookId = bookFormSubmit.dataset.bookId;

  if (bookId) {
    const updatedBooks = getStoredBooks().map((book) => {
      if (book.id === bookId) {
        return {...book, title, author, year, isComplete};
      }
      return book;
    });
    refreshBookList(updatedBooks);
    bookFormSubmit.textContent = 'Masukkan Buku Ke Rak';
    delete bookFormSubmit.dataset.bookId;
  } else {
    const newBook = {
      id: createUniqueID(),
      title,
      author,
      year,
      isComplete,
    };
    saveBookList(newBook);
  }

  bookForm.reset();
  resetSearchAndDisplay();
});

searchBtn.addEventListener('click', function (event) {
  event.preventDefault();
  const searchTerm = searchTitleInput.value.toLowerCase();
  const filteredBooks = getStoredBooks().filter(
    (book) =>
      book.title.toLowerCase().includes(searchTerm) ||
      book.author.toLowerCase().includes(searchTerm)
  );
  renderBooks(filteredBooks);
});

window.addEventListener('load', function () {
  if (isStorageAvailable()) {
    if (localStorage.getItem(STORAGE_KEY)) {
      renderBooks();
    }
  } else {
    alert('Browser anda tidak mendukung Web Storage!');
  }
});
