import React, { useState } from 'react'
import { ALL_AUTHORS, UPDATE_AUTHOR } from '../queries'
import { useQuery, useMutation } from '@apollo/client'
import Select from 'react-select'

const Authors = (props) => {
  const [born, setBorn] = useState('')
  const [selectedOption, setSelectedOption] = useState(null)
  
  const authors = useQuery(ALL_AUTHORS)
  const [ updateAuthor ] = useMutation(UPDATE_AUTHOR, {
    refetchQueries: [{ query: ALL_AUTHORS }]
  })

  if (!props.show) {
    return null
  }

  if(authors.loading) {
    return <div>loading. . .</div>
  }

  const options = authors.data.allAuthors.map(author => ({ value: author.name, label: author.name }))

  const handleSubmit = (event) => {
    event.preventDefault()
    updateAuthor({ variables: { name: selectedOption.value, born: Number(born) } })
    setBorn('')
    setSelectedOption(null)
  }

  return (
    <div>
      <h2>authors</h2>
      <table>
        <tbody>
          <tr>
            <th>
              name
            </th>
            <th>
              born
            </th>
            <th>
              books
            </th>
          </tr>
          {authors.data.allAuthors.map(a =>
            <tr key={a.name}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr>
          )}
        </tbody>
      </table>
      { props.token ?
      <div>
        <h2>Set birthyear</h2>
        <form onSubmit={handleSubmit}>
          <div>
            <Select
            defaultValue={selectedOption}
            onChange={setSelectedOption}
            options={options}
            />
          </div>
          <div>
            born
            <input
            value={born}
            onChange={({ target }) => setBorn(target.value)}
            />
          </div>
          <button type='submit'>update author</button>
        </form>
      </div>
      : null }
    </div>
  )
}

export default Authors