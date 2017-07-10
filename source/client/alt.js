import Alt from 'alt'
import ReactDOM from 'react-dom'

export default new Alt({
  batchingFunction: ReactDOM.unstable_batchedUpdates
})
