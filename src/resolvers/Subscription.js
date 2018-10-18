const Subscription = {
    count: {
        subscribe (parent, args, {pubsub}, info) {
            let count = 0;

            setInterval(() => {
                count++
                //publish method takes two arguments
                //name of the channel - count
                //data to publish - count data
                pubsub.publish('count', {
                    count
                })

            }, 1000)

            //set up the channel, with a channel name called 'count'
            return pubsub.asyncIterator('count');
        }
    },
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