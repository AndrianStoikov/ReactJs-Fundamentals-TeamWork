import React from 'react'
import HomeStore from '../stores/HomeStore'
import HomeActions from '../actions/HomeActions'

import PostCard from './sub-components/PostCard'
import Helpers from '../utilities/Helpers'

import Auth from './Auth'

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
    if (Auth.isUserAuthenticated()) {
      HomeActions.getUserPosts()
    }
  }

  componentWillUnmount () {
    HomeStore.unlisten(this.onChange)
  }

  render () {
    let posts = this.state.posts.map((post, index) => {
      let postId = post._id

      let likeRequest = `/api/post/like/${postId}`
      let unlikeRequest = `/api/post/unlike/${postId}`

      return (
        <PostCard
          key={post._id}
          post={post}
          index={index}
          likePost={Helpers.likePost.bind(this, likeRequest, HomeActions.getUserPosts)}
          unlikePost={Helpers.unlikePost.bind(this, unlikeRequest, HomeActions.getUserPosts)}
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
