import { GraphQLServer } from 'graphql-yoga';

//Mock users
let users = [
    {
        id: '1',
        name: 'Johnny',
        email: 'j@j.com'
    },
    {
        id: '2',
        name: 'Judo',
        email: 'j@ju.com'
    },
    {
        id: '3',
        name: 'Misty',
        email: 'm@j.com'
    }
];

//Mock posts
let posts = [
    {
        id: '1',
        title: 'Johnny',
        body: 'abc nanakdodo',
        published: true,
        author: '1'
    },
    {
        id: '2',
        title: 'qwert',
        body: 'abc xxxxjjjjj',
        published: false,
        author: '3'
    },
    {
        id: '3',
        title: 'poiuy',
        body: 'qwert nanakdodo',
        published: true,
        author: '1'
    }
];

//Mock comments 
let comments = [
    {
        id: '1',
        text: "whatsss",
        author: '2',
        post: '1'
    },
    {
        id: '2',
        text: "thiiss",
        author: '2',
        post: '3'
    },
    {
        id: '3',
        text: "ooops",
        author: '3',
        post: '3'
    },
    {
        id: '4',
        text: "yesss",
        author: '2',
        post: '1'
    }
]

//resolvers
const resolvers = {
    Query: {
        me () {
            return {
                id: '12345',
                name: 'abc',
                email: 'abc@a.com'
            };
        },
        post () {
            return {
                id: '12345',
                title: 'some title',
                body: 'some body',
                published: true
            };
        },
        users (parent, args, ctx, info) {
            if (!args.query) {
                return users;
            }

            return users.filter((user) => {
                return user.name.toLowerCase().includes(args.query.toLowerCase());
            });
        },
        posts (parent, args, ctx, info) {
            if (!args.query) {
                return posts;
            }

            return posts.filter((post) => {
                return post.title.toLowerCase().includes(args.query.toLowerCase()) || post.body.toLowerCase().includes(args.query.toLowerCase());
            })
        },
        comments (parent, args, ctx, info) {
            return comments;
        }
    },
    Mutation: {
        createUser (parent, args, ctx, info) {
            const emailTaken = users.some((user) => user.email === args.data.email);

            if (emailTaken) {
                throw new Error('Email taken');
            }

            const user = {
                id: new Date().valueOf(),
                ...args.data
            }

            users.push(user);

            return user;
        },
        deleteUser (parent, args, ctx, info) {
            //find the array index of the user which must be deleted
            const userIndex = users.findIndex((user) => user.id === args.id);

            //if the user is not found then throw an error
            if (userIndex === -1) {
                throw new Error('User not found!');
            };

            //delete the user from the users array
            const deletedUsers = users.splice(userIndex, 1);

            //filter out the posts of the deleted user
            posts = posts.filter((post) => {
                //find the post created by the user
                const match = post.author === args.id;

                if(match){
                    //if the post was found, delete the comments associated to the user
                    //by filtering out the comments made by the user
                    comments = comments.filter((comment) => comment.author !== args.id);
                }

                return !match;
            });

            //filter out all the comments associated to the user
            comments = comments.filter((comment) => comment.author !== args.id);

            return deletedUsers[0];

        },
        createPost (parent, args, ctx, info) {
            const userExists = users.some((user) => user.id === args.data.author);

            if (!userExists) {
                throw new Error('Author does not exist');
            }

            const post = {
                id: new Date().valueOf(),
                ...args.data
            }

            posts.push(post);

            return post;
        },
        deletePost (parent, args, ctx, info) {
            const postIndex = posts.findIndex((post) => post.id === args.id);

            if (postIndex === -1) {
                throw new Error('post not found!');
            }

            const deletedPosts = posts.splice(postIndex, 1);

            comments = comments.filter((comment) => comment.post !== args.id);

            return deletedPosts[0];
        },
        createComment (parent, args, ctx, info) {
            const userExists = users.some((user) => user.id === args.data.author);
            const postExists = posts.some((post) => post.id === args.data.post);
            const currentPost = posts.find((post) => post.id === args.data.post);
            
            if (!userExists) {
                throw new Error('User does not exist');
            }

            if (!postExists || !currentPost.published) {
                throw new Error('Post does not exist or is not puslished');
            }

            const comment = {
                id: new Date().valueOf() + 123,
                ...args.data
            };

            comments.push(comment);

            return comment;
        },
        deleteComment (parent, args, ctx, info) {
            const commentIndex = comments.findIndex((comment) => comment.id === args.id);

            if(commentIndex === -1){
                throw new Error('comment not found!');
            }

            const deletedComments = comments.splice(commentIndex, 1);

            return deletedComments[0];
        }
    },
    Post: {
        author (parent, args, ctx, info) {
            //the parent parameter has access to root attributes of the Post type, ex: Post.id, Post.title etc
            return users.find((user) => {
                return user.id === parent.author;
            })
        },
        comments (parent, args, ctx, info) {
            return comments.filter((comment) => {
                return comment.post === parent.id;
            })
        }
    },
    User: {
        posts (parent, args, ctx, info) {
            return posts.filter((post) => {
                return post.author === parent.id; 
            }) 
        },
        comments (parent, args, ctx, info) {
            return comments.filter((comment) => {
                return comment.author === parent.id;
            })
        }
    },
    Comment: {
        author (parent, args, ctx, info) {
            return users.find((user) => {
                return user.id === parent.author
            })
        },
        post (parent, args, ctx, info) {
            return posts.find((post) => {
                return post.id === parent.post;
            })
        }
    }
}

//create instance of the GraphQLServer with typedefs and resolvers
const server = new GraphQLServer({
    typeDefs: './src/schema.graphql',
    resolvers
});

//callback to start the server
server.start(() => {
    console.log('Server is up!!!');
});