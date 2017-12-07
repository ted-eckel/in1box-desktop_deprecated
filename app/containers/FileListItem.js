import React, { Component, PropTypes } from 'react'
import { EditorState, convertFromRaw } from 'draft-js'
import Autosuggest from 'react-autosuggest'
import TagsInput from 'react-tagsinput'
import Paper from 'material-ui/Paper'
import IconMenu from 'material-ui/IconMenu'
import IconButton from 'material-ui/IconButton'
import ActionDone from 'material-ui/svg-icons/action/done'
import ActionLabel from 'material-ui/svg-icons/action/label'
import ActionDelete from 'material-ui/svg-icons/action/delete'
import ImagePalette from 'material-ui/svg-icons/image/palette'
import ReactTooltip from 'react-tooltip'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import difference from 'lodash/difference'
import BasicEditor from './BasicEditor'
import { trashFiles, archiveFiles } from '../actions/files'
import { updateNote, openNote, updateNoteMeta, archiveNote, trashNote } from '../actions/notes'
import { createdNoteSelector, allTagsSelector } from '../selectors'
import { htmlConvert } from '../utils/note'

const mapStateToProps = state => ({
  createdNoteState: createdNoteSelector(state),
  // makes the item invisible when selected, along with const name and const visibilityFunc
  allTags: allTagsSelector(state),
  // should return an object with tags by ID and gmail labels by ID
  // tagsByID: state.settings.tagsByID,
  // this might be redundant if you're already getting all of the tags...
})

const mapDispatchToProps = dispatch => bindActionCreators({
  trashFiles, /* should take an array of filePaths, currently only dispatches */
  archiveFiles, /* should take an array of filePaths, currently only dispatches */
  updateNote, /* takes (note, dir, meta) */
  openNote,
  updateNoteMeta,
  archiveNote,
  trashNote
  // replaces toggleCreateNoteModal. That gets dispatched once the file is read
}, dispatch)

class FileListItem extends Component {
  static propTypes = {
    item: PropTypes.object.isRequired,
  }

  constructor(props) {
    super(props)
    this.state = {
      tags: (
        (props.item.meta && props.item.meta.tagIDs) ?
        props.item.meta.tagIDs.map(tagID => props.allTags[tagID]) :
        []
      ), // what you have to figure out is whether on a selected suggestion,
      // it will give the whole tag, or just the name... ideally it'll be a whole tag object
      color: props.item.meta.color || 'DEFAULT',
      open: false,
      colorMenuOpen: false,
    }

    this.handleChange = this.handleChange.bind(this)
    this.deleteTag = this.deleteTag.bind(this)
    this.changeTags = this.changeTags.bind(this)
    this.handleColorChange = this.handleColorChange.bind(this)
  }

  componentWillReceiveProps(nextProps) {
    if (this.props !== nextProps) {
      this.setState({
        tags: (
          nextProps.item.meta.tagIDs ?
          nextProps.item.meta.tagIDs.map(tagID => this.props.allTags[tagID]) :
          []
        ),
        color: nextProps.item.meta.color,
      })
    }
  }

  trash = () => {
    // this.props.trashFiles([this.props.item.path])
    this.props.trashNote(
      { name: this.props.item.name, folder: this.props.item.folder },
      this.props.item.meta,
      this.props.item.path
    )
  }

  archive = () => {
    // this.props.archiveFiles([{
    //   folder: this.props.item.folder,
    //   name: this.props.item.name
    // }])
    this.props.archiveNote(
      { name: this.props.item.name, folder: this.props.item.folder },
      { state: 'ARCHIVE' },
      this.props.item.path
    )
  }

  // maybe trash and archive should be functions that take an array of items,
  // with servies, like [{ id: fjdskalfjdsaf, service: drive}, {id: /Users... /, service: in1box}]
  // the only states should be INBOX and ARCHIVE. That way if a note is trashed,
  // when you put it back, it'll put it back in the right place

  handleChange(tags) {
    this.setState({ tags })
  }

  // what are these for?

  handleColorChange(color) {
    this.setState({ color })
    this.props.updateNoteMeta(
      { name: this.props.item.name, folder: this.props.item.folder },
      { color }
    )
  }

