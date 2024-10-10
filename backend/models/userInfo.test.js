const uInfo = require('./userInfo');

// test('adds 1 + 2 to equal 3', () => {
//     expect(sum(1, 2)).toBe(3);
//   });
const testingArrayMatch = [
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
test('Verify Array Retrieval', () => {
    expect(uInfo.get()).toStrictEqual(testingArrayMatch);
});

test('Check findById Edge cases', () => {
    expect(uInfo.findById(-1)).toBeUndefined();
    expect(uInfo.findById(0)).toBeUndefined();;
    expect(uInfo.findById(1)).toStrictEqual(testingArrayMatch[0]);
    expect(uInfo.findById('1')).toStrictEqual(testingArrayMatch[0]);
    expect(uInfo.findById(100)).toBeUndefined();
    expect(uInfo.findById(testingArrayMatch.length-1)).toStrictEqual(testingArrayMatch[testingArrayMatch.length-2]);
    expect(uInfo.findById(testingArrayMatch.length)).toStrictEqual(testingArrayMatch[testingArrayMatch.length-1]);
    expect(uInfo.findById(testingArrayMatch.length+1)).toBeUndefined();
});

test('Login Matching all users in array', () => {
    testingArrayMatch.forEach(u => {
        expect(uInfo.matchLogin(u.username, u.password)).resolves.toStrictEqual(u);
    });
});

test('Adding a new user', () => {
    const userToAdd = { 
        username: "ABC123",
        password: "987ABC",
        firstName: "Petro",
        lastName: "Jonokovich"
    };
    const userId = uInfo.addNewUser(userToAdd);
    expect(uInfo.findById(userId).id).toBe(userId);
});