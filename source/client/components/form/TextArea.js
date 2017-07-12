import React, { Component } from 'react'

export default class TextArea extends Component {
  render () {
    return (
      <div className={'form-group ' + this.props.validationState} >
        <label className='control-label' >{this.props.label}</label>
        <textarea
          type={this.props.type} className={'form-control ' + this.props.additionalClass}
          value={this.props.value}
          onChange={this.props.handleChange} autoFocus={this.props.autoFocus} />
        <span className='help-block' >{this.props.message}</span>
      </div>
    )
  }
}
