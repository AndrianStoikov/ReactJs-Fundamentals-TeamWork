import React from 'react'
import { Route } from 'react-router'

import App from './components/App'
import Home from './components/Home'
import UserProfile from './components/UserProfile'

export default (
  <Route component={ App }>
    <Route path="/" component={ Home } />
    <Route path="/user/profile/:userId" component={ UserProfile } />
  </Route>
)
