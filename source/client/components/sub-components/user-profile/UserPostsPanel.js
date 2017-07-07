import React from 'react'

import PostCard from '../PostCard'

import Helpers from '../../../utilities/Helpers'

export default class UserPostsPanel extends React.Component {

  likePost () {
    let postId = this.props.post._id
    let request = {
      url: `/api/post/like/${postId}`,
      method: 'post'
    }

    $.ajax(request)
      .done(() => this.props.getUserPosts())
  }

  unlikePost () {
    let postId = this.props.post._id
    let request = {
      url: `/api/post/unlike/${postId}`,
      method: 'post'
    }

    $.ajax(request)
      .done(() => this.props.getUserPosts())
  }

  render () {
    let posts = this.props.posts.map((post, index) => {
      let postId = post._id

      let likeRequest = {
        url: `/api/post/like/${postId}`,
        method: 'post'
      }
      let unlikeRequest = {
        url: `/api/post/unlike/${postId}`,
        method: 'post'
      }

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
