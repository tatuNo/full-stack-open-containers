import { gql } from '@apollo/client'

export const ALL_AUTHORS = gql`
  query {
    allAuthors {
      id
      name
      born
      bookCount
    }
  }
`
export const ALL_BOOKS = gql`
  query {
    allBooks {
      id
      title
      published
      genres
      author { name }
    }
  }
`

export const CREATE_BOOK = gql`
  mutation createBook($title: String!, $published: Int!, $author: String!, $genres: [String!]!) {
    addBook(
      title: $title,
      published: $published,
      author: $author,
      genres: $genres
    ) {
      title,
      published,
      author { name },
      genres
    }
  }
`

export const UPDATE_AUTHOR = gql`
  mutation updateAuthor($name: String!, $born: Int!) {
    editAuthor(
      name: $name,
      setBornTo: $born
    ) {
      name,
      born
    }
  }
`

export const LOGIN = gql`
  mutation login($username: String!, $password: String!) {
    login(
      username: $username,
      password: $password
    ) {
      value
    }
  }
`

export const ALL_GENRES = gql`
  query {
    allGenres
  }
`

export const BOOKS_BY_GENRE = gql`
  query findBooksByGenre($genreToSearch: String!) {
    allBooks(genre: $genreToSearch) {
      title
      author { name }
      published
    }
  }
`

export const ME = gql`
  query {
    me { favoriteGenre, username }
  }
`

export const BOOK_ADDED = gql`
subscription {
  bookAdded {
    title
    published
    author { name }
    genres
  }
}
`
