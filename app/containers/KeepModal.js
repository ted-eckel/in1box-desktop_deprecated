import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import Dialog from 'material-ui/Dialog'
import Dropzone from 'react-dropzone'
import FlatButton from 'material-ui/FlatButton'
import Moment from 'moment'
import { keepModalOpenSelector, currentUserSelector } from '../selectors'
import { toggleKeepModal, setUploadFolderId } from '../actions/app'
import { uploadNotes } from '../actions/notes'

const mapStateToProps = state => ({
  keepModalOpen: keepModalOpenSelector(state),
  currentUser: currentUserSelector(state),
})

const mapDispatchToProps = dispatch => bindActionCreators({
  toggleKeepModal,
  setUploadFolderId,
  uploadNotes,
}, dispatch)

class KeepModal extends Component {
  // constructor(props) {
  //   super(props)
  // }

  processFiles(innerHtmlArray, uploadsFolderId) {
    const { uploadNotes, currentUser } = this.props
    const notesArray = []
    const attachmentArray = []

    innerHtmlArray.forEach((innerHtml, idx) => {
      console.log(`note ${idx}`)
      const noteObject = {}
      const el = document.createElement('html')
      el.innerHTML = innerHtml

      const bullets = el.getElementsByClassName('bullet')
      if (bullets) {
        while (bullets.length > 0) {
          bullets[0].parentNode.removeChild(bullets[0])
        }
      }

      const title = el.getElementsByClassName('title')[0]
      if (title) { noteObject.title = title.innerText }

      noteObject.content = el.getElementsByClassName('content')[0].innerHTML

      const color = el.getElementsByClassName('note')[0].className.split(' ')[1]
      if (color) { noteObject.color = color }

      const heading = el.getElementsByClassName('heading')[0].innerText.trim()
      noteObject.created_at = Moment(heading, 'MMM D, YYYY h:mm:ss A').format()

      const archived = el.getElementsByClassName('archived')[0]
      if (archived) {
        noteObject.state = 'ARCHIVE'
      }

      const labels = el.getElementsByClassName('label')
      if (labels[0]) {
        // let labelArr = [];
        let labelString = `${currentUser.id}`
        for (let labelIdx = 0; labelIdx < labels.length; labelIdx += 1) {
          // labelArr.push({
          //   name: labels[labelIdx].innerText.trim(),
          //   user_id: currentUser.id
          // })
          labelString += `-------314159265358979323846${labels[labelIdx].innerText}`
          // if (labels.length) {
          //   labelString += `, ${labels[labelIdx].innerText}`
          // } else {
          //   labelString += `${labels[labelIdx].innerText}`
          // }
        }
        // noteObject.all_tags = labelArr;
        noteObject.all_tags = labelString
      }

      noteObject.user_id = currentUser.id

      console.log('noteObject:')
      console.log(noteObject)
      notesArray.push(noteObject)


      const attachments = el.getElementsByClassName('attachments')[0]
      if (attachments) {
        const liArray = attachments.children[0].children
        for (let i = 0; i < liArray.length; i += 1) {
          const attachment = liArray[i].children[0]
          let type
          let base64Data
          if (attachment.tagName === 'A') {
            type = attachment.href.match(/data:(.*);base64,/)[1] || 'application/octet-stream'
            base64Data = attachment.href.replace(/^data:audio\/3gpp;base64,/, '')
          }

          if (attachment.tagName === 'IMG') {
            type = attachment.src.match(/data:(.*);base64,/)[1] || 'application/octet-stream'
            base64Data = attachment.src.replace(/^data:image\/(png|jpg|jpeg);base64,/, '')
          }

          attachmentArray.push({
            noteArrayIdx: idx,
            contentType: type,
            metadata: {
              name: `${noteObject.title ? noteObject.title : noteObject.created_at}_${i}`,
              mimeType: type,
              parents: [uploadsFolderId],
            },
            base64Data
          })
        }
      }
    })

    if (attachmentArray.length) {
      this.uploadKeepAttachments(attachmentArray, notesArray)
    } else {
      uploadNotes(notesArray)
    }
  }

