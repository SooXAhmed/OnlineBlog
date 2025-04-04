const express = require("express")
const router = express.Router();
const Posted = require('../models/post')
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');
const mainLayout = "../views/layouts/main";


const jwtSecret = process.env.jwtSecret;

const authMiddleware = (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    try {
        const decoded = jwt.verify(token, jwtSecret);
        req.userId = decoded.userId;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Unauthorized' });
    }
}
/**get the home page */
router.get('/',async (req, res) => {
    try {
        const locals = {
            title: "NodeJs Blog",
            description: "Simple Blog created with NodeJs, Express & MongoDb."
        }

        let perPage = 4;
        let page = req.query.page || 1;

        const data = await Posted.aggregate([{ $sort: { createdAt: -1 } }])
            .skip(perPage * page - perPage)
            .limit(perPage)
            .exec();

        // Count is deprecated - please use countDocuments
        // const count = await Post.count();
        const count = await Posted.countDocuments({});
        const nextPage = parseInt(page) + 1;
        const hasNextPage = nextPage <= Math.ceil(count / perPage);
        res.render('index', {
            locals,
            data,
            mainLayout,
            current: page,
            nextPage: hasNextPage ? nextPage : null,
            currentRoute: '/'
        });

    } catch (error) {
        console.log(error);
    }

});

/**
 * GET /
 * Admin - Register
 */

router.get("/register",async (req, res) => {
    try {
        const locals = {
            title: "register",
            description: "Simple Blog created with NodeJs, Express & MongoDb.",
        };

        res.render("register", { locals,mainLayout });
    } catch (error) {
        console.log(error);
    }
});

/**
 * POST /
 * Admin - Register
 */
router.post("/register",async (req, res) => {
    try {
        const { username, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log("we feteched the password and the user name")

        try {
            const user = await User.create({ username:username, password: hashedPassword });
            console.log(user);
            //res.status(201).json({ message: "User Created", user });
        } catch (error) {
            if (error.code === 11000) {
                // try instead of sending this json file alert message shows in the register page
                res.status(409).json({ message: "User already in use" });
            }
            // also trt with alert message
            res.status(500).json({ message: "Internal server error" });
        }
        res.redirect('/user/dashboard')
        const token = jwt.sign({ userId: user._id }, jwtSecret);
        res.cookie('token', token, { httpOnly: true });
    } catch (error) {
        console.log(error);
        console.log("hi there")
    }
});
/**
 * GET /
 * Admin login page
 */
router.get("/login",async (req, res) => {
    try {
        const locals = {
            title: "Admin",
        };
        res.render('login', { locals})
    } catch (error) {
        console.log(error);
        console.log("3333")
    }
});
/**
 * POSt /
 * Admin  checking login
 */
router.post('/login',async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({ username });

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ userId: user._id }, jwtSecret);
        res.cookie('token', token, { httpOnly: true });
        //res.render('/user/dashboard',{data:user})
        res.redirect('user/dashboard');

    } catch (error) {
        console.log(error);
    }
});


/**
 * GET /
 * getting a page with the content of the blog by clicking on it's name (we do this by id)
*/
router.get('/post/:id', async (req, res) => {
    try {
        let slug = req.params.id;

        const data = await Posted.findById({ _id: slug });
        const locals = {
            title: data.title,
        }
        res.render('post', {
            locals,
            data,
            currentRoute: `/post/${slug}`
        });
    } catch (error) {
        console.log(error);
    }

});

/**
 * POST /
 * Post - searchTerm
*/
router.post('/search',async (req, res) => {
    try {
        const locals = {
            title: "Seach",
            description: "Simple Blog created with NodeJs, Express & MongoDb."
        }

        let searchTerm = req.body.searchTerm;
        const searchNoSpecialChar = searchTerm.replace(/[^a-zA-Z0-9 ]/g, "")

        const data = await Posted.find({
            $or: [
                { title: { $regex: new RegExp(searchNoSpecialChar, 'i') } },
                { body: { $regex: new RegExp(searchNoSpecialChar, 'i') } }
            ]
        });

        res.render("search", {
            data,
            locals,
            currentRoute: '/'
        });
    }
    catch {

    }
});
router.get('/about', (req, res) => {
    res.render("about",{currentRoute: '/about'});
})
module.exports = router
