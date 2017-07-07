import React from 'react'

import UserStore from '../stores/UserStore'
import HomeStore from '../stores/HomeStore'
import HomeActions from '../actions/HomeActions'

import PostCard from './sub-components/PostCard'
import Helpers from '../utilities/Helpers'

export default class Home extends React.Component {
  constructor (props) {
    super(props)
    this.state = HomeStore.getState()

    this.onChange = this.onChange.bind(this)
  }

  onChange (state) {
    this.setState(state)
  }

  getUserPosts () {
    if (UserStore.getState().loggedInUserId === '') {
      return
    }

    let request = {
      url: '/api/posts/all',
      method: 'get'
    }

    $.ajax(request)
      .done(data => HomeActions.getUserPostsSuccess(data))
      .fail(err => HomeActions.getUserPostsFail(err))
  }

  componentDidMount () {
    HomeStore.listen(this.onChange)
    this.getUserPosts()
  }

  componentWillUnmount () {
    HomeStore.unlisten(this.onChange)
  }

  render () {
    let posts = this.state.posts.map((post, index) => {
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
          post={post}
          index={index}
          likePost={Helpers.likePost.bind(this, likeRequest, this.getUserPosts)}
          unlikePost={Helpers.unlikePost.bind(this, unlikeRequest, this.getUserPosts)}
        />
      )
    })

    return (
      <div className='container' >
        <h3 className='text-center' >Welcome to
          <strong> Simple Social Network</strong>
        </h3>
        {posts}
      </div>
    )
  }
}
