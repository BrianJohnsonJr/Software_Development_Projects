const { get, findById, matchLogin } = require('./userInfo');

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
    expect(get()).toStrictEqual(testingArrayMatch);
});

test('Check findById Edge cases', () => {
    expect(findById(-1)).toBe(undefined);
    expect(findById(0)).toBe(undefined);
    expect(findById(1)).toStrictEqual(testingArrayMatch[0]);
    expect(findById('1')).toStrictEqual(testingArrayMatch[0]);
    expect(findById(100)).toBe(undefined);
    expect(findById(testingArrayMatch.length-1)).toStrictEqual(testingArrayMatch[testingArrayMatch.length-2]);
    expect(findById(testingArrayMatch.length)).toStrictEqual(testingArrayMatch[testingArrayMatch.length-1]);
    expect(findById(testingArrayMatch.length+1)).toBe(undefined);
});

test('Login Matching all users in array', () => {
    testingArrayMatch.forEach(u => {
        expect(matchLogin(u.username, u.password)).toStrictEqual(u);
    });
});