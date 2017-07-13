import SearchBarActions from '../../actions/searchbar-actions/SearchBarActions'
import alt from '../../alt'

class SearchBarStore {
    constructor () {
        this.bindActions(SearchBarActions)

        this.content = ''
    }

    onHandleContentChange (e) {
        this.content = e.target.value
    }

    onLoadSearchBarForm(){
        this.content = ''
    }
}

export default alt.createStore(SearchBarStore)
