import React from 'react'
import HomeStore from '../../stores/common-stores/HomeStore'
import HomeActions from '../../actions/common-actions/HomeActions'
import UserPostsPanel from '../user/UserPostsPanel'
import Auth from '../../utilities/Auth'
import ReactPaginate from 'react-paginate'

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

  handlePageChange (input) {
    let selected = input.selected
    let offset = Math.ceil(selected * 10)

    HomeActions.handlePageChange(offset)
  }

  render () {
    return (
      <div className='container' >
        <h3 className='text-center' >Welcome to
          <strong> Simple Social Network</strong>
        </h3>
        <UserPostsPanel
          posts={this.state.postsToDisplay}
          getUserPost={HomeActions.getUserPosts}
        />
        { this.state.posts.length > 0 &&
        <ReactPaginate
          previousLabel={'Previous'}
          nextLabel={'Next'}
          breakLabel={<a href=''>...</a>}
          breakClassName={''}
          pageCount={this.state.pageCount}
          marginPagesDisplayed={2}
          pageRangeDisplayed={5}
          onPageChange={this.handlePageChange}
          containerClassName={'pagination'}
          subContainerClassName={'pages pagination'}
          activeClassName={'active'} />}
      </div>
    )
  }
}
