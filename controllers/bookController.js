const Book = require("../models/book");
const Author = require("../models/author");
const Genre = require("../models/genre");
const BookInstance = require("../models/bookinstance");

const async = require("async");

exports.index = async (req, res) => {
  try {
    const book_count = await Book.countDocuments({});
    const book_instance_count = await BookInstance.countDocuments({});
    const book_instance_available_count = await BookInstance.countDocuments({ status: "Available" });
    const author_count = await Author.countDocuments({});
    const genre_count = await Genre.countDocuments({});

    const results = { book_count, book_instance_count, book_instance_available_count, author_count, genre_count }

    res.render("index", {
      title: "Local Library Home",
      data: results,
    });
  } catch (err) {
    res.render("index", {
      title: "Local Library Home",
      error: err
    });
  }
};


// Display list of all books.
exports.book_list = async (req, res, next) => {
  try {
    const list_books = await Book.find({}, "title author").sort({ title: 1 }).populate("author")
    res.render("book_list", { title: "Book List", book_list: list_books });
  } catch (error) {
    return next(error)
  }
};

// Display detail page for a specific book.
exports.book_detail = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id).populate("author").populate("genre")
    
    const book_instance = await BookInstance.find({ book: req.params.id })

    if (book == null) {
      // No results.
      const err = new Error("Book not found");
      err.status = 404;
      return next(err);
    }
    // Successful, so render.
    res.render("book_detail", {
      title: book.title,
      book: book,
      book_instances: book_instance,
    });
    
  } catch (error) {
    return next(error)
  }
};

// Display book create form on GET.
exports.book_create_get = (req, res) => {
  res.send("NOT IMPLEMENTED: Book create GET");
};

// Handle book create on POST.
exports.book_create_post = (req, res) => {
  res.send("NOT IMPLEMENTED: Book create POST");
};

// Display book delete form on GET.
exports.book_delete_get = (req, res) => {
  res.send("NOT IMPLEMENTED: Book delete GET");
};

// Handle book delete on POST.
exports.book_delete_post = (req, res) => {
  res.send("NOT IMPLEMENTED: Book delete POST");
};

// Display book update form on GET.
exports.book_update_get = (req, res) => {
  res.send("NOT IMPLEMENTED: Book update GET");
};

// Handle book update on POST.
exports.book_update_post = (req, res) => {
  res.send("NOT IMPLEMENTED: Book update POST");
};
