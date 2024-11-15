const multer = require('multer');
const { PutObjectCommand } = require('@aws-sdk/client-s3');

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