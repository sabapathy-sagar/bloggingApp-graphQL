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
];

const db = {
    users,
    posts,
    comments
};

export {db as default}

