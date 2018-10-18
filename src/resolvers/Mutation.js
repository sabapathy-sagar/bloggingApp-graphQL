const Mutation = {
    createUser (parent, args, {db}, info) {
        const emailTaken = db.users.some((user) => user.email === args.data.email);

        if (emailTaken) {
            throw new Error('Email taken');
        }

        const user = {
            id: new Date().valueOf(),
            ...args.data
        }

        db.users.push(user);

        return user;
    },
    deleteUser (parent, args, {db}, info) {
        //find the array index of the user which must be deleted
        const userIndex = db.users.findIndex((user) => user.id === args.id);

        //if the user is not found then throw an error
        if (userIndex === -1) {
            throw new Error('User not found!');
        };

        //delete the user from the db.users array
        const deletedUsers = db.users.splice(userIndex, 1);

        //filter out the db.posts of the deleted user
        db.posts = db.posts.filter((post) => {
            //find the post created by the user
            const match = post.author === args.id;

            if(match){
                //if the post was found, delete the db.comments associated to the user
                //by filtering out the db.comments made by the user
                db.comments = db.comments.filter((comment) => comment.author !== args.id);
            }

            return !match;
        });

        //filter out all the db.comments associated to the user
        db.comments = db.comments.filter((comment) => comment.author !== args.id);

        return deletedUsers[0];

    },
    updateUser (parent, args, {db}, info) {
        const {id, data} = args;

        //find the user
        const user = db.users.find((user) => user.id === id);

        if(!user) {
            throw new Error('user does not exist!');
        }

        if(typeof data.email === "string") {
            //verify if no other user has the same email
            const emailTaken = db.users.some((user) => user.email === data.email);

            if(emailTaken) {
                throw new Error('Email taken!');
            }

            user.email = data.email;
        }

        if(typeof data.name === "string") {
            user.name = data.name;
        }

        if(typeof data.age !== "undefined") {
            user.age = data.age;
        }

        return user;

    },
    createPost (parent, args, {db, pubsub}, info) {
        const userExists = db.users.some((user) => user.id === args.data.author);

        if (!userExists) {
            throw new Error('Author does not exist');
        }

        const post = {
            id: new Date().valueOf(),
            ...args.data
        }

        db.posts.push(post);

        //publish the post as soon as it is created, so that the listeners subscribed 
        //to 'post' subscription channel are notified
        if(post.published){
            pubsub.publish('post', {
                post: {
                    mutation: 'CREATED',
                    data: post
                }
            })
        }
        

        return post;
    },
    deletePost (parent, args, {db, pubsub}, info) {
        const postIndex = db.posts.findIndex((post) => post.id === args.id);

        if (postIndex === -1) {
            throw new Error('post not found!');
        }

        const deletedPosts = db.posts.splice(postIndex, 1);

        db.comments = db.comments.filter((comment) => comment.post !== args.id);

        //publish post that has the 'published' flag set to true
        if(deletedPosts[0].published) {
            pubsub.publish('post', {
                post: {
                    mutation: 'DELETED',
                    data: deletedPosts[0]
                }
            })
        }


        return deletedPosts[0];
    },
    updatePost (parent, args, {db, pubsub}, info) {
        const {id, data} = args;

        const post = db.posts.find((post) => post.id === id);
        const originalPost = {...post};

        if(!post) {
            throw new Error('Post does not exist!');
        }

        if(typeof data.title === 'string') {
            post.title = data.title;
        };

        if(typeof data.body === 'string'){
            post.body = data.body;
        }

        if(typeof data.published === 'boolean') {
            post.published = data.published;

            //original post was published and the updated post is unpublished, then delete the post
            if (originalPost.published && !post.published){
                //delete
                pubsub.publish('post', {
                   post: {
                        mutation: 'DELETED',
                        data: originalPost
                   } 
                })
            } else if (!originalPost.published && post.published){
                //original post was unpublished and the updated post is published, then create the post
                //create
                pubsub.publish('post', {
                    post: {
                         mutation: 'CREATED',
                         data: post
                    } 
                 })

            }
            //if the post was alredady published and only the other fields were updated
            if (originalPost.published === post.published) {
                //update
                pubsub.publish('post', {
                    post: {
                         mutation: 'UPDATED',
                         data: post
                    } 
                 })
            }
        } 

        return post;

    },
    createComment (parent, args, {db, pubsub}, info) {
        const userExists = db.users.some((user) => user.id === args.data.author);
        const postExists = db.posts.some((post) => post.id === args.data.post);
        const currentPost = db.posts.find((post) => post.id === args.data.post);
        
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

        db.comments.push(comment);

        //publish the comment as soon as it is created, so that the listeners subscribed 
        //to 'comment postId' subscription are notified
        pubsub.publish(`comment ${args.data.post}`, {
            comment: {
                mutation: 'CREATED',
                data: comment
            }
        })

        return comment;
    },
    deleteComment (parent, args, {db, pubsub}, info) {
        const commentIndex = db.comments.findIndex((comment) => comment.id === args.id);

        if(commentIndex === -1){
            throw new Error('comment not found!');
        }

        const deletedComments = db.comments.splice(commentIndex, 1);

        pubsub.publish(`comment ${deletedComments[0].post}`, {
            comment: {
                mutation: 'DELETED',
                data: deletedComments[0]
            }
        })


        return deletedComments[0];
    },
    updateComment (parent, args, {db, pubsub}, info) {
        const {id, data} = args;

        const comment = db.comments.find((comment) => comment.id === id);

        if (!comment) {
            throw new Error('comment not found!');
        }

        if(typeof data.text === 'string'){
            comment.text = data.text;
        }

        pubsub.publish(`comment ${comment.post}`, {
            comment: {
                mutation: 'UPDATED',
                data: comment
            }
        })

        return comment;
    }
};

export {Mutation as default}