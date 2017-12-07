// @flow
import React, { Component } from 'react'
import type { Children } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { ipcRenderer, remote } from 'electron'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import injectTapEventPlugin from 'react-tap-event-plugin'

const { initApp } = remote.require('./utils')

injectTapEventPlugin()

const mapDispatchToProps = dispatch => bindActionCreators({
  receiveDispatch: object => object
}, dispatch)

class App extends Component {
  props: {
    children: Children,
    receiveDispatch: ({}) => void
  };

  componentWillMount() {
    ipcRenderer.on('dispatch', (event, data) => {
      this.props.receiveDispatch(data)
    })

    initApp()
  }

  render() {
    return (
      <MuiThemeProvider>
        <div>
          {this.props.children}
        </div>
      </MuiThemeProvider>
    )
  }
}

export default connect(null, mapDispatchToProps)(App)
