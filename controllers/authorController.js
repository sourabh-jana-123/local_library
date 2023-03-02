const Author = require("../models/author");
const Book = require("../models/book");

// Display list of all Authors.
exports.author_list = async (req, res, next) => {
  try {
    const list_authors = await  Author.find().sort([["family_name", "ascending"]])

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
exports.author_create_get = (req, res) => {
  res.send("NOT IMPLEMENTED: Author create GET");
};

// Handle Author create on POST.
exports.author_create_post = (req, res) => {
  res.send("NOT IMPLEMENTED: Author create POST");
};

// Display Author delete form on GET.
exports.author_delete_get = (req, res) => {
  res.send("NOT IMPLEMENTED: Author delete GET");
};

// Handle Author delete on POST.
exports.author_delete_post = (req, res) => {
  res.send("NOT IMPLEMENTED: Author delete POST");
};

// Display Author update form on GET.
exports.author_update_get = (req, res) => {
  res.send("NOT IMPLEMENTED: Author update GET");
};

// Handle Author update on POST.
exports.author_update_post = (req, res) => {
  res.send("NOT IMPLEMENTED: Author update POST");
};
