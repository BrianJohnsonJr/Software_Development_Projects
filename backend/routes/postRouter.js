const express = require('express');
const { AuthorizeUser, VerifyLastId, VerifyParamsId } = require('../services/authService');
const { uploadToMemory, VerifyS3 } = require('../services/fileService');
const controller = require('../controllers/postController');

const router = express.Router();

/**
 * Queries the posts and returns posts matching the specified query.
 * Allows for paging with lastId=<id>
 */
router.get('/search', controller.search);

/**
 * Creates a post, requiring a field to be named 'image' for upload. Escapes user inputs
 */
router.post('/create', AuthorizeUser, uploadToMemory.single('image'), controller.newPost);

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

router.get('/:id/comments', VerifyParamsId, VerifyLastId, VerifyS3, controller.getComments);

module.exports = router;