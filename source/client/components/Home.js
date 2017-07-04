import React from 'react'
import HomeStore from '../stores/HomeStore'

export default class Home extends React.Component {
  constructor (props) {
    super(props)
    this.state = HomeStore.getState()

    this.onChange = this.onChange.bind(this)
  }

  onChange (state) {
    this.setState(state)
  }

  componentDidMount () {
    HomeStore.listen(this.onChange)
  }

  componentWillUnmount () {
    HomeStore.unlisten(this.onChange)
  }

  render () {
    return (
      <div className='container' >
        <h3 className='text-center' >Welcome to
          <strong> Simple Social Network</strong>
        </h3>
      </div>
    )
  }
}
