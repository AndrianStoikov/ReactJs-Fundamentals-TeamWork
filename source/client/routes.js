import React from 'react'
import { Route, Switch } from 'react-router-dom'
import Home from './components/Home'
import UserProfile from './components/UserProfile'

const Routes = () => (
  <Switch>
    <Route exact path='/' component={Home} />
    <Route path='/user/profile/:userId' component={UserProfile} />
  </Switch>
)

export default Routes
