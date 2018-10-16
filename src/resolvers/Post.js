const Post = {
    author (parent, args, {db}, info) {
        //the parent parameter has access to root attributes of the Post type, ex: Post.id, Post.title etc
        return db.users.find((user) => {
            return user.id === parent.author;
        })
    },
    comments (parent, args, {db}, info) {
        return db.comments.filter((comment) => {
            return comment.post === parent.id;
        })
    }
};

export {Post as default}