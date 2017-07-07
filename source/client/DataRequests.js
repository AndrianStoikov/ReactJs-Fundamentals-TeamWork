import Auth from './components/Auth'

class DataRequests {
  static post (url, data, authenticated) {
    let headers = {'Content-Type': 'application/json'}

    if (authenticated) {
      headers.Authorization = `bearer ${Auth.getToken()}`
    }

    return {
      url: url,
      method: 'POST',
      data: JSON.stringify(data),
      mode: 'cors',
      headers: headers
    }
  }

  static get (url, authenticated) {
    let headers = {contentType: 'application/json'}

    if (authenticated) {
      headers.Authorization = `bearer ${Auth.getToken()}`
    }

    return {
      url: url,
      method: 'GET',
      mode: 'cors',
      headers: headers
    }
  }
}

export default DataRequests
