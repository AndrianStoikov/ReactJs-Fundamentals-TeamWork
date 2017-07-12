import React from 'react'
import SearchedUserStore from '../stores/SearchedUserStore'
import SearchedUserActions from '../actions/SearchedUserActions'

import UserPostsPanel from '../components/sub-components/user-profile/UserPostsPanel'

import Auth from './Auth'

export default class SearchedUser extends React.Component {
    constructor (props) {
        super(props)
        this.state = SearchedUserStore.getState()

        this.onChange = this.onChange.bind(this)
    }

    onChange (state) {
        this.setState(state)
    }

    componentDidMount () {
        SearchedUserStore.listen(this.onChange)
    }

    componentWillUnmount () {
        SearchedUserStore.unlisten(this.onChange)
    }

    render () {
        return (
            <div className='container' >
                <h3 className='text-center' >
                    <strong> Tka shte turis usercheta</strong>
                </h3>
            </div>
        )
    }
}
