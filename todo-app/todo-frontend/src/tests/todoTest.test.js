import React from 'react'
import '@testing-library/jest-dom/extend-expect'
import { render, fireEvent, screen } from '@testing-library/react'
import Todo from '../Todos/Todo'

describe('<Todo />', () => {
  let component

  const todo = {
    text: 'task to do',
    done: false
  }

  const deleteHandler = jest.fn()
  const completeHandler = jest.fn()

  beforeEach(() => {
    component = render(
      <Todo todo={todo} deleteTodo={deleteHandler} completeTodo={completeHandler} />
    )
  })

  test('Renders todo content', () => {
    expect(component.container).toHaveTextContent('task to do')
    expect(component.container).toHaveTextContent('This todo is not done')
  })

  test('When set as done -button is pressed handler is called', () => {
    const doneButton = screen.getByText('Set as done')
    fireEvent.click(doneButton)

    expect(completeHandler.mock.calls).toHaveLength(1)
  })

  test('When delete -button is pressed handler is called', () => {
    const deleteButton = screen.getByText('Delete')
    fireEvent.click(deleteButton)

    expect(deleteHandler.mock.calls).toHaveLength(1)
  })
})