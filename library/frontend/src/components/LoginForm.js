import React, { useState, useEffect } from 'react'
import { useMutation, useApolloClient } from '@apollo/client'
import { LOGIN } from '../queries'

const LoginForm = (props) => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const client = useApolloClient()
  const [login, result] = useMutation(LOGIN, {
    onError: (error) => {
      console.log(error.graphQLErrors[0].message)
    }
  })
  
  useEffect(() => {
    if(result.data) {
      const token = result.data.login.value
      props.setToken(token)
      localStorage.setItem('library-user-token', token)
      client.resetStore()
    }
  }, [result.data]) // eslint-disable-line


  const handleSubmit = async event => {
    event.preventDefault()

    login({ variables: { username, password } })
    setUsername('')
    setPassword('')
    props.setPage('authors')
  }

  if (!props.show) {
    return null
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div>
          username <input
            value={username}
            onChange={({ target }) => setUsername(target.value)}
          />
        </div>
        <div>
          password <input
            type='password'
            value={password}
            onChange={({ target }) => setPassword(target.value)}
          />
        </div>
        <button type='submit'>login</button>
      </form>
    </div>
  )
}

export default LoginForm