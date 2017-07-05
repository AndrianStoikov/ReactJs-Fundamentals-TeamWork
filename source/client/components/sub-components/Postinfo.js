import React from 'react'
import { Link } from 'react-router-dom'

export default class PostInfo extends React.Component {
  render () {
    return (
      <div className='media-body' >
        <h4 className='media-heading' >
          <Link to={`/movie/${this.props.post._id}/${this.props.post.name}`} >
            { this.props.post.name }
          </Link>
        </h4>
        <br />
        <p>{ this.props.post.description }</p>
        <span className='votes' >Votes:
                    <strong> { this.props.post.votes }</strong>
        </span>
      </div>
    )
  }
}
