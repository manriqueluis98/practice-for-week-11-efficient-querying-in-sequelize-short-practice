// Instantiate Express and the application - DO NOT MODIFY
const express = require('express');
const app = express();

// Import environment variables in order to connect to database - DO NOT MODIFY
require('dotenv').config();
require('express-async-errors');

// Import the models used in these routes - DO NOT MODIFY
const { Author, Book, Review, Reviewer, sequelize } = require('./db/models');
const { Op } = require("sequelize");


// Express using json - DO NOT MODIFY
app.use(express.json());




// STEP #Ob: Test logging behavior - DO NOT MODIFY
app.get('/test-benchmark-logging', async (req, res) => {   // > 100 ms execution time
    const books = await Book.findAll({
        include: [
            { model: Author }, 
            { model: Review },
            { model: Reviewer }
        ],
        // Uncomment the lines below to see the data structure more clearly
        // limit: 100,
        // offset: 2000
    });
    res.json(books);
});


// STEP #1: Benchmark a Frequently-Used Query
// app.get('/books', async (req, res) => {

//     let books = await Book.findAll({
//         include: Author,
//     });

//     // Filter by price if there is a maxPrice defined in the query params
//     if (req.query.maxPrice) {
//         books = books.filter(book => book.price < parseInt(req.query.maxPrice));
//     };
//     res.json(books);
// });



    // 1a. Analyze:

        // Record Executed Query and Baseline Benchmark Below:
        // 75ms, 73ms, 87ms, 56ms, 64ms

        // - What is happening in the code of the query itself?
        // It is using Javascript to filter the Books by price less than maxPrice


        // - What exactly is happening as SQL executes this query?
        // Selecting all the records of Books and including Author
 



// 1b. Identify Opportunities to Make Query More Efficient

    // - What could make this query more efficient?
    // Make a where with Op.lte to filter the records by price

// 1c. Refactor the Query in GET /books
app.get('/books', async (req, res) => {

    const maxPrice = req.query.maxPrice

    const query = {
        include: Author,
    }

    if(maxPrice !== undefined){
        query.where = {
            price: {
                [Op.lte]: maxPrice
            }
        }
    }

    let books = await Book.findAll(query);

    res.json(books);
});


// 1d. Benchmark the Query after Refactoring

    // Record Executed Query and Baseline Benchmark Below:
    // 23ms, 25ms, 26ms, 24ms, 23ms

    // Is the refactored query more efficient than the original? Why or Why Not?
    // Yes, because of the use of Where in the SQL query not on javascript

// STEP #2: Benchmark and Refactor Another Query
// app.patch('/authors/:authorId/books', async (req, res) => {
    
//     const author = await Author.findByPk(req.params.authorId, {
//         include: { model: Book }
//     });

//     if (!author) {
//         res.status(404);
//         return res.json({
//             message: 'Unable to find an author with the specified authorId'
//         });
//     }

//     for (let book of author.Books) {
//         book.price = req.body.price;
//         await book.save();
//     }

//     const books = await Book.findAll({
//         where: {
//             authorId: author.id
//         }
//     });

//     res.json({
//         message: `Successfully updated all authors.`,
//         books
//     });
// });

app.patch('/authors/:authorId/books', async (req, res) => {
    
    await Book.update({
        price: req.body.price
    },
    {
        where: {
            authorId: req.params.authorId
        }
    })

    const books = await Book.findAll({
        where: {
            authorId: req.params.authorId
        }
    });

    res.json({
        message: `Successfully updated all authors.`,
        books
    });
});



// BONUS Step: Benchmark and Add Index
// Examples:
    // GET /reviews?firstName=Daisy&lastName=Herzog
    // GET /reviews?firstName=Daisy
    // GET /reviews?lastName=Herzog
// app.get('/reviews', async (req, res) => {
//     const { firstName, lastName } = req.query;

//     // Check values in query parameters to define where conditions of the query
//     const whereClause = {};
//     if (firstName) whereClause.firstName = firstName;
//     if (lastName) whereClause.lastName = lastName;

//     const reviews = await Review.findAll({
//         include: {
//             model: Reviewer, 
//             where: whereClause,
//             attributes: ['firstName', 'lastName']
//         },
//     });

//     res.json(reviews);
// });

app.get('/reviews', async (req, res) => {
    const { firstName, lastName } = req.query;

    // Check values in query parameters to define where conditions of the query
    const whereClause = {};
    if (firstName) whereClause.firstName = firstName;
    if (lastName) whereClause.lastName = lastName;

    if(firstName && lastName){
        const reviewer = await Reviewer.findOne({
            where: whereClause,
            include: {
                model: Review
            }
        })

        res.json(reviewer.Reviews)
        return
    }

    const reviews = await Review.findAll({
        include: {
            model: Reviewer, 
            where: whereClause,
            attributes: ['firstName', 'lastName']
        },
    });

    res.json(reviews);
});



// Root route - DO NOT MODIFY
app.get('/', (req, res) => {
    res.json({
        message: "API server is running"
    });
});

// GET /authors/:authorId/books (test route) - DO NOT MODIFY
app.get('/authors/:authorId/books', async (req, res) => {
    const author = await Author.findOne({
        where: {
            id: req.params.authorId
        }
    });

    if (!author) {
        res.status(404);
        return res.json({ message: 'Unable to find an author with the specified authorId' });
    }

    const books = await Book.findAll({
        where: { authorId: author.id }
    });

    res.json(books);
});

// Set port and listen for incoming requests - DO NOT MODIFY
const port = 5000;
app.listen(port, () => console.log('Server is listening on port', port));