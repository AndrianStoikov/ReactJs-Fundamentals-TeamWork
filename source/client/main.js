import React from 'react'
import {BrowserRouter} from 'react-router-dom'
import ReactDOM from 'react-dom'
import App from './components/App'
import createBrowserHistory from 'history/lib/createBrowserHistory'

let history = createBrowserHistory()

ReactDOM.render(
  <BrowserRouter >
    <App history={history} />
  </BrowserRouter>,
  document.getElementById('app')
)
