import { GraphQLServer } from 'graphql-yoga';

//Mock users
const users = [
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
const posts = [
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
const comments = [
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

//type definitions (schema)
const typeDefs = `
    type Query {
        me: User!
        post: Post!
        users(query: String): [User!]!
        posts(query: String): [Post!]!
        comments: [Comment!]!
    }
    type Mutation {
        createUser(name: String!, email: String!, age: Int): User!
        createPost(title: String!, body: String!, published: Boolean!, author: ID!): Post!
        createComment(text: String!, author: ID!, post:ID!): Comment!
    }
    type User {
        id: ID!
        name: String!
        email: String!
        age: Int,
        posts: [Post!]!
        comments: [Comment!]!
    }
    type Post {
        id: ID!
        title: String!
        body: String!
        published: Boolean!
        author: User!
        comments: [Comment!]!
    }
    type Comment {
        id: ID!
        text: String!
        author: User!
        post: Post!
    }
`

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
            const emailTaken = users.some((user) => user.email === args.email);

            if (emailTaken) {
                throw new Error('Email taken');
            }

            const user = {
                id: new Date().valueOf(),
                ...args
            }

            users.push(user);

            return user;
        },
        createPost (parent, args, ctx, info) {
            const userExists = users.some((user) => user.id === args.author);

            if (!userExists) {
                throw new Error('Author does not exist');
            }

            const post = {
                id: new Date().valueOf(),
                ...args
            }

            posts.push(post);

            return post;
        },
        createComment (parent, args, ctx, info) {
            const userExists = users.some((user) => user.id === args.author);
            const postExists = posts.some((post) => post.id === args.post);
            const currentPost = posts.find((post) => post.id === args.post);
            
            if (!userExists) {
                throw new Error('User does not exist');
            }

            if (!postExists || !currentPost.published) {
                throw new Error('Post does not exist or is not puslished');
            }

            const comment = {
                id: new Date().valueOf() + 123,
                ...args
            };

            comments.push(comment);

            return comment;
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
    typeDefs,
    resolvers
});

//callback to start the server
server.start(() => {
    console.log('Server is up!!!');
});