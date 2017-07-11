import React from 'react'

import PostCard from '../PostCard'

import Helpers from '../../../utilities/Helpers'

export default class UserPostsPanel extends React.Component {
  render () {
    let posts = this.props.posts.map((post, index) => {
      let postId = post._id

      let likeRequest = `/api/post/like/${postId}`
      let unlikeRequest = `/api/post/unlike/${postId}`

      return (
        <PostCard
          key={post._id}
          index={index}
          post={post}
          likePost={Helpers.likePost.bind(this, likeRequest, this.props.getUserPost)}
          unlikePost={Helpers.unlikePost.bind(this, unlikeRequest, this.props.getUserPost)}
        />
      )
    })

    return (
      <div>
        {posts}
      </div>
    )
  }
}