  uploadKeepAttachments(attachmentArray, notesArray) {
    const { uploadNotes } = this.props

    const boundary = '-------314159265358979323846'
    const delimiter = '\r\n--' + boundary + '\r\n'
    const close_delim = '\r\n--' + boundary + '--'

    let returnedRequests = 0
    let i = 0
    const timeout = () => {
      setTimeout(() => {
        const el = attachmentArray[i]

        const multipartRequestBody =
        delimiter +
        'Content-Type: application/json\r\n\r\n' +
        JSON.stringify(el.metadata) +
        delimiter +
        'Content-Type: ' + el.contentType + '\r\n' +
        'Content-Transfer-Encoding: base64\r\n' +
        '\r\n' +
        el.base64Data +
        close_delim

        /* return */window.gapi.client.request({
          path: '/upload/drive/v3/files',
          method: 'POST',
          params: { uploadType: 'multipart' },
          headers: {
            'Content-Type': 'multipart/mixed; boundary="' + boundary + '"'
          },
          body: multipartRequestBody
        }).then(response => {
          console.log('response:')
          console.log(response)
          if (notesArray[el.noteArrayIdx].drive_attachment_ids) {
            notesArray[el.noteArrayIdx].drive_attachment_ids += (' ' + response.result.id)
          } else {
            notesArray[el.noteArrayIdx].drive_attachment_ids = (response.result.id)
          }
          console.log('notesArray:')
          console.log(notesArray)

          returnedRequests += 1
          console.log(`returnedRequests: ${returnedRequests}`)
          if (returnedRequests === attachmentArray.length) {
            console.log('hits if block')
            uploadNotes(notesArray)
          }
        }, error => { console.log(error) })

        i += 1

        timeout()
      }, 5000)
    }

    timeout()
  }

  createUploadsFolder() {
    return window.gapi.client.drive.files.create({
      resource: {
        name: 'in1box uploads',
        mimeType: 'application/vnd.google-apps.folder'
      }
    })
  }

  onDrop(acceptedFiles, rejectedFiles) {
    const { setUploadFolderId, currentUser } = this.props
    const innerHtmlArray = []
    console.log(`acceptedFiles.length => ${acceptedFiles.length}`)
    console.log(`rejectedFiles.length => ${rejectedFiles.length}`)
    console.log('currentUser:')
    console.log(currentUser)

    acceptedFiles.forEach((file, idx) => {
      console.log(idx)
      const reader = new FileReader()

      reader.onload = () => {
        innerHtmlArray.push(reader.result)

        if (idx === acceptedFiles.length - 1) {
          if (currentUser.settings.drive_uploads_folder_id) {
            // TODO: check to see if this exists
            this.processFiles(innerHtmlArray, currentUser.settings.drive_uploads_folder_id)
          } else {
            this.createUploadsFolder().then(response => {
              console.log(response)
              setUploadFolderId(response.result.id)
              this.processFiles(innerHtmlArray, response.result.id)
            })
          }
        }
      }

      reader.readAsText(file)
    })
  }

  render() {
    const keepModalActions = [
      <FlatButton
        label="Close"
        style={{ color: '#202020' }}
        onTouchTap={this.props.toggleKeepModal}
      />
    ]

    return (
      <Dialog
        title="Upload Google Keep Notes"
        actions={keepModalActions}
        modal={false}
        open={this.props.keepModalOpen}
        onRequestClose={this.props.toggleKeepModal}
      >
        <Dropzone
          accept="text/html"
          onDrop={this.onDrop.bind(this)}
          style={{
            borderStyle: 'solid',
            height: '200px',
            borderWidth: '2px',
            borderColor: 'rgb(102, 102, 102)',
            borderRadius: '5px'
          }}
        >
          <p style={{ textAlign: 'center', position: 'relative', top: '48%' }}>
            Try dropping some exported Google Keep notes here,
            or click to select which html files to upload.
          </p>
        </Dropzone>
        <div style={{ marginTop: '10px' }}>
          <a
            style={{ textDecoration: 'underline' }}
            href="https://takeout.google.com/settings/takeout"
          >
            Click here
          </a>
          {' '}
          to download your Google Keep notes. Click &apos;Select none&apos;,
          then check &apos;Keep&apos;, hit &apos;Next&apos;, then click &apos;Create archive&apos;.
          When it&apos;s done, extract the zip, go into the folder called &apos;Keep&apos;,
          and select as many notes as you wish to upload. Then drag them here!
        </div>
      </Dialog>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(KeepModal)
