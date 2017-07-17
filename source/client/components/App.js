import React from 'react'
import Routes from '../routes'
import Navbar from './common/Navbar'
import Footer from './common/Footer'
import UserStore from '../stores/user-stores/UserStore'
import UserActions from '../actions/user-actions/UserActions'

export default class App extends React.Component {
  constructor (props) {
    super(props)

    this.state = UserStore.getState()

    this.onChange = this.onChange.bind(this)
  }

  onChange (state) {
    this.setState(state)
  }

  componentDidMount () {
    UserStore.listen(this.onChange)
  }

  componentWillUnmount () {
    UserStore.unlisten(this.onChange)
  }

  render () {
    return (
      <div>
        <Navbar history={this.props.history}/>
        <Routes history={this.props.history} />
        <Footer history={this.props.history}/>
      </div>
    )
  }
}
