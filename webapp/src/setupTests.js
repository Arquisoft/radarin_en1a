// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import {configure} from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

require("babel-core/register");
require("babel-polyfill");

configure({adapter: new Adapter()});