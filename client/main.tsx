import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Store, createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';

import App from './main/components/App';
import rootReducer from './main/reducer';
import * as _ from 'lodash';
 
// Logger with default options 
import logger from 'redux-logger'

function loadState() { 
  try {
    const serialized = localStorage.getItem('state')
    return serialized ? JSON.parse(serialized) : {};
  } catch(err) {
    return {}
  }
 }
const saveState = _.throttle((state) => { 
  try {
    const serialized = JSON.stringify(state);
    localStorage.setItem('state', serialized);
  } catch(err) {
    //ignore
  }
}, 1000);

const initialState = loadState();

const store: Store<any> = createStore(
  rootReducer,
  initialState,
  //applyMiddleware(logger)
)

store.subscribe(() => saveState(store.getState()));

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('app')
);