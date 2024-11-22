const express = require('express');
const { AuthorizeUser } = require('../services/authService');
const { uploadToMemory } = require('../services/fileService');
const { VerifyLastId, VerifyParamsId, VerifyS3, SanitizeSearch, VerifyValidationResult, 
    EscapeNewPost, EscapeNewComment } = require('../services/verifyService');
const controller = require('../controllers/postController');

const router = express.Router();

/**
 * Queries the posts and returns posts matching the specified query.
 * Allows for paging with lastId=<id>
 */
router.get('/search', VerifyLastId, SanitizeSearch, VerifyValidationResult, controller.search);

/**
 * Creates a post, requiring a field to be named 'image' for upload. Escapes user inputs
 */
router.post('/create', AuthorizeUser, uploadToMemory.single('image'), EscapeNewPost, VerifyValidationResult, controller.newPost);

/**
 * This route will give the data for the 25 most recent posts following.
 * query with lastId=<id> to get another page (the last id of the page previous)
*/
router.get('/following', AuthorizeUser, VerifyLastId, VerifyS3, controller.following);

/**
 * This route displays the newest posts.
 * query with lastId=<id> to get another page (send the last id of the page previous)
*/
router.get('/explore', VerifyLastId, VerifyS3, controller.explore);

/**
 * Route used to find all the posts by the signed in person 
 * query with lastId=<id> to get another page (send the last id of the page previous)
*/
router.get('/user', AuthorizeUser, VerifyLastId, VerifyS3, controller.userPosts);

/**
 * Provides the post data with the specified id
 */
router.get('/:id', VerifyParamsId, VerifyS3, controller.getPostInfo);

/**
 * Returns the newest comments on a post specified with :id.
 * Query with lastId=<id> to get the next page(s)  (send the last id of the page previous)
 */
router.get('/:id/comments', VerifyParamsId, VerifyLastId, VerifyS3, controller.getComments);

/**
 * Posts a comment to a givent post specified with :id
 */
router.post('/:id/comments', AuthorizeUser, VerifyParamsId, VerifyS3, uploadToMemory.single('none'), EscapeNewComment, ValidateResult, controller.postComment);

module.exports = router;