const form = document.querySelector("form");
const inputs = form.querySelectorAll("input[name]");
const booksContainer = document.querySelector(".books tbody");
const titleField = form.querySelector('input[name="title"]');
const authorField = form.querySelector('input[name="author"]');
const isbnField = form.querySelector('input[name="isbn"]');
const button = form.querySelector("button");
const validator = (...inputs) => inputs.every((input) => input.trim() !== "");
const randomUUID = () => {
  const uuidTemplate = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx";
  return uuidTemplate.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

// creating book class
class Book {
  constructor(title, author, isbn) {
    this.title = title;
    this.author = author;
    this.isbn = isbn;
    this.id = randomUUID();
    this.data = new Date().toDateString();
  }
}
let editMode = false;
let editModeIndex = null;

class Booklist {
  constructor() {
    this.books = JSON.parse(localStorage.getItem("books")) || [];
    document.addEventListener("click", this.handleDelete.bind(this));
    document.addEventListener("click", this.editBook.bind(this));
  }
  save() {
    localStorage.setItem("books", JSON.stringify(this.books));
  }
  addBook(book) {
    this.books.unshift(book);
    this.save();
  }
  editBook(e) {
    const t = e.target;
    if (t.closest(".edit")) {
      const book = t.closest("tr");
      const bookIndex = this.books.findIndex((obj) => obj.id === book.id);
      const { title, author, isbn } = this.books[bookIndex];

      // Clear input fields before setting values
      inputs.forEach((el) => (el.value = ""));

      // Set values for editing
      titleField.value = title;
      authorField.value = author;
      isbnField.value = isbn;

      inputs[0].focus();
      button.textContent = "save";

      editMode = true;
      // Store the index of the book being edited
      editModeIndex = bookIndex;
    }
  }

  handleDelete(e) {
    const t = e.target;
    if (t.closest(".delete")) {
      const book = t.closest("tr");
      this.books = this.books.filter((el) => el.id !== book.id);

      this.render();
    }
  }
  render() {
    booksContainer.innerHTML = this.books
      .map(
        (obj) =>
          `
          <tr  id="${obj.id}" data-date="${obj.date}">
                <td>${obj.title} </td>
                <td>${obj.author} </td>
                <td>${obj.isbn} </td>
                <td><button class="delete"> delete</button><button class="edit" >edit</button>  </td>
            </tr>
        `
      )
      .join("");
    this.save();
    inputs.forEach((el) => (el.value = ""));
    inputs[0].focus();
  }
}
// initialisation of the booklist
const booklist = new Booklist();
booklist.render();

// event on form
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const title = titleField.value;
  const author = authorField.value;
  const isbn = isbnField.value;

  if (!validator(title, author, isbn)) return;

  if (editMode) {
    // Update the existing book details
    booklist.books[editModeIndex].title = title;
    booklist.books[editModeIndex].author = author;
    booklist.books[editModeIndex].isbn = isbn;

    // Clear edit mode and index
    editMode = false;
    editModeIndex = null;
    button.textContent = "add book";
  } else {
    // Add a new book
    const book = new Book(title, author, isbn);
    booklist.addBook(book);
  }

  booklist.render();
});
