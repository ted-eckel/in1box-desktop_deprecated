import React, { Component } from 'react'
import Dialog from 'material-ui/Dialog'
import FlatButton from 'material-ui/FlatButton'
import TextField from 'material-ui/TextField'
import MuiDrawer from 'material-ui/Drawer'
import MenuItem from 'material-ui/MenuItem'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { toggleDrawer, togglePocketAuthModal } from '../actions/app'
import { initPocket } from '../actions/pocket'
import {
  drawerOpenSelector,
  allAuthSelector,
} from '../selectors'

const mapStateToProps = state => ({
  drawerOpen: drawerOpenSelector(state),
  allAuth: allAuthSelector(state),
  pocketAuthModalOpen: state.app.pocketAuthModalOpen,
})

const mapDispatchToProps = dispatch => bindActionCreators({
  toggleDrawer,
  initPocket,
  togglePocketAuthModal,
}, dispatch)

class Drawer extends Component {
  constructor(props) {
    super(props)

    this.state = {
      value: '',
    }
  }

  handleDrawerClose = () => {
    this.props.toggleDrawer()
  }

  onPocketAuthClick = () => {
    this.props.togglePocketAuthModal()
  }

  onGmailAuthClick = () => {
    this.handleDrawerClose()
  }

  onDriveAuthClick = () => {
    this.handleDrawerClose()
  }

  handlePocketAuthClose = () => {
    this.props.togglePocketAuthModal()
  }


  handlePocketAuthTextChange = event => {
    this.setState({
      value: event.target.value,
    })
  }

  onPocketConsumerKeySubmit = () => {
    this.handleDrawerClose()
    this.handlePocketAuthClose()
    this.props.initPocket(this.state.value)
  }

  render() {
    console.log(`this.state.value: ${this.state.value}`)
    const actions = [
      <FlatButton
        label="Cancel"
        primary
        onClick={this.handlePocketAuthClose}
      />,
      <FlatButton
        label="Submit"
        primary
        keyboardFocused
        onClick={this.onPocketConsumerKeySubmit}
      />,
    ]

    return (
      <div>
        <MuiDrawer
          open={this.props.drawerOpen}
          docked
          onRequestChange={this.handleDrawerClose}
          containerStyle={{ zIndex: 1, backgroundColor: 'transparent', boxShadow: 'none' }}
          overlayStyle={{ display: 'none' }}
          style={{}}
        >
          <br />
          <br />
          <br />
          <br />
          <br />
          {
            this.props.allAuth.pocket !== false
            ? null
            : (
              <MenuItem onClick={this.onPocketAuthClick}>
                <span>Connect to Pocket</span>
                {/* <a href="auth/pocket">
                Connect to Pocket
              </a> */}
              </MenuItem>
            )
          }
          {
            this.props.allAuth.gmail !== false
            ? null
            : (<MenuItem onClick={this.handleDrawerClose}>Connect to Gmail</MenuItem>)
          }
          {
            this.props.allAuth.drive !== false
            ? null
            : (<MenuItem onClick={this.handleDrawerClose}>Connect to Google Drive</MenuItem>)
          }
          {
            this.props.allAuth.gmail &&
            this.props.allAuth.drive &&
            this.props.allAuth.pocket
            ? (
              <div>
                <span style={{ border: '10px',
                  boxSizing: 'border-box',
                  display: 'block',
                  cursor: 'default',
                  margin: '0px',
                  padding: '0px',
                  outline: 'none',
                  lineHeight: '48px',
                  position: 'relative',
                  minHeight: '48px',
                  whiteSpace: 'nowrap' }}
                >
                  <div>
                    <span style={{ height: '100%',
                      width: '100%',
                      position: 'absolute',
                      top: '0px',
                      left: '0px',
                      overflow: 'hidden',
                      pointerEvents: 'none' }}
                    />
                    <div style={{ marginLeft: '0px', padding: '0px 16px', position: 'relative' }}>
                      All possible services connected!
                    </div>
                  </div>
                </span>
              </div>
          )
          : null
        }
        </MuiDrawer>
        <Dialog
          title="Dialog With Actions"
          actions={actions}
          modal={false}
          open={this.props.pocketAuthModalOpen}
          onRequestClose={this.handlePocketAuthClose}
        >
          <TextField
            style={{ width: '400px'}}
            value={this.state.value}
            hintText="Paste your Pocket consumer key here!"
            onChange={this.handlePocketAuthTextChange}
          />
        </Dialog>
      </div>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Drawer)
