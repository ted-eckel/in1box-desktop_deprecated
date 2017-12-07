import React, { Component } from 'react'
import Paper from 'material-ui/Paper'
import { shell } from 'electron'

export default class DriveListItem extends Component {
  constructor(props) {
    super(props)
    this.state = { iconUrl: `icons/${props.item.file.mimeType}.png` }

    this.onError = this.onError.bind(this)
  }

  onError() {
    this.setState({
      iconUrl: 'icons/drive.png'
    })
  }

  render() {
    const file = this.props.item.file
    const viewedFont = file.viewedByMe ? 'normal' : 'bold'

    return (
      <div style={{ margin: '8px' }} className="paper">
        <Paper style={{
          width: '240px',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}
        >
          <div
            style={{ textDecoration: 'none' }}
            target="_blank"
            className="item-link"
            onClick={() => shell.openExternal(file.webViewLink)}
          >
            <div style={{
              fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif',
              fontSize: '13px',
              padding: '12px 15px'
            }}
            >
              <div className="drive-title">
                <img src={this.state.iconUrl} onError={this.onError} style={{ verticalAlign: 'bottom' }} />
                <span
                  style={{ fontWeight: viewedFont }}
                  className="item-title highlight"
                >
                  { file.name }
                </span>
              </div>
            </div>
            <div style={{ maxHeight: '170px', overflow: 'hidden' }}>
              <img
                style={{ width: '240px', fontSize: '12px', color: 'darkgray' }}
                src={file.thumbnailLink}
              />
            </div>
          </div>
        </Paper>
      </div>
    )
  }
}
