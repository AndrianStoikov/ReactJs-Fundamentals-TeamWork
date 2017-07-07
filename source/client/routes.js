import React from 'react'
import { Route, Switch } from 'react-router-dom'
import Home from './components/Home'

import UserProfile from './components/UserProfile'
import UserLogin from './components/UserLogin'
import UserRegister from './components/UserRegister'
import PostAdd from './components/post/PostAdd'
import BlockUser from "./components/BlockUser"

const Routes = () => (
    <Switch>
        <Route exact path='/' component={Home}/>
        <Route path='/user/profile/:userId' component={UserProfile}/>
        <Route exact path='/user/login' component={UserLogin}/>
        <Route exact path='/user/register' component={UserRegister}/>
        <Route exact path='/post/add' component={PostAdd}/>
        <Route exact path="/user/block" component={BlockUser}/>
        <Route component={Home}/>
    </Switch>
)

export default Routes
