// @flow
import React, { Component, /* PropTypes */ } from 'react'
import Bar from './Bar'
import Drawer from './Drawer'
import Items from './Items'
import CreateNoteModal from './CreateNoteModal'
import FAB from './FAB'


export default class HomePage extends Component {
  render() {
    return (
      <div>
        <Drawer />
        <Bar />
        <Items />
        <FAB />
        <CreateNoteModal />
      </div>
    )
  }
}
