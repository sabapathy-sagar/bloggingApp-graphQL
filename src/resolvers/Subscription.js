const Subscription = {
    count: {
        subscribe (parent, args, {pubsub}, info) {
            let count = 0;

            setInterval(() => {
                count++
                //publish method takes two arguments
                //name of the channel - count
                //data to publish
                pubsub.publish('count', {
                    count
                })

            }, 1000)

            //set up the channel, with a name called 'count'
            return pubsub.asyncIterator('count');
        }
    }

};

export {Subscription as default}