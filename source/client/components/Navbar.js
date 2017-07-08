import React from 'react'
import { Link } from 'react-router-dom'
import Auth from '../components/Auth'
import NavbarActions from '../actions/NavbarActions'
import NavbarStore from '../stores/NavbarStore'
import NavbarUserMenu from './sub-components/NavbarUserMenu'

export default class Navbar extends React.Component {
  constructor (props) {
    super(props)
    this.state = NavbarStore.getState()
    this.onChange = this.onChange.bind(this)
  }

  onChange (state) {
    this.setState(state)
  }

  componentDidMount () {
    NavbarStore.listen(this.onChange)

    $(document).ajaxStart(() => NavbarActions.updateAjaxAnimation('fadeIn'))
    $(document).ajaxComplete(() => NavbarActions.updateAjaxAnimation('fadeOut'))
  }

  componentWillUnmount () {
    NavbarStore.unlisten(this.onChange)
  }

  render () {
    let navbarUserMenu = <NavbarUserMenu />
    return (
      <nav className='navbar navbar-default navbar-static-top' >
        <div className='navbar-header' >
          <button
            type='button'
            className='navbar-toggle collapsed'
            data-toggle='collapse'
            data-target='#navbar' >
            <span className='sr-only' >Toggle navigation</span>
            <span className='icon-bar' />
            <span className='icon-bar' />
            <span className='icon-bar' />
          </button>
          <Link to='/' className='navbar-brand' >
            <span
              ref='triangles'
              className={'triangles animated ' + this.state.ajaxAnimationClass} >
              <div className='tri invert' />
              <div className='tri invert' />
              <div className='tri' />
              <div className='tri invert' />
              <div className='tri invert' />
              <div className='tri' />
              <div className='tri invert' />
              <div className='tri' />
              <div className='tri invert' />
            </span>
            SSN
          </Link>
        </div>
        <div id='navbar' className='navbar-collapse collapse' >
          { Auth.isUserAuthenticated() ? (
            <ul className='nav navbar-nav' >
              <li>
                <Link to='/' >Home</Link>
              </li>
              <li>
                <Link to='/post/add' >AddPost</Link>
              </li>
              <li>
                <Link to='/post/edit/5960d462e5e8481cccfbba6f' >EditPost(testing)</Link>
              </li>
              { JSON.parse(window.localStorage.getItem('user')).roles.indexOf('Admin') >= 0 &&
                <li>
                  <Link to='/user/admin-panel' >Admin Panel</Link>
                </li>
              }
            </ul>
          ) : (
            <ul className='nav navbar-nav' >
              <li>
                <Link to='/' >Home</Link>
              </li>
            </ul>
          )}
          {navbarUserMenu}
        </div>
      </nav>
    )
  }
}
