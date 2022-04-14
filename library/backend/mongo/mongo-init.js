db.createUser({
  user: 'the_username',
  pwd: 'the_password',
  roles: [
    {
      role: 'dbOwner',
      db: 'the_database',
    },
  ],
});

db.createCollection('users');
db.createCollection('authors');
db.createCollection('books');

db.users.insert({ username: 'user', favoriteGenre: 'genre' });