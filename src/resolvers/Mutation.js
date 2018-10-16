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
    createPost (parent, args, {db}, info) {
        const userExists = db.users.some((user) => user.id === args.data.author);

        if (!userExists) {
            throw new Error('Author does not exist');
        }

        const post = {
            id: new Date().valueOf(),
            ...args.data
        }

        db.posts.push(post);

        return post;
    },
    deletePost (parent, args, {db}, info) {
        const postIndex = db.posts.findIndex((post) => post.id === args.id);

        if (postIndex === -1) {
            throw new Error('post not found!');
        }

        const deletedPosts = db.posts.splice(postIndex, 1);

        db.comments = db.comments.filter((comment) => comment.post !== args.id);

        return deletedPosts[0];
    },
    createComment (parent, args, {db}, info) {
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

        return comment;
    },
    deleteComment (parent, args, {db}, info) {
        const commentIndex = db.comments.findIndex((comment) => comment.id === args.id);

        if(commentIndex === -1){
            throw new Error('comment not found!');
        }

        const deletedComments = db.comments.splice(commentIndex, 1);

        return deletedComments[0];
    }
};

export {Mutation as default}