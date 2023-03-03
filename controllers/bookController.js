const Book = require("../models/book");
const Author = require("../models/author");
const Genre = require("../models/genre");
const BookInstance = require("../models/bookinstance");
const { body, validationResult } = require("express-validator");

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
exports.book_create_get = async (req, res, next) => {
  // Get all authors and genres, which we can use for adding to our book.
  try {
    const authors = await Author.find();
    const genres = await Genre.find();
    res.render("book_form", {
      title: "Create Book",
      authors: authors,
      genres: genres,
    });
  } catch (err) {
    return next(err);
  }
};


// Handle book create on POST.
exports.book_create_post = [
  // Convert the genre to an array.
  (req, res, next) => {
    if (!Array.isArray(req.body.genre)) {
      req.body.genre =
        typeof req.body.genre === "undefined" ? [] : [req.body.genre];
    }
    next();
  },

  // Validate and sanitize fields.
  body("title", "Title must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("author", "Author must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("summary", "Summary must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("isbn", "ISBN must not be empty").trim().isLength({ min: 1 }).escape(),
  body("genre.*").escape(),

  // Process request after validation and sanitization.
  async (req, res, next) => {
    try {
      // Extract the validation errors from a request.
      const errors = validationResult(req);

      // Create a Book object with escaped and trimmed data.
      const book = {
        title: req.body.title,
        author: req.body.author,
        summary: req.body.summary,
        isbn: req.body.isbn,
        genre: req.body.genre,
      }

      if (!errors.isEmpty()) {
        // There are errors. Render form again with sanitized values/error messages.

        // Get all authors and genres for form.
        const authors = await Author.find();
        const genres = await Genre.find();

        // Mark our selected genres as checked.
        for (const genre of genres) {
          if (book.genre.includes(genre._id)) {
            genre.checked = "true";
          }
        }
        return res.render("book_form", {
          title: "Create Book",
          authors: authors,
          genres: genres,
          book,
          errors: errors.array(),
        });
      }
      // Data from form is valid. Save book.
      const bookR = await Book.create(book)
      // Successful: redirect to new book record.
      res.redirect(bookR.url);

    } catch (error) {
      return next(err);
    }
  },
];


// Display book delete form on GET.
exports.book_delete_get = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id)
    const bookinstances = await BookInstance.find({ book: book._id})

    if(book == null) {
      // No results.
      res.redirect('catalog/books')
    }

    // console.log(bookinstances)

    // Successful, so render
    res.render("book_delete", {
      title: "Delete Book",
      book: book,
      bookinstances: bookinstances
    })
  } catch (error) {
    return next(error)
  }
};

// Handle book delete on POST.
exports.book_delete_post = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id)
    const bookinstances = await BookInstance.find({ book: book._id })

    if(bookinstances.length > 0) {
      // Book has bookinstances. Render in same way as for GET route.
      res.render("book_delete", {
        title: "Delete Book",
        book: book,
        bookinstances: bookinstances
      })
    }
    // Success
    // Book has no bookinstances. Delete object and redirect to the list of books.
    await Book.findByIdAndDelete(req.params.id)
    res.redirect("/catalog/books");
  } catch (error) {
    return next(error)
  }
};

// Display book update form on GET.
exports.book_update_get = async (req, res, next) => {
  // Get book, authors and genres for form.
  try {
    const book = await Book.findById(req.params.id)
      .populate("author")
      .populate("genre")
    const authors = await Author.find();

    const genres = await Genre.find();

    if (book == null) {
      // No results.
      const err = new Error("Book not found");
      err.status = 404;
      return next(err);
    }
    // Success.
    // Mark our selected genres as checked.
    for (const genre of genres) {
      for (const bookGenre of book.genre) {
        if (genre._id.toString() === bookGenre._id.toString()) {
          genre.checked = "true";
        }
      }
    }
    res.render("book_form", {
      title: "Update Book",
      authors: authors,
      genres: genres,
      book: book,
    });
  } catch (err) {
    return next(err)
  }
};


// Handle book update on POST.
exports.book_update_post = [
  // Convert the genre to an array
  (req, res, next) => {
    if (!Array.isArray(req.body.genre)) {
      req.body.genre =
        typeof req.body.genre === "undefined" ? [] : [req.body.genre];
    }
    next();
  },

  // Validate and sanitize fields.
  body("title", "Title must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("author", "Author must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("summary", "Summary must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("isbn", "ISBN must not be empty").trim().isLength({ min: 1 }).escape(),
  body("genre.*").escape(),

  // Process request after validation and sanitization.
  async (req, res, next) => {
    try {
      // Extract the validation errors from a request.
      const errors = validationResult(req);

      // Create a Book object with escaped/trimmed data and old id.
      const book = {
        title: req.body.title,
        author: req.body.author,
        summary: req.body.summary,
        isbn: req.body.isbn,
        genre: typeof req.body.genre === "undefined" ? [] : req.body.genre,
        _id: req.params.id, //This is required, or a new ID will be assigned!
      };

      if (!errors.isEmpty()) {
        // There are errors. Render form again with sanitized values/error messages.

        // Get all authors and genres for form.
        const authors = await Author.find();
        const genres = await Genre.find();

        // Mark our selected genres as checked.
        for (const genre of genres) {
          if (book.genre.includes(genre._id)) {
            genre.checked = "true";
          }
        }
        res.render("book_form", {
          title: "Update Book",
          authors: authors,
          genres: genres,
          book,
          errors: errors.array(),
        });

      };
      // Data from form is valid. Update the record.
      const thebook = await Book.findByIdAndUpdate(req.params.id, book, {})

      // Successful: redirect to book detail page.
      res.redirect(thebook.url);
    } catch (err) {
      return next(err)
    }
  }
];
