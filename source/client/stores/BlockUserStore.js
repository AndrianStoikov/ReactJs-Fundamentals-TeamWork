import BlockUserActions from '../actions/BlockUserActions'
import alt from '../alt'

class BlockUserStore {
    constructor () {
        this.bindActions(BlockUserActions)

        this.content = ''
        this.contentValidationState = ''
        this.message = ''
        this.formSubmitState = ''
    }

    onBlockUserFail(err){
        console.log('Failed to block user', err)
    }

    onBlockUserSuccess(){
        this.content = ''
        this.contentValidationState = ''
        this.message = 'User blocked'
        this.formSubmitState = ''
    }

    onHandleContentChange (e) {
        this.content = e.target.value
    }

    onContentValidationFail () {
        this.contentValidationState = 'has-error'
        this.message = 'Enter username of user who want to block'
        this.formSubmitState = ''
    }
}

export default alt.createStore(BlockUserStore)
