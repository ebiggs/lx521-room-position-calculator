import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Store, createStore } from 'redux';
import { Provider } from 'react-redux';

import App from './main/components/App';
import rootReducer from './main/reducer';
import * as _ from 'lodash';

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

const store: Store<any> = createStore(rootReducer, initialState);

store.subscribe(() => saveState(store.getState()));

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('app')
);