import alt from '../alt'
import Auth from '../components/Auth'
import toastr from 'toastr'

class ProfilePictureAddActions {
  constructor () {
    this.generateActions(
      'handleContentChange',
      'contentValidationFail',
      'addProfilePictureSuccess',
      'addProfilePictureFail'
    )
  }

  addProfilePicture (data) {
    let formData = new FormData()
    formData.append('image', data.image)
    let request = {
      url: `/api/user/profile-picture/${data.userId}`,
      method: 'POST',
      data: formData,
      mode: 'cors',
      contentType: false,
      processData: false,
      dataType: 'json',
      headers: {
        'Authorization': `bearer ${Auth.getToken()}`
      }
    }
    $.ajax(request)
      .done((data) => {
        toastr.success('Enjoy your new profile picture')
        this.addProfilePictureSuccess(data)
      })
      .fail((err) => {
        console.log(err)
        this.addProfilePictureFail(err)
      })

    return true
  }
}

export default alt.createActions(ProfilePictureAddActions)
