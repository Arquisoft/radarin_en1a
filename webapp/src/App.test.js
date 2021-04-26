import React from 'react'
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders learn react link', () => {
  render(<App/>);
  const linkElement = screen.getByText(/Source code/i);
  expect(linkElement).toBeInTheDocument();
});

it("renders correclty", ()=>
{
    const {queryByTestId} = render(<Map/>);

    expect(queryByTestId("friends-circle")).toBeTruthy
});