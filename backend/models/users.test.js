const uInfo = require('./userInfo');

// test('adds 1 + 2 to equal 3', () => {
//     expect(sum(1, 2)).toBe(3);
//   });

const testingUserInfo = [
    {
      _id: "66eda5f1c49d80aeb5f5dcff",
      name: "Jane Doe",
      email: "jane@abc.com",
      username: "jDoe26",
      postIds: ["databases", "painting", "soccer"],
      password: "jane123",
      addressIds: [""]
    },
    {
      _id: "55eda5f1c49d80aeb5f5dcff",
      name: "John Smith",
      email: "john@xyz.com",
      username: "jsmith88",
      postIds: ["gaming", "programming", "travel"],
      password: "john123",
      addressIds: ["address1"]
    },
    {
      _id: "77eda5f1c49d80aeb5f5dcff",
      name: "Alice Brown",
      email: "alice@xyz.com",
      username: "aliceB",
      postIds: ["fashion", "cooking", "fitness"],
      password: "alice456",
      addressIds: ["address2"]
    },
    {
      _id: "88eda5f1c49d80aeb5f5dcff",
      name: "Bob Johnson",
      email: "bob@abc.com",
      username: "bobbyJ",
      postIds: ["photography", "music", "writing"],
      password: "bob789",
      addressIds: ["address3"]
    },
    {
      _id: "99eda5f1c49d80aeb5f5dcff",
      name: "Charlie Green",
      email: "charlie@def.com",
      username: "charlieG23",
      postIds: ["movies", "sports", "technology"],
      password: "charlie321",
      addressIds: ["address4"]
    },
    {
      _id: "00eda5f1c49d80aeb5f5dcff",
      name: "Emily White",
      email: "emily@abc.com",
      username: "emilyW",
      postIds: ["photography", "travel", "fashion"],
      password: "emily123",
      addressIds: ["address5"]
    },
    {
      _id: "11eda5f1c49d80aeb5f5dcff",
      name: "David Harris",
      email: "david@xyz.com",
      username: "dHarris",
      postIds: ["sports", "gaming", "travel"],
      password: "david456",
      addressIds: ["address6"]
    },
    {
      _id: "22eda5f1c49d80aeb5f5dcff",
      name: "Sara King",
      email: "sara@def.com",
      username: "saraK",
      postIds: ["art", "music", "cooking"],
      password: "sara789",
      addressIds: ["address7"]
    },
    {
      _id: "33eda5f1c49d80aeb5f5dcff",
      name: "Tom Lee",
      email: "tom@abc.com",
      username: "tomL22",
      postIds: ["movies", "technology", "writing"],
      password: "tom123",
      addressIds: ["address8"]
    },
    {
      _id: "44eda5f1c49d80aeb5f5dcff",
      name: "Anna Scott",
      email: "anna@xyz.com",
      username: "annaS",
      postIds: ["photography", "art", "fashion"],
      password: "anna456",
      addressIds: ["address9"]
    }
  ];

test('Verify Array Retrieval', () => {
    expect(uInfo.get()).toStrictEqual(testingUserInfo);
});

test('Check findById Edge cases', () => {
    expect(uInfo.findById(-1)).toBeUndefined();
    expect(uInfo.findById(0)).toBeUndefined();;
    expect(uInfo.findById(1)).toStrictEqual(testingUserInfo[0]);
    expect(uInfo.findById('1')).toStrictEqual(testingUserInfo[0]);
    expect(uInfo.findById(100)).toBeUndefined();
    expect(uInfo.findById(testingUserInfo.length-1)).toStrictEqual(testingUserInfo[testingUserInfo.length-2]);
    expect(uInfo.findById(testingUserInfo.length)).toStrictEqual(testingUserInfo[testingUserInfo.length-1]);
    expect(uInfo.findById(testingUserInfo.length+1)).toBeUndefined();
});

test('Login Matching all users in array', () => {
    testingUserInfo.forEach(u => {
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