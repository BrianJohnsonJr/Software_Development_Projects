const { query, body, validationResult } = require('express-validator');

function validateId(id) {
    if(!id.match(/^[0-9a-fA-F]{24}$/)) {
        let err = new Error('Invalid id: ' + id);
        err.status = 400;
        return err;
    } else {
        return null;
    }
};

/**
 * Middleware function to verify passed lastId is correctly formatted
 */
exports.VerifyLastId = (req, res, next) => {

    try {
        // Grab the ?lastId=, if doesn't exist, null.
        let id = req.query.lastId || null;
        if(!id) return next(); // If no id, no error needed.

        const err = validateId(id);
        if(err) {
            return next(err);
        } else {
            return next();
        }
    }
    catch (err) { next(err); }
};

/**
 * Middleware function to verify parameter id is correctly formatted
 */
exports.VerifyParamsId = (req, res, next) => {
    try {
        // Grab the /:id
        let id = req.params.id;

        const err = validateId(id);
        if(err) {
            return next(err);
        } else {
            return next();
        }
    }
    catch (err) { next(err); }
};


/**
 * Middleware to verify that req.s3 variable is properly set and exists
 */
exports.VerifyS3 = async (req, res, next) => {
    if(!req.s3) {
        let err = new Error('No s3 connection');
        err.status = 503; // Service unavailable
        return next(err);
    }
    else {
        return next();
    }
};

/**
 * Middleware to check the results of the validators ran in the previous middleware.
 * Creates an error if there were  failures on the validators
 */
exports.VerifyValidationResult = (req, res, next) => {
    let errors = validationResult(req);
    if(!errors.isEmpty()) {
        let err = new Error(errors.array().join('\n'));
        err.status = 400;
        return next(err);
    } else {
        return next();
    }
}

/**
 * Sanitizes the search query from the user's input
 */
exports.SanitizeSearch = [
    query('query').trim().isString().isLength({max: 100}).escape().toLowerCase()
];

exports.EscapeRegister = [
    body('name').trim().escape().isLength({min: 2, max: 50}),
    body('username').trim().escape().isAlphanumeric().isLength({min: 3, max: 30}),
    body('email').isEmail().normalizeEmail(),
    // Enable the first one if we want a proper password validation
    // body('password').isStrongPassword({minLength: 5, minUppercase: 1, minNumbers: 1, minSymbols: 1}),
    body('password').isLength({min: 8, max: 64}).isStrongPassword({minLength: 8}),
    body('bio').optional().trim().escape().isLength({max: 250}),

];

exports.EscapeLogin = [
    body('username').trim().escape(),
    body('password').notEmpty()
];

exports.EscapeNewPost = [
    body('title').escape().trim().isLength({min: 2}),
    body('description').optional().escape().trim(),
    body('price').escape().trim().isNumeric(),
    body('itemType').notEmpty().trim().escape(),
    body('tags').optional().isArray().customSanitizer(tags => {
        return tags.map(tag => tag.trim().replace(/[^\w\s-]/g, '').escape()); // this regex removes all but letters, numbers, spaces, and hyphens
    }),
    body('sizes').optional().isArray().customSanitizer(sizes => {
        return sizes.map(size => size.trim().replace(/[^\w\s-]/g, '').escape());
    })
];

exports.EscapeNewComment = [
    body('text').notEmpty().escape().trim(),
];