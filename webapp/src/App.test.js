import React from 'react'
import renderer from 'react-test-renderer';
import Link from '../Link.react';

it('renders correctly', () => {
  const tree = renderer
    .create(<Link page="http://www.facebook.com">Facebook</Link>)
    .toJSON();
  expect(tree).toMatchSnapshot();
});

it("renders correclty", ()=>
{
    const {queryByTestId} = renderer(<Map/>);

    expect(queryByTestId("friends-circle")).toBeTruthy
});