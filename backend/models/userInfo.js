const { uuid } = require('uuidv4');
const bcrypt = require('bcryptjs');

// This array will be replaced by our database in sprint 2 most likely.
const userInfo = [
    {
        id: '1',
        username: 'John123',
        password: '123456', // consider encoding
        firstName: 'John',
        lastName: 'Smith'
    },
    {
        id: '2',
        username: 'JaneDoe',
        password: 'password123', 
        firstName: 'Jane',
        lastName: 'Doe'
    },
    {
        id: '3',
        username: 'MikeRocks',
        password: 'mike1234', 
        firstName: 'Mike',
        lastName: 'Johnson'
    },
    {
        id: '4',
        username: 'SamanthaCon',
        password: 'samantha123', 
        firstName: 'Samantha',
        lastName: 'Connor'
    },
    {
        id: '5',
        username: 'Charlie777',
        password: 'charliepass', 
        firstName: 'Charlie',
        lastName: 'Brown'
    },
    {
        id: '6',
        username: 'LucySky',
        password: 'lucypass1', 
        firstName: 'Lucy',
        lastName: 'Sky'
    },
    {
        id: '7',
        username: 'TomCat',
        password: 'tommycat', 
        firstName: 'Tom',
        lastName: 'Caterson'
    },
    {
        id: '8',
        username: 'Linda123',
        password: 'lindapass', 
        firstName: 'Linda',
        lastName: 'Smith'
    },
    {
        id: '9',
        username: 'BobTheBuilder',
        password: 'builderBob', 
        firstName: 'Bob',
        lastName: 'Builder'
    },
    {
        id: '10',
        username: 'SammySam',
        password: 'sammy123', 
        firstName: 'Sam',
        lastName: 'Samson'
    }
];

// Gets the entire array of user info
exports.get = () => userInfo;

// Searches the user info array for a specific ID and returns it
exports.findById = (id) => userInfo.find(user => user.id === `${id}`);

exports.findByUsername = (username) => userInfo.find(user => user.username === username);

exports.matchLogin = (username, pass) => {
    const user = userInfo.find(u => u.username === username);
    if(!user) return undefined;
    
    return new Promise((resolve, reject) => {
        bcrypt.compare(pass, user.password)
        .then(success => {
            if(success) resolve(user);
            // TODO: remove unhashed password check eventually
            else if (user.password === pass) resolve(user);
            else return resolve(undefined);
        })
        .catch(err => reject(err));
    });
};

exports.addNewUser = (user) => {
    user.id = uuid();
    userInfo.push(user);
    return user.id;
};