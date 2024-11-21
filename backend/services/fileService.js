const multer = require('multer');
const { PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

// Set storagetype as temp in memory
const storage = multer.memoryStorage({
    fileName: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage: storage });

/**
 * Uploads file to temporary memory using multer
 */
exports.uploadToMemory = upload;

/**
 * Uploads file to our Amazon S3 Bucket
 * @param {*} s3 Amazon S3 instance
 * @param {File} file file to upload
 */
exports.uploadToCloud = async (s3, file) => {
    file.filename = `${Date.now()}-${file.originalname}`;

    const uploadParams = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: file.filename,
        Body: file.buffer,
        ContentType: file.mimetype,
    }

    const cmd = new PutObjectCommand(uploadParams);
    await s3.send(cmd);

    return file;
};

/**
 * Gets a signed url from AWS S3 and replaces the image name with an absolute path.
 * @param {Object} s3 the current s3 instance
 * @param {Object|Array} posts A single post or Array of posts to modify urls
 */
exports.replaceFilePath = async (s3, posts) => {
    const replacePostImage = async (post) => {
        const imageKey = post.image || 'default_image.png';
    
        const command = new GetObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: imageKey,
        });
        
        post.image = await getSignedUrl(s3, command, { expiresIn: 60 * 10 });
    };

    if(Array.isArray(posts)) {
        await Promise.all(posts.map(post => replacePostImage(post)));
    } else {
        await replacePostImage(posts);
    }
};

async function replacePfpImage(s3, user) {
    const pfpKey = user.profilePicture || 'default_image.png';

    const command = new GetObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: pfpKey,
    });
    
    user.profilePicture = await getSignedUrl(s3, command, { expiresIn: 60 * 10 });
};

/**
 * Gets a signed url from AWS S3 and replaces the profile picture image name with an absolute path.
 * @param {Object} s3 the current s3 instance
 * @param {Object|Array} users A single user or Array of users to modify urls
 */
exports.replaceProfilePicPath = async (s3, users) => {
    if(Array.isArray(users)) {
        await Promise.all(users.map(user => replacePfpImage(s3, user)));
    } else {
        await replacePfpImage(s3, users);
    }
};

/**
 * Gets a signed url from AWS S3 and replaces the profile picture image name with an absolute path.
 * @param {Object} s3 the current s3 instance
 * @param {Object|Array} users A single user or Array of users to modify urls
 */
exports.replaceCommentProfilePicPath = async (s3, comments) => {
    if(Array.isArray(comments)) {
        await Promise.all(comments.map(comment => replacePfpImage(s3, comment.owner)));
    } else {
        await replacePfpImage(s3, comments.owner);
    }
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
