import React from 'react'
import { Route, Switch } from 'react-router-dom'
import Home from './components/Home'

import UserProfile from './components/UserProfile'
import UserLogin from './components/UserLogin'
import UserRegister from './components/UserRegister'
import PostAdd from './components/post/PostAdd'
import PostEdit from './components/post/PostEdit'

const Routes = () => (
  <Switch>
    <Route exact path='/' component={Home} />
    <Route path='/user/profile/:userId' component={UserProfile} />
    <Route exact path='/user/login' component={UserLogin} />
    <Route exact path='/user/register' component={UserRegister} />
    <Route exact path='/post/add' component={PostAdd} />
    <Route exact path='/post/edit/:postId' component={PostEdit} />
    <Route component={Home} />
  </Switch>
)

export default Routes
