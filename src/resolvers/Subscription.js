const Subscription = {
    comment: {
        subscribe (parent, args, ctx, info) {
            const {postId} = args;
            const {db, pubsub} = ctx;

            //check if post exists and is published
            const post = db.posts.find((post) => (post.id === postId) && post.published );

            if(!post){
                throw new Error('post does not exist!');
            }

            //set up the channel, with a channel name called 'comment postId'
            return pubsub.asyncIterator(`comment ${postId}`);
        }
    },
    post: {
        subscribe (parent, args, ctx, info) {
            const {db, pubsub} = ctx;

            //set up channel, with channel name 'post'
            return pubsub.asyncIterator('post');

        }
    }

};

export {Subscription as default}