const Genre = require("../models/genre");
const Book = require("../models/book");
const { body, validationResult } = require("express-validator");

// Display list of all Genre.
exports.genre_list = async (req, res, next) => {
  try {
    const list_genre = await Genre.find({}).sort({ name: 1 })

    res.render('genre_list', {
      title: "Genre List",
      list_genre: list_genre
    })
  } catch (error) {
    next(error)
  }
};

// Display detail page for a specific Genre.
exports.genre_detail = async (req, res, next) => {
  try {
    const genre = await Genre.findById(req.params.id)
    const genre_books = await Book.find({ genre: req.params.id })

    if (genre == null) {
      // No results.
      const err = new Error("Genre not found");
      err.status = 404;
      return next(err);
    }
    // Successful, so render
    res.render("genre_detail", {
      title: "Genre Detail",
      genre: genre,
      genre_books: genre_books,
    });

  } catch (error) {
    return next(error);
  }
};

// Display Genre create form on GET.
exports.genre_create_get = (req, res, next) => {
  res.render("genre_form", { title: "Create Genre" });
};

// Handle Genre create on POST.
exports.genre_create_post = [
  // Validate and sanitize the name field.
  body("name", "Genre name required").trim().isLength({ min: 1 }).escape(),

  // Process request after validation and sanitization.
  async (req, res, next) => {
    try {
      // Extract the validation errors from a request.
      const errors = validationResult(req);
      // Create a genre object with escaped and trimmed data.
      const genre = { name: req.body.name };

      if (!errors.isEmpty()) {
        // There are errors. Render the form again with sanitized values/error messages.
        res.render("genre_form", {
          title: "Create Genre",
          genre,
          errors: errors.array(),
        });
        return;
      } else {
        // Data from form is valid.
        // Check if Genre with same name already exists.
        const found_genre = await Genre.findOne({ name: req.body.name })
        if (found_genre) {
          // Genre exists, redirect to its detail page.
          return res.redirect(found_genre.url);
        } else {
          const genreR = await Genre.create(genre)
          // Genre saved. Redirect to genre detail page.
          return res.redirect(genreR.url);
        }
      }
    }
    catch (error) {
      return next(err);
    }
  },
];


// Display Genre delete form on GET.
exports.genre_delete_get = async (req, res, next) => {
  try {
    const genre = await Genre.findById(req.params.id)
    console.log(genre)
    const books = await Book.find({ genre: req.params.id })
    console.log(books)
    res.render("genre_delete", {
      title: "Delete Genre",
      genre: genre,
      books: books
    })
  } catch (error) {
    return next(error)
  }
};

// Handle Genre delete on POST.
exports.genre_delete_post = async (req, res, next) => {
  try {
    const books = await Book.find({ genre: req.params.id })

    if (books.length > 0) {
      res.render("genre_delete", {
        title: "Delete Genre",
        genre: genre,
        books: books
      })
    }
    await Genre.findByIdAndRemove(req.params.id);
    res.redirect("/catalog/genres")
  } catch (error) {
    return next(error)
  }
};

// Display Genre update form on GET.
exports.genre_update_get = async (req, res, next) => {
  try {
    const genre = await Genre.findById(req.params.id)
    res.render("genre_form"), {
      title: "Update Genre",
      genre: genre
    }
  } catch (error) {
    return next(error)
  }
};

// Handle Genre update on POST.
exports.genre_update_post = async (req, res, next) => {
  try {
    await Genre.findByIdAndUpdate(req.params.id, { name: req.body.name }, {})

    res.redirect("/catalog/genres")
  } catch (error) {
    next(error)
  }
};
