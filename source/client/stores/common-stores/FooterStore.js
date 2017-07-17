import alt from '../../alt'
import FooterActions from '../../actions/common-actions/FooterActions'

class FooterStore {
  constructor () {
    this.bindActions(FooterActions)
  }
}

export default alt.createStore(FooterStore)
