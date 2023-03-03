const Author = require("../models/author");
const Book = require("../models/book");
const { body, validationResult } = require("express-validator");


// Display list of all Authors.
exports.author_list = async (req, res, next) => {
  try {
    const list_authors = await Author.find().sort([["family_name", "ascending"]])

    res.render("author_list", {
      title: "Author List",
      author_list: list_authors,
    });

  } catch (error) {
    return next(err);
  }
};

// Display detail page for a specific Author.
exports.author_detail = async (req, res, next) => {
  try {
    const author = await Author.findById(req.params.id)
    const authors_books = await Book.find({ author: req.params.id }, "title summary")

    if (author == null) {
      // No results.
      const err = new Error("Author not found");
      err.status = 404;
      return next(err);
    }
    // Successful, so render.
    res.render("author_detail", {
      title: "Author Detail",
      author: author,
      author_books: authors_books,
    });
  } catch (error) {
    next(error)
  }
};

// Display Author create form on GET.
exports.author_create_get = (req, res, next) => {
  res.render("author_form", { title: "Create Author" });
};

// Handle Author create on POST.
exports.author_create_post = [
  // Validate and sanitize fields.
  body("first_name")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("First name must be specified.")
    .isAlphanumeric()
    .withMessage("First name has non-alphanumeric characters."),
  body("family_name")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("Family name must be specified.")
    .isAlphanumeric()
    .withMessage("Family name has non-alphanumeric characters."),
  body("date_of_birth", "Invalid date of birth")
    .optional({ checkFalsy: true })
    .isISO8601()
    .toDate(),
  body("date_of_death", "Invalid date of death")
    .optional({ checkFalsy: true })
    .isISO8601()
    .toDate(),
  // Process request after validation and sanitization.
  async (req, res, next) => {
    // Extract the validation errors from a request.
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        // There are errors. Render form again with sanitized values/errors messages.
        res.render("author_form", {
          title: "Create Author",
          author: req.body,
          errors: errors.array(),
        });
        return;
      }
      // Data from form is valid.

      // Create an Author object with escaped and trimmed data.
      const author = {
        first_name: req.body.first_name,
        family_name: req.body.family_name,
        date_of_birth: req.body.date_of_birth,
        date_of_death: req.body.date_of_death,
      }
      const authorR = await Author.create(author)
      // Successful - redirect to new author record.
      res.redirect(authorR.url);
    } catch (err) {
      return next(err)
    }
  },
];


// Display Author delete form on GET.
exports.author_delete_get = async (req, res, next) => {
  try {
    const author = await Author.findById(req.params.id)
    const authors_books = await Book.find({ author: req.params.id })
    if (author == null) {
      // No results.
      res.redirect("/catalog/authors");
    }
    // Successful, so render.
    res.render("author_delete", {
      title: "Delete Author",
      author: author,
      author_books: authors_books,
    });

  } catch (err) {
    return next(err)
  }
};


// Handle Author delete on POST.
exports.author_delete_post = async (req, res, next) => {
  try {
    const author = await Author.findById(req.body.authorid)
    const authors_books = await Book.find({ author: req.body.authorid })

    if (authors_books.length > 0) {
      // Author has books. Render in same way as for GET route.
      res.render("author_delete", {
        title: "Delete Author",
        author: author,
        author_books: authors_books,
      });
    }
    // Success
    // Author has no books. Delete object and redirect to the list of authors.
    await Author.findByIdAndRemove(req.body.authorid);
    res.redirect("/catalog/authors");
  } catch (err) {
    return next(err)
  }
};


// Display Author update form on GET.
exports.author_update_get = async (req, res, next) => {
  try {
    const author = await Author.findById(req.params.id)
    res.render("author_form", { title: "Update Author", author: author });
  } catch (error) {
    return next(error)
  }
};

// Handle Author update on POST.
exports.author_update_post = [
  // Validate and sanitize fields.
  body("first_name")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("First name must be specified.")
    .isAlphanumeric()
    .withMessage("First name has non-alphanumeric characters."),
  body("family_name")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("Family name must be specified.")
    .isAlphanumeric()
    .withMessage("Family name has non-alphanumeric characters."),
  body("date_of_birth", "Invalid date of birth")
    .optional({ checkFalsy: true })
    .isISO8601()
    .toDate(),
  body("date_of_death", "Invalid date of death")
    .optional({ checkFalsy: true })
    .isISO8601()
    .toDate(),
  // Process request after validation and sanitization.
  async (req, res, next) => {
    // Extract the validation errors from a request.
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        // There are errors. Render form again with sanitized values/errors messages.
        res.render("author_form", {
          title: "Create Author",
          author: req.body,
          errors: errors.array(),
        });
        return;
      }
      // Data from form is valid.

      // Create an Author object with escaped and trimmed data.
      const author = {
        first_name: req.body.first_name,
        family_name: req.body.family_name,
        date_of_birth: req.body.date_of_birth,
        date_of_death: req.body.date_of_death,
      }
      const authorR = await Author.findByIdAndUpdate(req.params.id, author, {})
      // Successful - redirect to new author record.
      res.redirect(authorR.url);
    } catch (err) {
      return next(err)
    }
  },
];

