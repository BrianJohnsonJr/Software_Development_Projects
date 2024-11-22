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

        console.log("id type: " + typeof id + "\n id: " + id);

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
exports.ValidateResult = (req, res, next) => {
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