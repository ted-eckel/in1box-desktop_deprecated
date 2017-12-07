import React, { Component } from 'react'
import AppBar from 'material-ui/AppBar'
import IconButton from 'material-ui/IconButton'
// import FlatButton from 'material-ui/FlatButton'
import Menu from 'material-ui/svg-icons/navigation/menu'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { toggleDrawer } from '../actions/app'

const mapDispatchToProps = dispatch => bindActionCreators({
  toggleDrawer,
}, dispatch)

class Bar extends Component {
  render() {
    return (
      <AppBar
        title="in1box"
        style={{
          backgroundColor: '#546E7A',
          zIndex: 2,
          position: 'fixed',
          top: 0
        }}
        iconElementLeft={
          <IconButton
            onClick={this.props.toggleDrawer}
          >
            <Menu />
          </IconButton>
        }
        iconElementRight={
          <div>
            <img
              className="tooltip--bottom toolbar-button"
              style={{
                width: '27px',
                display: 'inline-block',
                paddingTop: '10px',
                marginRight: '15px'
              }}
              src="icons/gridview.svg"
              alt="Grid View"
            />
            {/* <FlatButton
              style={{ bottom: '10px', color: '#fff' }}
              label="Logout"
              onClick={() => console.log('used to be logout')}
            /> */}
          </div>
        }
      />
    )
  }
}

export default connect(null, mapDispatchToProps)(Bar)
