import React from 'react'
import { Route, Switch } from 'react-router-dom'
import Home from './components/Home'

import UserProfile from './components/UserProfile'
import UserLogin from './components/UserLogin'
import UserRegister from './components/UserRegister'
import PostAdd from './components/post/PostAdd'
import PostEdit from './components/post/PostEdit'
import PostDelete from './components/post/PostDelete'
import BlockUser from './components/BlockUser'
import AdminPanel from './components/AdminPanel'
import ProfilePictureAdd from './components/ProfilePictureAdd'

const Routes = () => (
  <Switch>
    <Route exact path='/' component={Home} />
    <Route path='/user/profile/:userId' component={UserProfile} />
    <Route exact path='/user/login' component={UserLogin} />
    <Route exact path='/user/register' component={UserRegister} />
    <Route exact path='/post/add' component={PostAdd} />
    <Route exact path='/post/edit/:postId' component={PostEdit} />
    <Route exact path='/post/delete/:postId' component={PostDelete} />
    <Route exact path='/user/block' component={BlockUser} />
    <Route exact path='/user/admin-panel' component={AdminPanel} />
    <Route exact path='/user/profile-picture/:userId' component={ProfilePictureAdd} />
    <Route component={Home} />
  </Switch>
)

export default Routes
