const express = require('express')
const app = express()

const path = require('path')

const usermodel = require('./models/user')
const Bookmodel = require('./models/book')
const book_request_Model = require('./models/book_request')
const ReportModel = require('./models/report')

const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const book_request = require('./models/book_request')
const cookieParser = require('cookie-parser');
const { log, error } = require('console')
const nodemailer = require('nodemailer')
require('dotenv').config();  

app.use(express.static(path.join(__dirname, 'public')));

app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(cookieParser());


app.set('view engine' , 'ejs')

// Serve the homepage
app.get('/', (req, res) => {
    res.render('index');
});


// protected rout 

const authMiddleware = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).redirect("/");
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'shhhh');  
        req.user = decoded;
        next();
    } catch (err) {
        console.error("JWT Verification Error:", err);
        return res.status(401).send("Invalid or expired token");
    }
};


// role base 

const isAdmin = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return res.status(403).send("You do not have permission");
        }
        next();
    };
};

//books rout
app.get('/books',async (req, res) => {
    let book = await Bookmodel.find()
    res.render('books' , {book});
});

 // delete books 
 app.get('/delete/:id' , async (req,res)=>{
    let  books = await Bookmodel.findOneAndDelete({_id:req.params.id})
      res.redirect('/books')
  })

// Login user
app.post('/login', async (req, res) => {
    try {
        const user = await usermodel.findOne({ username: req.body.username });

        if (!user) {
            return res.send("User not found");
        }

        const result = await bcrypt.compare(req.body.password, user.password);

        if (result ) {
           
            const token = jwt.sign({ id: user._id , role:user.role  }, 'shhhh');
            res.cookie('token', token, { httpOnly: true });
            if(user.role === 'user')
            {res.redirect('/student')}
            else if (user.role === 'librarian')
            {res.redirect('/librarian')}
            
            
        } else {
            res.send("Invalid password");
        }
    } catch (err) {
        res.status(500).send("Something went wrong, please try again later.");
    }
});
// logout 
app.get('/logout' , (req,res)=>{
    res.clearCookie('token')
     res.redirect('/')
})


//creating books
    app.post('/createbooks',  async (req,res)=>{
        let {booktitle,author ,Category,description,image} =req.body
        let createbooks = await Bookmodel.create({
            booktitle,
            author ,
            Category,
            description,
            image
            })
            
            res.redirect('/student')
        })

// studdent page 

        app.get('/student',authMiddleware ,async (req,res)=>{
            let book = await Bookmodel.find()
            res.render('student_home_page' , {book})
})

// Register new student

app.post('/register', (req, res) => {
    const { username, password, name, phone , email , role } = req.body;

    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(password, salt, async (err, hash) => {
            if (err) return res.status(500).send('Error hashing password');

            try {
                const createuser = await usermodel.create({
                    username,
                    password: hash,
                    email,
                    name,
                    phone,
                    role
                });

                const token = jwt.sign({ username }, 'shhhh');
                res.cookie('token', token);

                
                res.redirect('/'); 
            } catch (error) {
                res.status(500).send('Error creating user');
            }
        });
    });
});
app.get('/register' , (req,res)=>{
    res.render('register')
})


// Librarian page
app.get('/librarian', authMiddleware, isAdmin(['librarian']), async (req, res) => {
    try {
        const users = await usermodel.find();
        res.render('librarian_home_page', { users });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching users');
    }
});

 // sutdent request and cart 


 app.post('/book_request', authMiddleware, async (req, res) => {
    try {
        let { booktitle, author ,Category , Date} = req.body;

        if (!req.user || !req.user.id) {
            return res.status(400).json({ error: "User ID missing from token" });
        }

        const userId = req.user.id; 
        
        const bookRequest = await book_request_Model.create({
            booktitle, 
            author, 
            Category,
            user: userId ,
            Date 
        });

        res.redirect("/student/book_request");
    } catch (error) {
        console.error("Error creating book request:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.get('/student/book_request', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;  
    
        const cartItems = await book_request_Model.find({ user: userId });
        
        

        res.render('cart.ejs', { cartItems });
    } catch (error) {
        console.error("Error fetching book requests:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


app.get('/remove/:id', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const bookId = req.params.id;

        const book = await book_request_Model.findOne({ _id: bookId });

        if (!book) {
            return res.status(404).send("Book request not found");
        }

        if (book.user.toString() !== userId) {
            return res.status(403).send("Unauthorized to delete this book request");
        }

        await book_request_Model.findByIdAndDelete(bookId);
        res.redirect('/student/book_request');

    } catch (error) {
        console.error("Error deleting book request:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// handaling usre_request in libraray

app.get('/request', authMiddleware, async (req, res) => {
    try {
        
        const request_book = await book_request_Model.find().populate('user'); 

        res.render('request.ejs', { request_book });
    } catch (error) {
        console.error("Error fetching requests:", error);
        res.status(500).send("Server error");
    }
});

// report for student 

app.post('/report', authMiddleware, async (req, res) => {
    try {
        let { booktitle, book_no, description } = req.body;
        const userId = req.user.id; // Get logged-in user ID

        if (!booktitle || !book_no || !description) {
            return res.status(400).json({ error: "All fields are required" });
        }

        const report = await ReportModel.create({
            booktitle,
            book_no,
            description,
            user: userId, 
        });

        res.redirect('/student'); 
    } catch (error) {
        console.error("Error creating report:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.get('/report', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;  
        const reports = await ReportModel.find({ user: userId });

        res.render('report.ejs', { reports }); 
    } catch (error) {
        console.error("Error fetching reports:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
// report for librarian 
app.get('/Report_librarian', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;  
        const reports = await ReportModel.find();

        res.render('Report_lib.ejs', { reports }); 
    } catch (error) {
        console.error("Error fetching reports:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


//sending mail for accept

app.post('/mail_accept', authMiddleware, async (req, res) => {
    try {
        
        const bookRequest = await book_request_Model.findOne().populate('user');  
        
        if (!bookRequest) {
            return res.status(404).json({ error: "Book request not found" });
        }

        const user = bookRequest.user;  
        const returnDate = new Date();
        returnDate.setDate(returnDate.getDate() + 15);  

        
        const formattedReturnDate = returnDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        const { booktitle, author, Category } = bookRequest; 

        // Email transport configuration
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        // Create the email content
        const mailOptions = {
            from: 'darshildhokiya1@gmail.com', 
            to: user.email,                  
            subject: 'Your book request has been accepted',
            text: `
                Hello ${user.name},\n\n
                Congratulations! Your book request for "${booktitle}" by ${author} has been accepted.\n
                Please make sure to return the book by ${formattedReturnDate}.\n\n
                Book Details:\n
                Title: ${booktitle}\n
                Author: ${author}\n
                Category: ${Category}\n\n
                Thank you for using our service!
            `
        };

        // Send the email
        await transporter.sendMail(mailOptions);
        console.log("Email sent successfully!");

        // Redirect back to the request page
        res.redirect('/request');

    } catch (error) {
        console.error("Error sending email:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// for reject 

app.post('/mail_reject/:id', authMiddleware, async (req, res) => {
    try {
        const bookRequest = await book_request_Model.findById(req.params.id);

        await book_request_Model.findByIdAndDelete(req.params.id);

        res.redirect('/request');
        
    } catch (error) {
        console.error("Error rejecting the request:", error);
        res.status(500).send("Internal Server Error");
    }
});


app.listen(3000)