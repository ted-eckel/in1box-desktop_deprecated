import { ipcRenderer } from 'electron'
import React, { Component } from 'react'
import InfiniteScroll from 'react-infinite-scroller'
import Masonry from 'react-masonry-component'
import CircularProgress from 'material-ui/CircularProgress'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import isEmpty from 'lodash/isEmpty'
import GmailListItem from './GmailListItem'
import DriveListItem from './DriveListItem'
import PocketListItem from './PocketListItem'
import FileListItem from './FileListItem'
import { fetchItems as fetchPocketItems } from '../actions/pocket'
import { requestFiles as driveFetchFiles } from '../actions/google/drive/file'
import { loadList as gmailLoadThreadList } from '../actions/google/gmail/thread'
import { loadAll as gmailLoadLabels } from '../actions/google/gmail/label'
import { listFiles as in1boxListFiles } from '../actions/files'
import {
  drawerOpenSelector,
  allAuthSelector,
  getAllItemsSelector,
  endOfListSelector,
  isFetchingSelector,
  searchQuerySelector,
  hasMoreThreadsSelector,
  driveHasMoreFilesSelector,
  pocketHasMoreItemsSelector,
  labelsSelector,
  moreFilesSelector
} from '../selectors'

const mapStateToProps = state => ({
  drawerOpen: drawerOpenSelector(state),
  allAuth: allAuthSelector(state),
  items: getAllItemsSelector(state),
  endOfList: endOfListSelector(state),
  isFetching: isFetchingSelector(state),
  searchQuery: searchQuerySelector(state),
  gmailHasMoreThreads: hasMoreThreadsSelector(state),
  pocketHasMoreItems: pocketHasMoreItemsSelector(state),
  driveHasMoreFiles: driveHasMoreFilesSelector(state),
  gmailLabels: labelsSelector(state),
  moreFiles: moreFilesSelector(state)
})

const mapDispatchToProps = dispatch => bindActionCreators({
  fetchPocketItems,
  driveFetchFiles,
  gmailLoadThreadList,
  gmailLoadLabels,
  in1boxListFiles
}, dispatch)

class Items extends Component {
  constructor(props) {
    super(props)
    this.state = { masonryWidth: null }
    this.handleLoadMore = this.handleLoadMore.bind(this)
  }

  componentWillMount() {
    this.updateDimensions()
  }

  componentDidMount() {
    window.addEventListener('resize', this.updateDimensions.bind(this))
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateDimensions.bind(this))
  }

  updateDimensions() {
    if (window.innerWidth >= 1547) {
      this.setState({ masonryWidth: '1280px' })
    } else if (window.innerWidth < 1547 && window.innerWidth >= 1291) {
      this.setState({ masonryWidth: '1024px' })
    } else if (window.innerWidth < 1291 && window.innerWidth >= 1035) {
      this.setState({ masonryWidth: '768px' })
    } else if (window.innerWidth < 1035 && window.innerWidth >= 779) {
      this.setState({ masonryWidth: '512px' })
    } else if (window.innerWidth < 779) {
      this.setState({ masonryWidth: '256px' })
    }
  }

  handleLoadMore() {
    const {
      allAuth, isFetching, driveFetchFiles, fetchPocketItems,
      searchQuery, gmailLoadThreadList, gmailHasMoreThreads,
      driveHasMoreFiles, gmailLabels, gmailLoadLabels, pocketHasMoreItems,
      in1boxListFiles, moreFiles
    } = this.props

    if (allAuth.all && !isFetching.any) {
      if (allAuth.gmail) {
        if (isEmpty(gmailLabels)) {
          gmailLoadLabels()
        }
        if (gmailHasMoreThreads) {
          gmailLoadThreadList(searchQuery)
        }
      }

      if (allAuth.drive && driveHasMoreFiles) {
        driveFetchFiles()
      }

      if (allAuth.pocket && pocketHasMoreItems) {
        fetchPocketItems()
      }

      if (allAuth.files && moreFiles) {
        ipcRenderer.send('mainConsoleLog', 'moreFiles:', moreFiles)
        in1boxListFiles()
      }
    }
  }

  render() {
    const items = this.props.items
    const drawerOpen = this.props.drawerOpen
    const endOfList = this.props.endOfList
    const allAuth = this.props.allAuth

    const drawerOpenStyles = {
      marginLeft: '256px',
      transition: 'margin-left 450ms cubic-bezier(0.23, 1, 0.32, 1) 0ms',
    }

    const drawerClosedStyles = {
      marginLeft: '0',
      transition: 'margin-left 450ms cubic-bezier(0.23, 1, 0.32, 1) 0ms',
    }

    const styles = {
      root: { width: this.state.masonryWidth, margin: '75px auto' }
    }

    const elementInfiniteLoad = (
      endOfList
      ? (
        <div style={{
          display: 'table',
          margin: '125px auto',
          fontFamily: 'Roboto, sans-serif',
          fontWeight: '400',
          fontSize: '18px',
          color: '#40555f'
        }}
        >
            End of your inbox!
          </div>
        )
      : (<CircularProgress size={80} thickness={6} style={{ display: 'block', margin: '300px auto 0' }} />)
    )

    if (
      allAuth.pocket === false &&
      allAuth.gmail === false &&
      allAuth.drive === false &&
      allAuth.files === false
    ) {
      return (
        <div style={{
          display: 'table',
          margin: '125px auto',
          fontFamily: 'Roboto, sans-serif',
          fontWeight: '400',
          fontSize: '20px',
          color: '#40555f'
        }}
        >
          Click a link in the sidebar to authorize a service
        </div>
      )
    } else if (!allAuth.all) {
      return (
        <div style={{ marginTop: '80px' }}>
          {elementInfiniteLoad}
        </div>
      )
    } else {
      const childElements = items.map((item, idx) => {
        if (item && item.service === 'pocket') {
          return (
            <div style={{ display: 'inline-block' }} key={`pocket-${item.id}`}>
              <PocketListItem item={item} />
            </div>
          )
        } else if (item && item.service === 'gmail') {
          return (
            <div style={{ display: 'inline-block' }} key={`gmail-${item.id}`}>
              <GmailListItem item={item} />
            </div>
          )
        } else if (item && item.service === 'drive') {
          return (
            <div style={{ display: 'inline-block' }} key={`drive-${item.id}`}>
              <DriveListItem item={item} />
            </div>
          )
        } else if (item && item.service === 'file') {
          return (
            <div style={{ display: 'inline-block' }} key={`file-${item.path}`}>
              <FileListItem item={item} />
            </div>
          )
        }
      })

      return (
        <div style={drawerOpen ? drawerOpenStyles : drawerClosedStyles}>
          <div style={styles.root}>
            <InfiniteScroll
              loader={elementInfiniteLoad}
              hasMore
              threshold={80}
              ref="masonryContainer"
              loadMore={this.handleLoadMore}
            >
              <Masonry>
                { childElements }
              </Masonry>
            </InfiniteScroll>
          </div>
        </div>
      )
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Items)
