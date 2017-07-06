import React from 'react'
import { Link } from 'react-router-dom'

export default class UserProfileInfo extends React.Component {
    constructor(props) {
        super(props)
    }

    render() {
        let roles
        if (this.props.roles) {
            roles = this.props.roles.map((role, index) => {
                return (
                    <h4 key={ index } className='lead'>
                        <strong>{ role }</strong>
                    </h4>
                )
            })
        }
        return (
            <div className='container profile-container'>
                <div className='profile-img'>
                    <img src='/images/user-default.png'/>
                </div>
                <div className='profile-info clearfix'>
                    <h2><strong>{ this.props.name }</strong></h2>
                    <h4 className='lead'>Roles:</h4>
                    { roles }
                    <p>{ this.props.information }</p>
                    <h4 className='lead'><Link className="label" to="/user/block">Block user</Link></h4>
                </div>

            </div>
        )
    }
}