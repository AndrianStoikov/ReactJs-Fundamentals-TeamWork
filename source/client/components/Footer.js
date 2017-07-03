import React, { Component } from 'react'
import { Link } from 'react-router'
import FooterStore from '../stores/FooterStore'
import FooterActions from '../actions/FooterActions'

export default class Footer extends Component {
  constructor (props) {
    super(props)

    this.state = FooterStore.getState()

    this.onChange = this.onChange.bind(this)
  }

  onChange (state) {
    this.setState(state)
  }

  componentDidMount () {
    FooterStore.listen(this.onChange)
  }

  componentWillUnmount () {
    FooterStore.unlisten(this.onChange)
  }

  render () {
    return (
      <footer>
        <div className="container">
          <div className="row">
            <div className="col-sm-5">
              <h3 className="lead">
                <strong>Information</strong> and
                <strong> Copyright</strong>
              </h3>
              <p>
                Powered by
                <strong> Express</strong>,
                <strong> MongoDB</strong> and
                <strong> React</strong>
              </p>
              <p>@2017 SoftUni.</p>
            </div>
            <div className="col-sm-3">
              <h3 className="lead">Author</h3>
              <a href="https://github.com/AndrianStoikov/ReactJs-Fundamentals-TeamWork">
                <strong> Team Unknown </strong>
              </a>
            </div>
          </div>
        </div>
      </footer>
    )
  }
}
