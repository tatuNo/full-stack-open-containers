import React, { useState, useEffect } from 'react'
import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'
import LoginForm from './components/LoginForm'
import Recommend from './components/Recommend'
import { useApolloClient, useSubscription } from '@apollo/client'
import { ALL_AUTHORS, ALL_BOOKS, BOOK_ADDED } from './queries'

const App = () => {
  const [page, setPage] = useState('authors')
  const [token, setToken] = useState(null)
  const client = useApolloClient()

  useEffect(()=> {
    const token = localStorage.getItem('library-user-token')
    if(token) {
      setToken(token)
    }
  },[])

  const updateCacheWith = (addedBook) => {
    const includedIn = (set, object) => set.map(p => p.id).includes(object.id)

    const dataInBookStore = client.readQuery({ query: ALL_BOOKS })

    if(!includedIn(dataInBookStore.allBooks, addedBook)) {
      client.writeQuery({
        query: ALL_BOOKS,
        data: { allBooks: dataInBookStore.allBooks.concat(addedBook) }
      })
      const dataInAuthorStore = client.readQuery({ query: ALL_AUTHORS })
      const author = dataInAuthorStore.allAuthors.find(author => author.name === addedBook.author.name)
      if(!author) {
        const newAuthor = {
          name: addedBook.author.name,
          born: null,
          bookCount: 1
        }
        client.writeQuery({
          query: ALL_AUTHORS,
          data: { allAuthors: dataInAuthorStore.allAuthors.concat(newAuthor) }
        })
        } else {
        const updatedAuthor = { ...author, bookCount: author.bookCount + 1}
        client.writeQuery({
          query: ALL_AUTHORS,
          data: { allAuthors: dataInAuthorStore.allAuthors.map(author => author.id === updatedAuthor.id ? updatedAuthor : author) }
        })
      }
    }
  }

  useSubscription(BOOK_ADDED, {
    onSubscriptionData: ({ subscriptionData }) => {
      const addedBook = subscriptionData.data.bookAdded
      window.alert(`New book "${addedBook.title}" added`)
      updateCacheWith(addedBook)
    }
  })

  const logout = () => {
    setToken(null)
    localStorage.clear()
    client.resetStore()
    setPage('authors')
  }

  return (
    <div>
      <div>
        <button onClick={() => setPage('authors')}>authors</button>
        <button onClick={() => setPage('books')}>books</button>
        { token ? <><button onClick={() => setPage('add')}>add book</button>
          <button onClick={logout}>logout</button>
          <button onClick={() => setPage('recommend')}>recommend</button>
          </>
          : <button onClick={() => setPage('login')}>login</button> 
        }
      </div>

      <Authors
        show={page === 'authors'}
        token={token}
      />

      <Books
        show={page === 'books'}
      />

      <NewBook
        show={page === 'add'}
      /> 
      
      <LoginForm 
        show={page === 'login'}
        setToken={setToken}
        setPage={setPage}
      />

      <Recommend
        show={page === 'recommend'}
        token={token}
      />
    </div>
  )
}

export default App