  changeTags() {
    const meta = { ...this.props.item.meta, tagIDs: [] } || { tagIDs: [], state: 'INBOX' }
    const newTags = []
    this.state.tags.forEach(tag => (typeof tag === 'object' ? (meta.tagIDs.push(tag.id)) : newTags.push(tag)))
    this.props.updateNoteMeta(
      { name: this.props.item.name, folder: this.props.item.folder },
      meta,
      newTags
    )
  }

  deleteTag(key) {
    const newTags = this.state.tags
    newTags.splice(key, 1)
    // this.setState({ tags: newTags })
    const newIDs = newTags.map(tag => tag.id)
    const meta = this.props.item.meta
    meta.tagIDs = newIDs
    this.props.updateNoteMeta(
      { name: this.props.item.name, folder: this.props.item.folder },
      meta
    )
  }

  render() {
    const item = this.props.item

    const colorObject = {
      DEFAULT: '#fff ',
      RED: 'rgb(255, 109, 63)',
      ORANGE: 'rgb(255, 155, 0)',
      YELLOW: 'rgb(255, 218, 0)',
      GREEN: 'rgb(149, 214, 65)',
      TEAL: 'rgb(28, 232, 181)',
      BLUE: 'rgb(63, 195, 255)',
      GRAY: 'rgb(184, 196, 201)',
    }

    const colorHex = (color = 'DEFAULT') => colorObject[color]

    const colorCheckMark = color => {
      if (this.state.color) {
        if (this.state.color === color) {
          return (
            <ActionDone />
          )
        } else if (this.state.color === 'DEFAULT' && color === 'WHITE') {
          return (
            <ActionDone />
          )
        }
      } else if (color === 'WHITE') {
        return (
          <ActionDone />
        )
      } else {
        return null
      }
    }

    const colorDataTip = color => {
      if (color) {
        if (color === 'DEFAULT') {
          return 'white'
        }
        return color.toLowerCase()
      }
      return null
    }

    const toggleCreateNoteModal = () => {
      this.props.openNote(item)
    }

    const name = () => {
      if (this.props.createdNoteState.path === item.path) {
        return 'paper-selected'
      }
      return 'paper'
    }
    // makes the item invisible when selected, along with const visibilityFunc

    const visibilityFunc = () => {
      if (this.props.createdNoteState.path === item.path) {
        return 'hidden'
      }
      return 'visible'
    }
    // makes the item invisible when selected, along with const name

    const colorButtons = Object.keys(colorObject).map(color => (
      <Paper
        circle
        key={`${item.path}-${color}-ITEM`}
        data-tip={colorDataTip(color)}
        onClick={() => this.handleColorChange(color)}
        style={{
          backgroundColor: colorHex(color),
          height: '25px',
          width: '25px',
          display: 'inline-block',
          margin: '3px',
          cursor: 'pointer',
          verticalAlign: 'top'
        }}>
        {colorCheckMark(color)}
      </Paper>
    ))

    const defaultRenderTag = props => {
      let { tag, key, disabled, onRemove, classNameRemove, getTagDisplayValue, ...other } = props

      return (
        <span key={key} {...other}>
          <span style={{
            whiteSpace: 'nowrap',
            maxWidth: '130px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: 'inline-block',
            verticalAlign: 'top'
          }}>
            {getTagDisplayValue(typeof tag === 'object' ? tag.name : tag)}
          </span>
          {!disabled &&
            <a
              className={classNameRemove}
              onClick={
                () => {
                  onRemove(key)
                  this.deleteTag(key)
                }
              }
            />
          }
        </span>
      )
    }

    const allTags = this.props.allTags

    function autocompleteRenderInput({ addTag, ...props }) {
      const handleOnChange = (e, { newValue, method }) => {
        if (method === 'enter') {
          e.preventDefault()
        } else {
          props.onChange(e)
        }
      }

      const inputValue = (props.value && props.value.trim().toLowerCase()) || ''
      const inputLength = inputValue.length

      const suggestions = Object.keys(allTags)
      .map(id => allTags[id]).sort((a, b) => a.path - b.path)
      .filter(tag => tag.name.toLowerCase().slice(0, inputLength) === inputValue)

      return (
        <Autosuggest
          ref={props.ref}
          suggestions={suggestions}
          alwaysRenderSuggestions
          getSuggestionValue={suggestion => suggestion.name}
          renderSuggestion={suggestion => <span>{suggestion.path}</span>}
          inputProps={{ ...props, onChange: handleOnChange }}
          onSuggestionSelected={(e, { suggestion }) => {
            addTag(suggestion)
          }}
          onSuggestionsClearRequested={() => {}}
          onSuggestionsFetchRequested={() => {}}
        />
      )
    }

    const handleCloseMenu = (open, reason) => {
      if (open) {
        this.setState({ open: true })
      } else {
        this.setState({ open: false })
        const stateTags = this.state.tags
        const propTags = (
          item.meta.tagIDs ?
          item.meta.tagIDs.map(tagID => this.props.allTags[tagID]) :
          []
        )
        const theDifference = difference(stateTags, propTags)
        if (theDifference.length) {
          this.changeTags()
        }
      }
    }

    const handleCloseColorMenu = (open, reason) => {
      if (open) {
        this.setState({ colorMenuOpen: true })
      } else {
        this.setState({ colorMenuOpen: false })
      }
    }

    const defaultRenderLayout = (tagComponents, inputComponent) => {
      const archive = this.archive
      const deleteFunc = this.trash
      return (
        <div>
          {tagComponents}
          <div className="item-toolbar" style={{ padding: '0 15px' }}>
            <IconMenu
              onRequestChange={(open, reason) => handleCloseColorMenu(open, reason)}
              open={this.state.colorMenuOpen}
              iconButtonElement={
                <IconButton>
                  <ImagePalette data-tip="change color" className='item-toolbar-button' />
                </IconButton>
              }
              autoWidth={false}
              menuStyle={{ width: '174px', height: '115px' }}>
              <div style={{ width: '124px', margin: '0 25px' }}>
                {colorButtons}
              </div>
              <ReactTooltip place="bottom" type="dark" effect="solid" />
            </IconMenu>
            <IconMenu
              onRequestChange={(open, reason) => handleCloseMenu(open, reason)}
              open={this.state.open}
              iconButtonElement={
                <IconButton>
                  <ActionLabel
                    data-tip={this.state.tags.length ? 'change tags' : 'add tags'}
                    className="item-toolbar-button"
                  />
                </IconButton>
              }
              autoWidth={false}
              menuStyle={{ width: '200px' }}>
              {inputComponent}
            </IconMenu>
            <IconButton onTouchTap={archive}>
              <ActionDone data-tip="archive" className="item-toolbar-button" />
            </IconButton>
            <IconButton onTouchTap={deleteFunc}>
              <ActionDelete data-tip="trash" className="item-toolbar-button" />
            </IconButton>
          </div>
        </div>
      )
    }

    const editorState = EditorState.createWithContent(
      convertFromRaw(
        ((item.meta && item.meta.content) ? htmlConvert(item.meta.content) : htmlConvert(''))
      )
    )

    const colorState = this.state.color

    const title = (item.meta && item.meta.title) ? (
      item.meta.title
    ) : (
      (item.name.slice(-5) === '.html') ? item.name.slice(0, -5) : item.name
    )

    return (
      <div style={{ margin: '8px', visibility: visibilityFunc() }} className={name()}>
        <Paper style={{ width: '240px', padding: '12px 0', backgroundColor: colorHex(colorState) }}>
          <div style={{ cursor: 'default' }} onClick={toggleCreateNoteModal}>
            <div style={{
              display: 'inline-block',
              fontFamily: "'Roboto Condensed',arial,sans-serif",
              fontSize: '17px',
              fontWeight: 'bold',
              lineHeight: '23px',
              minHeight: '27px',
              padding: '2px 15px 0'
            }}>
              {title}
            </div>
            <div style={{
              fontFamily: "'Roboto Slab','Times New Roman',serif",
              padding: '0 15px 15px',
              minHeight: '48px',
              maxHeight: '369px',
              fontSize: '14px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              lineHeight: '19px'}}>
              <BasicEditor editorState={editorState} readOnly />
            </div>
          </div>
          <TagsInput
            onlyUnique
            renderInput={autocompleteRenderInput}
            value={this.state.tags}
            onChange={this.handleChange}
            renderLayout={defaultRenderLayout}
            renderTag={defaultRenderTag}
          />
          <ReactTooltip place="bottom" type="dark" effect="solid" />
        </Paper>
      </div>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(FileListItem)
