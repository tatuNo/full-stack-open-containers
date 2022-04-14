import React, { useState, useEffect } from 'react'
import { useQuery, useLazyQuery } from '@apollo/client'
import { ALL_BOOKS, ALL_GENRES, BOOKS_BY_GENRE } from '../queries'
import Select from 'react-select'
import BookList from './BookList'

const Books = (props) => {
  const [selectedOption, setSelectedOption] = useState('')
  const [genreBooks, setGenreBooks] = useState(null)

  const books = useQuery(ALL_BOOKS)
  const [getBooksByGenre, result] = useLazyQuery(BOOKS_BY_GENRE)
  const genres = useQuery(ALL_GENRES)

  useEffect(() => {
    if(result.data) {
      setGenreBooks(result.data.allBooks)
    }
  }, [result])

  if (!props.show) {
    return null
  }

  if (books.loading || genres.loading) {
    return <div>loading. . .</div>
  }

  const options = [
    { value: 'All books', label: 'All books'}
  ].concat(genres.data.allGenres.map(genre => ({ value: genre, label: genre})))

  const handleSelect = () => {
    selectedOption.value === 'All books' ? setGenreBooks(null) : getBooksByGenre({ variables: { genreToSearch: selectedOption.value } })
  }

  return (
    <div>
      <h2>books</h2>
        <BookList books={genreBooks ? genreBooks : books.data.allBooks} />
      <div>
        <h2>Select genre</h2>
        <Select
          value={selectedOption}
          onChange={setSelectedOption}
          options={options}
        />
        <button onClick={handleSelect}>search</button>
      </div>
    </div>
  )
}

export default Books