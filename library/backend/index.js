require('dotenv').config()
const { ApolloServer, gql, UserInputError, AuthenticationError } = require('apollo-server')
const mongoose = require('mongoose')
const Author = require('./mongo/models/author')
const Book = require('./mongo/models/book')
const jwt = require('jsonwebtoken')
const User = require('./mongo/models/user')
const { PubSub } = require('apollo-server')
const pubsub = new PubSub()
const MONGODB_URL = process.env.MONGODB_URL
const JWT_SECRET = process.env.SECRET

console.log('connecting to MONGO_DB')
if (MONGODB_URL && !mongoose.connection.readyState) mongoose.connect(MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true })

const typeDefs = gql`
  type Author {
    name: String!
    bookCount: Int!
    born: Int
    id: ID!
  }

  type Book {
    title: String!
    published: Int!
    author: Author!
    genres: [String!]!
    id: ID!
  }

  type Token {
    value: String!
  }

  type User {
    username: String!
    favoriteGenre: String!
    id: ID!
  }

  type Query {
    bookCount: Int!
    authorCount: Int!
    allBooks(author: String, genre: String): [Book]
    allAuthors: [Author!]!
    me: User
    allGenres: [String!]!
  }

  type Mutation {
    addBook(
      title: String!
      published: Int!
      author: String!
      genres: [String!]!
    ) : Book

    editAuthor(
      name: String!
      setBornTo: Int!
    ) : Author

    createUser(
      username: String!
      favoriteGenre: String!
    ): User

    login(
      username: String!
      password: String!
    ): Token
  }

  type Subscription {
    bookAdded: Book!
  }
`
const resolvers = {
  Query: {
    bookCount: () => Book.collection.countDocuments(),
    authorCount: () => Author.collection.countDocuments(),
    allBooks: async (root, args) => {
      
      if(args.author && args.genre) {

        const author = await Author.findOne({ name: args.author })
        return Book.find({ author: author.id, genres: { $in: args.genre } })
      } else if(args.author) {

        const author = await Author.findOne({ name: args.author })
        return Book.find({ author: author.id })
      } else if (args.genre)  {

        return Book.find({ genres: { $in: args.genre } }).populate('author', { name: 1 })
      } else {

        return Book.find({}).populate('author', { name: 1 })
      }
    },
    allAuthors: () => Author.find({}),
    me: (root, args, context) => context.currentUser,
    allGenres: () => Book.find({}).distinct('genres')
  },
  Mutation: {
    addBook: async (root, args, { currentUser }) => {
    
      if(!currentUser) {
        throw new AuthenticationError('not authenticated')
      }

      let author = await Author.findOne({ name: args.author })

      if(!author) {
        author = new Author({ name: args.author, born: null })
        try {
          author = await author.save()
          } catch (error) {
          throw new UserInputError(error.message, {
            invalidArgs: args,
          })
        }
      }

      const book = new Book({ ...args, author: author })
      try {
        await book.save()
      } catch(error) {
        throw new UserInputError(error.message, {
        invalidArgs: args
        })
      }

      pubsub.publish('BOOK_ADDED', { bookAdded: book })

      return book
    },

    editAuthor: async (root, args, { currentUser }) => {
      if(!currentUser) {
        throw new AuthenticationError('not authenticated')
      }
      const author = await Author.findOneAndUpdate({ name: args.name }, { born: args.setBornTo }, { new : true })
      return author ? author : null
    },

    createUser: (root, args) => {
      const user = new User({ ...args })
      
      return user.save()
      .catch(error => {
        throw new UserInputError(error.message, {
          invalidArgs: args,
        })
      })
    },

    login: async (root, args) => {
      const user = await User.findOne({ username: args.username })

      if(!user || args.password !== 'secret') {
        throw new UserInputError('Wrong credentials')
      }

      const userForToken = {
        username: user.username,
        id: user._id,
      }

      return { value: jwt.sign(userForToken, JWT_SECRET) }
    }
  },
  Subscription: {
    bookAdded: {
      subscribe: () => pubsub.asyncIterator(['BOOK_ADDED'])
    }
  },
  Author: {
    bookCount: async (root) => {
      const author = await Author.findOne({ name: root.name })
      const books = await Book.find({ author: author._id }) 
      return books.length
    }
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    const auth = req ? req.headers.authorization : null
    if(auth && auth.toLowerCase().startsWith('bearer ')) {
      const decodedToken = jwt.verify(
        auth.substring(7), JWT_SECRET
      )
      const currentUser = await User.findById(decodedToken.id)
      return { currentUser }
    }
  }
})

server.listen().then(({ url, subscriptionsUrl }) => {
  console.log(`Server ready at ${url}`)
  console.log(`Subscriptions ready at ${subscriptionsUrl}`)
})