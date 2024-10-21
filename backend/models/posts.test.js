const posts = require('./posts');
// get, findById, updatePost, newPost, deletePost

const testingPosts = [
    {
      _id: "67169bdf58329a43cdc22954",
      title: "most likely to be the post ever",
      description: "This is one of the posts of all time.",
      price: 32.39,
      owner: "66eda5f1c49d80aeb5f5dcff",
      image: null,
      imagetype: "shirt",
      sizes: ["S", "M", "L"]
    },
    {
      _id: "67169bdf58329a43cdc22955",
      title: "ultimate hoodie",
      description: "A hoodie like no other.",
      price: 45.99,
      owner: "66eda5f1c49d80aeb5f5dcff",
      image: null,
      imagetype: "hoodie",
      sizes: ["S", "M", "L", "XL"]
    },
    {
      _id: "67169bdf58329a43cdc22956",
      title: "classic cap",
      description: "A cap for every occasion.",
      price: 15.50,
      owner: "66eda5f1c49d80aeb5f5dcff",
      image: null,
      imagetype: "cap",
      sizes: ["One Size"]
    },
    {
      _id: "67169bdf58329a43cdc22957",
      title: "graphic tee",
      description: "A stylish graphic tee.",
      price: 25.00,
      owner: "66eda5f1c49d80aeb5f5dcff",
      image: null,
      imagetype: "shirt",
      sizes: ["S", "M", "L", "XL", "XXL"]
    },
    {
      _id: "67169bdf58329a43cdc22958",
      title: "leather jacket",
      description: "A timeless leather jacket.",
      price: 150.00,
      owner: "66eda5f1c49d80aeb5f5dcff",
      image: null,
      imagetype: "jacket",
      sizes: ["M", "L", "XL"]
    },
    {
      _id: "67169bdf58329a43cdc22959",
      title: "running shoes",
      description: "Comfortable running shoes.",
      price: 75.00,
      owner: "66eda5f1c49d80aeb5f5dcff",
      image: null,
      imagetype: "shoes",
      sizes: ["8", "9", "10", "11"]
    },
    {
      _id: "67169bdf58329a43cdc22960",
      title: "denim jeans",
      description: "Classic blue jeans.",
      price: 60.00,
      owner: "66eda5f1c49d80aeb5f5dcff",
      image: null,
      imagetype: "pants",
      sizes: ["30", "32", "34", "36"]
    },
    {
      _id: "67169bdf58329a43cdc22961",
      title: "beanie",
      description: "A warm winter beanie.",
      price: 12.00,
      owner: "66eda5f1c49d80aeb5f5dcff",
      image: null,
      imagetype: "hat",
      sizes: ["One Size"]
    },
    {
      _id: "67169bdf58329a43cdc22962",
      title: "summer dress",
      description: "Light and breezy summer dress.",
      price: 45.00,
      owner: "66eda5f1c49d80aeb5f5dcff",
      image: null,
      imagetype: "dress",
      sizes: ["S", "M", "L"]
    },
    {
      _id: "67169bdf58329a43cdc22963",
      title: "sneakers",
      description: "Trendy sneakers for everyday wear.",
      price: 80.00,
      owner: "66eda5f1c49d80aeb5f5dcff",
      image: null,
      imagetype: "shoes",
      sizes: ["7", "8", "9", "10"]
    }
  ];

test('Verify Array Retrieval', () => expect(posts.get()).toStrictEqual(testingPosts));

test('Find by ID Edge Cases', () =>{
    expect(posts.findById(-1)).toBeUndefined();
    expect(posts.findById(0)).toBeUndefined();
    expect(posts.findById(1)).toStrictEqual(testingPosts[0]);
    expect(posts.findById('1')).toStrictEqual(testingPosts[0]);
    expect(posts.findById(100)).toBeUndefined();
    expect(posts.findById(testingPosts.length-1)).toStrictEqual(testingPosts[testingPosts.length-2])
    expect(posts.findById(testingPosts.length)).toStrictEqual(testingPosts[testingPosts.length-1])
    expect(posts.findById(testingPosts.length+1)).toBeUndefined();
});


const postAdd = {
    title: "postTest",
    description: "This is a fake item to test",
    ownerId: '10000',
    price: 1000000,
    imageUrl: null,
    tags: ['expensive'],
    likes: []
}

test("new post Tests", () =>{
    const testPostID = posts.newPost(postAdd);
    expect(posts.findById(testPostID).id).toBe(testPostID);
})

test("UpdatePost Tests", () => {
    // Find post to update
    let post = posts.findByTitle(postAdd.title);

    // Update Post Title
    post.title = "updateTestTitle";
    
    // Perform the update
    const updatedPost = posts.updatePost(post.id, post);

    // Verify that the post has been updated
    expect(updatedPost.title).toBe("updateTestTitle");
    expect(posts.findById(post.id).title).toBe("updateTestTitle");
})

test("delete post", () => {
    //Create new post
    const testPostID = posts.newPost(postAdd);

    // Delete the newly created post
    const deletionResult = posts.deletePost(testPostID);

    // Verify that the post was deleted successfully
    expect(deletionResult).toBe(true);
    expect(posts.findById(testPostID)).toBeUndefined();
})