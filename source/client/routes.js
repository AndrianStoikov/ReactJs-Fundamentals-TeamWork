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
import PostComment from './components/post/comments/PostComment'
import AdminPanel from './components/AdminPanel'
import ProfilePictureAdd from './components/ProfilePictureAdd'
import EditComment from './components/post/comments/EditComment'
import DeleteComment from './components/post/comments/DeleteComment'
import Messenger from './components/messanger/Messenger'
import MessageThread from './components/messanger/MessageThread'
import SearchedUser from './components/SearchedUser'

const Routes = (history) => (
  <Switch>
    <Route exact path='/' component={Home} />
    <Route path='/user/profile/:userId' component={UserProfile} />
    <Route exact path='/user/login' component={UserLogin} />
    <Route exact path='/user/register' component={UserRegister} />
    <Route exact path='/post/comment/:postId' component={PostComment} />
    <Route exact path='/post/add' component={PostAdd} />
    <Route exact path='/post/edit/:postId' component={PostEdit} />
    <Route exact path='/post/delete/:postId' component={PostDelete} />
    <Route exact path='/user/block' component={BlockUser} />
    <Route exact path='/user/admin-panel' component={AdminPanel} />
    <Route exact path='/user/profile-picture/:userId' component={ProfilePictureAdd} />
    <Route path='/comment/edit/:id' component={EditComment} />
    <Route path='/comment/delete/:id' component={DeleteComment} />
    <Route path='/messenger' component={Messenger} />
    <Route path='/thread/:otherUserUsername' component={MessageThread} />
      <Route pat='/searchUser/:username' component={SearchedUser}/>
    <Route component={Home} />
  </Switch>
)

export default Routes
