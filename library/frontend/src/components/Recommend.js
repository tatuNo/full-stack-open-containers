import React, { useEffect } from 'react'
import BookList from './BookList'
import { useQuery, useLazyQuery } from '@apollo/client'
import { BOOKS_BY_GENRE, ME } from '../queries'

const Recommend = (props) => {
  const me = useQuery(ME)
  const [recommendBooks, result] = useLazyQuery(BOOKS_BY_GENRE)

  useEffect(() => {
    if(me.data && me.data.me) {
      recommendBooks({ variables: { genreToSearch: me.data.me.favoriteGenre } })
    }
  }, [me]) // eslint-disable-line

  if(!props.show) {
    return null
  }

  if(me.loading || result.loading) {
    return <div>loading...</div>
  }

  return (
    <div>
      <h2>recommendations</h2>
      {me.data.me && <p>books in your favorite genre <b>{me.data.me.favoriteGenre}</b></p> }
      <BookList books={result.data.allBooks} />
    </div>
   )
}

export default Recommend