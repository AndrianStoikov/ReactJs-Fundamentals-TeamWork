import alt from '../alt'
import Auth from '../components/Auth'
import NavbarActions from '../actions/NavbarActions'

class NavbarStore {
  constructor () {
    this.bindActions(NavbarActions)
    // this.state = {
    //   username: Auth.getUser().username
    // }
    this.username = Auth.getUser().username
    this.ajaxAnimationClass = ''
  }

  onUpdateAjaxAnimation (animationClass) {
    this.ajaxAnimationClass = animationClass
  }
}

export default alt.createStore(NavbarStore)
