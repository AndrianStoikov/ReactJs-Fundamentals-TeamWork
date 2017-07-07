import React from 'react'

import PostCard from '../PostCard'

export default class UserPostsPanel extends React.Component {
  render () {
    let posts = this.props.posts.map((post, index) => {
      return (
        <PostCard
          key={post._id}
          index={index}
          post={post} />
      )
    })
    return (
      <div>
        {posts}
      </div>
    )
  }
}
