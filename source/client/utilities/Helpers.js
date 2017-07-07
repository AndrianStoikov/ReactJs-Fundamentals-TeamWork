import Data from '../DataRequests'

export default class Helpers {
  static appendToArray (value, array) {
    array.push(value)
    return array
  }

  static prependToArray (value, array) {
    array.unshift(value)
    return array
  }

  static removeFromArray (value, array) {
    let index = array.indexOf(value)
    if (index !== -1) {
      array.splice(index, 1)
    }
    return array
  }

  static likePost (request, updateFunction) {
    request = Data.post(request.url, null, true)
    $.ajax(request)
      .done(() => updateFunction())
      .fail((err) => console.log(err))
  }

  static unlikePost (request, updateFunction) {
    request = Data.post(request.url, null, true)
    $.ajax(request)
      .done(() => updateFunction())
      .fail((err) => console.log(err))
  }
}
