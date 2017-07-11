import React from 'react'

export default class PostInfo extends React.Component {
  render () {
    return (
      <div className='col-xs-12' >
        <br />
        <h2>{ this.props.post.content }</h2>
        <span className='votes' >Likes:
                    <strong> { this.props.post.likes.length }</strong>
        </span>
      </div>
    )
  }
}
