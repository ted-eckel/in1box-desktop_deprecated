import React, { Component } from 'react'
import ReactTooltip from 'react-tooltip'
import Dialog from 'material-ui/Dialog'
import FlatButton from 'material-ui/FlatButton'
import IconMenu from 'material-ui/IconMenu'
import IconButton from 'material-ui/IconButton'
import ActionLabel from 'material-ui/svg-icons/action/label'
import ActionDone from 'material-ui/svg-icons/action/done'
import ActionDelete from 'material-ui/svg-icons/action/delete'
import ImagePalette from 'material-ui/svg-icons/image/palette'
import Paper from 'material-ui/Paper'
import {
  Editor,
  EditorState,
  DefaultDraftBlockRenderMap,
  EditorBlock,
  RichUtils,
  convertFromRaw,
} from 'draft-js'
import TagsInput from 'react-tagsinput'
import Autosuggest from 'react-autosuggest'
import { Map } from 'immutable'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { htmlConvert, contentConvert } from '../utils/note'
import {
  createNoteModalOpenSelector,
  createdNoteSelector,
  allTagsSelector,
} from '../selectors'
import { createNote, updateNote, archiveNote, trashNote } from '../actions/notes'
import { trashFiles, archiveFiles } from '../actions/files'
import { toggleCreateNoteModal } from '../actions/app'

const TODO_TYPE = 'todo'

const mapStateToProps = state => ({
  createNoteModalOpen: createNoteModalOpenSelector(state),
  createdNoteState: createdNoteSelector(state),
  path: state.paths,
  allTags: allTagsSelector(state),
})

const mapDispatchToProps = dispatch => bindActionCreators({
  createNote,
  updateNote,
  trashFiles,
  archiveFiles,
  toggleCreateNoteModal,
  archiveNote,
  trashNote
}, dispatch)

class CreateNoteModal extends Component {
  constructor(props) {
    super(props)

    this.state = {
      title: (props.createdNoteState.meta.title ?
        props.createdNoteState.meta.title :
        (props.createdNoteState.name.slice(-5) === '.html' ?
        props.createdNoteState.name.slice(0, -5) :
        props.createdNoteState.name)
      ),
      editorState: EditorState.createWithContent(
        convertFromRaw(props.createdNoteState.content)
      ),
      color: props.createdNoteState.meta.color,
      tags: (
        (props.createdNoteState.meta && props.createdNoteState.meta.tagIDs) ?
        props.createdNoteState.meta.tagIDs.map(tagID => props.allTags[tagID]) :
        []
      ),
      open: false,
      colorMenuOpen: false,
    }

    this.blockRenderMap = Map({
      [TODO_TYPE]: {
        element: 'div',
      }
    }).merge(DefaultDraftBlockRenderMap)

    this.onChange = (editorState) => {
      this.setState({ editorState })
    }

    this.getEditorState = () => this.state.editorState

    this.blockRendererFn = getBlockRendererFn(this.getEditorState, this.onChange)

    this.handleBeforeInput = this.handleBeforeInput.bind(this)
    this.handleKeyCommand = this.handleKeyCommand.bind(this)
    this.focus = this.focus.bind(this)

    this.updateTitleState = this.updateTitleState.bind(this)
    this.createNote = this.createNote.bind(this)
    this.disabledButton = this.disabledButton.bind(this)

    this.handleChange = this.handleChange.bind(this)

    this.handleColorChange = this.handleColorChange.bind(this)
    this.trash = this.trash.bind(this)
    this.archive = this.archive.bind(this)
  }

  handleChange(tags) {
    this.setState({ tags })
  }

  updateTitleState(event) {
    this.setState({ title: event.target.value })
  }

  createNote() {
    const name = this.props.createdNoteState.name ? this.props.createdNoteState.name : null
    const path = this.props.path
    const tagIDs = []
    const newTags = []
    this.state.tags.forEach(tag => (typeof tag === 'object' ? (tagIDs.push(tag.id)) : newTags.push(tag)))
    const noteObject = {
      title: this.state.title,
      content: contentConvert(this.state.editorState.getCurrentContent()),
      name
    }

    const metaObject = {
      title: this.state.title,
      color: this.state.color,
      tagIDs,
      content: contentConvert(this.state.editorState.getCurrentContent()),
      state: 'INBOX',
    }

    this.props.createNote(noteObject, metaObject, path.DEFAULT_NOTES_DIR, newTags)
    this.props.toggleCreateNoteModal()
  }

  focus() {
    this.refs.editor.focus()
  }

  handleBeforeInput(str) {
    if (str !== ']') {
      return false
    }
    const { editorState } = this.state
    /* Get the selection */
    const selection = editorState.getSelection()

    /* Get the current block */
    const currentBlock = editorState.getCurrentContent()
      .getBlockForKey(selection.getStartKey())
    const blockType = currentBlock.getType()
    const blockLength = currentBlock.getLength()
    if (blockLength === 1 && currentBlock.getText() === '[') {
      this.onChange(resetBlockType(editorState, blockType !== TODO_TYPE ? TODO_TYPE : 'unstyled'))
      return true
    }
    return false
  }

  handleKeyCommand(command) {
    const { editorState } = this.state
    const newState = RichUtils.handleKeyCommand(editorState, command)
    if (newState) {
      this.onChange(newState)
      return true
    }
    return false
  }

  disabledButton() {
    let title = this.props.createdNoteState.title
    let content = this.props.createdNoteState.content

    if (title === '' &&  content === htmlConvert('')) {
      return true
    } else if (title === '' && content === htmlConvert('<p></p>')) {
      return true
    } else if (title === '' && content === htmlConvert('<div class="listitem"></div>')) {
      return true
    } else if (title === '' && content === htmlConvert('<div class="listitem checked"></div>')) {
      return true
    }
    return false
  }

  blockStyleFn(block) {
    switch (block.getType()) {
      case TODO_TYPE:
        return 'block block-todo'
      default:
        return 'block'
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.createdNoteState !== nextProps.createdNoteState) {
      this.setState({
        title: (nextProps.createdNoteState.meta.title ?
          nextProps.createdNoteState.meta.title :
          (nextProps.createdNoteState.name.slice(-5) === '.html' ?
          nextProps.createdNoteState.name.slice(0, -5) :
          nextProps.createdNoteState.name)
        ),
        editorState: EditorState.createWithContent(
          convertFromRaw(nextProps.createdNoteState.content)
        ),
        color: nextProps.createdNoteState.meta ? nextProps.createdNoteState.meta.color : 'DEFAULT',
        tags: (
          nextProps.createdNoteState.meta.tagIDs ?
          nextProps.createdNoteState.meta.tagIDs.map(tagID => this.props.allTags[tagID]) :
          []
          // nextProps.createdNoteState.meta ? nextProps.createdNoteState.meta.tags : []
        ),
      })
    }
  }

  trash() {
    // this.props.trashFiles(id)
    this.props.trashNote(
      { name: this.props.createdNoteState.name, folder: this.props.createdNoteState.folder },
      this.props.createdNoteState.meta,
      this.props.createdNoteState.path
    )
    this.props.toggleCreateNoteModal()
  }

  archive() {
    // this.props.archiveFiles(id)
    this.props.archiveNote(
      { name: this.props.createdNoteState.name, folder: this.props.createdNoteState.folder },
      this.props.createdNoteState.meta,
      this.props.createdNoteState.path
    )
    this.props.toggleCreateNoteModal()
  }

  handleColorChange(color) {
    this.setState({ color })
  }

  render() {
    const item = this.props.createdNoteState
    const colorArray = ['DEFAULT', 'RED', 'ORANGE', 'YELLOW', 'GRAY', 'BLUE', 'TEAL', 'GREEN']

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

    const colorDataTip = (color) => {
      if (color) {
        if (color === 'DEFAULT') {
          return 'white'
        }
        return color.toLowerCase()
      }
      return null
    }

    const colorHex = (color) => {
      if (color) {
        switch (color) {
          case 'DEFAULT':
            return '#fff'
          case 'RED':
            return 'rgb(255, 109, 63)'
          case 'ORANGE':
            return 'rgb(255, 155, 0)'
          case 'YELLOW':
            return 'rgb(255, 218, 0)'
          case 'GREEN':
            return 'rgb(149, 214, 65)'
          case 'TEAL':
            return 'rgb(28, 232, 181)'
          case 'BLUE':
            return 'rgb(63, 195, 255)'
          case 'GRAY':
            return 'rgb(184, 196, 201)'
          default:
            return '#fff'
        }
      } else {
        return '#fff'
      }
    }

    const colorButtons = colorArray.map(color => (
      <Paper
        circle
        key={`${item.id}-${color}-DIALOG`}
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
        }}
      >
        {colorCheckMark(color)}
      </Paper>
    ))

    const handleCloseColorMenu = (open, reason) => {
      if (open) {
        this.setState({ colorMenuOpen: true })
      } else {
        this.setState({ colorMenuOpen: false })
      }
    }

    const allTags = this.props.allTags

    const defaultRenderTag = props => {
      let {tag, key, disabled, onRemove, classNameRemove, getTagDisplayValue, ...other} = props
      return (
        <span key={key} {...other}>
          <span style={{ whiteSpace: 'nowrap',
            maxWidth: '130px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: 'inline-block',
            verticalAlign: 'top' }}
          >
            {getTagDisplayValue(typeof tag === 'object' ? tag.name : tag)}
          </span>
          {!disabled &&
            <a className={classNameRemove} onClick={() => onRemove(key)} />
          }
        </span>
      )
    }

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

      // let suggestions = tags.filter((tag) => (
      //   tag.toLowerCase().slice(0, inputLength) === inputValue
      // ))
      const suggestions = Object.keys(allTags)
      .map(id => allTags[id]).sort((a, b) => a.path - b.path)
      .filter(tag => tag.name.toLowerCase().slice(0, inputLength) === inputValue)

      return (
        <Autosuggest
          ref={props.ref}
          suggestions={suggestions}
          alwaysRenderSuggestions
          getSuggestionValue={(suggestion) => suggestion.name}
          renderSuggestion={(suggestion) => <span>{suggestion.path}</span>}
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
      }
    }

    const defaultRenderLayout = (tagComponents, inputComponent) => {
      const archive = this.archive
      const deleteFunc = this.trash
      const notePath = this.props.createdNoteState.path
      return (
        <div>
          {tagComponents}
          <div className="item-toolbar" style={{ padding: '0 15px' }}>
            <IconMenu
              onRequestChange={(open, reason) => handleCloseColorMenu(open, reason)}
              open={this.state.colorMenuOpen}
              iconButtonElement={
                <IconButton className="dialog-toolbar-button">
                  <ImagePalette data-tip="change color" />
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
                <IconButton className="dialog-toolbar-button">
                  <ActionLabel
                    data-tip={this.state.tags.length ? 'change tags' : 'add tags'}
                  />
                </IconButton>
              }
              width={200}
            >
              {inputComponent}
            </IconMenu>
            <IconButton disabled={notePath === 'new'} onTouchTap={() => archive()} className="dialog-toolbar-button">
              <ActionDone data-tip="archive" />
            </IconButton>
            <IconButton disabled={notePath === 'new'} onTouchTap={() => deleteFunc()} className="dialog-toolbar-button">
              <ActionDelete data-tip="trash" />
            </IconButton>
            <FlatButton
              label="Cancel"
              onTouchTap={() => this.props.toggleCreateNoteModal()}
              style={{ color: '#202020' }}
            />
            <FlatButton
              label="Save Note"
              onTouchTap={this.createNote}
              disabled={this.disabledButton()}
              style={{ color: '#202020' }}
            />
          </div>
          <ReactTooltip place="bottom" type="dark" effect="solid" />
        </div>
      )
    }

    const createNoteModalActions = [
      <TagsInput
        onlyUnique
        renderInput={autocompleteRenderInput}
        value={this.state.tags}
        onChange={this.handleChange}
        renderLayout={defaultRenderLayout}
        renderTag={defaultRenderTag}
      />
    ]

    const editorState = EditorState.createWithContent(
      convertFromRaw(this.props.createdNoteState.content)
    )

    const colorHexName = () => {
      if (this.state.color) {
        switch (this.state.color) {
          case 'DEFAULT':
            return 'dialogHack-white'
          case 'RED':
            return 'dialogHack-red'
          case 'ORANGE':
            return 'dialogHack-orange'
          case 'YELLOW':
            return 'dialogHack-yellow'
          case 'GREEN':
            return 'dialogHack-green'
          case 'TEAL':
            return 'dialogHack-teal'
          case 'BLUE':
            return 'dialogHack-blue'
          case 'GRAY':
            return 'dialogHack-gray'
          default:
            return 'dialogHack-white'
        }
      } else {
        return 'dialogHack-white'
      }
    }

    const title = (
      <input type="text" value={this.state.title} onChange={this.updateTitleState} placeholder="Title" />
    )

    const colorState = this.state.color

    return (
      <div>
        <Dialog
          actions={createNoteModalActions}
          modal={false}
          open={this.props.createNoteModalOpen}
          onRequestClose={this.props.toggleCreateNoteModal}
          autoScrollBodyContent
          contentClassName={colorHexName()}
          actionsContainerStyle={{ borderTop: 'none' }}
          title={title}
          titleStyle={{
            fontFamily: "'Roboto Condensed',arial,sans-serif",
            border: 'none',
            fontSize: '17px',
            lineHeight: '23px',
            padding: '24px 24px 10px',
            backgroundColor: colorHex(colorState),
            width: '93%'
          }}
          titleClassName="createNoteModalTitle"
        >
          <div
            onClick={this.focus}
            style={{
              fontFamily: "'Roboto Slab','Times New Roman',serif",
              color: '#000',
              fontSize: '14px',
              lineHeight: '19px'
            }}
          >
            <Editor
              ref="editor"
              placeholder={'Write here. Type [ ] to add a todo ...'}
              editorState={this.state.editorState}
              onChange={this.onChange}
              blockStyleFn={this.blockStyleFn}
              blockRenderMap={this.blockRenderMap}
              blockRendererFn={this.blockRendererFn}
              handleBeforeInput={this.handleBeforeInput}
              handleKeyCommand={this.handleKeyCommand}
            />
          </div>
        </Dialog>
        <ReactTooltip place="bottom" type="dark" effect="solid" />
      </div>
    )
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CreateNoteModal)

/*
Returns default block-level metadata for various block type. Empty object otherwise.
*/
const getDefaultBlockData = (blockType, initialData = {}) => {
  switch (blockType) {
    case TODO_TYPE: return { checked: false }
    default: return initialData
  }
}

/*
Changes the block type of the current block.
*/
const resetBlockType = (editorState, newType = 'unstyled') => {
  const contentState = editorState.getCurrentContent()
  const selectionState = editorState.getSelection()
  const key = selectionState.getStartKey()
  const blockMap = contentState.getBlockMap()
  const block = blockMap.get(key)
  let newText = ''
  const text = block.getText()
  if (block.getLength() >= 2) {
    newText = text.substr(1)
  }
  const newBlock = block.merge({
    text: newText,
    type: newType,
    data: getDefaultBlockData(newType),
  })
  const newContentState = contentState.merge({
    blockMap: blockMap.set(key, newBlock),
    selectionAfter: selectionState.merge({
      anchorOffset: 0,
      focusOffset: 0,
    }),
  })
  return EditorState.push(editorState, newContentState, 'change-block-type')
}

/*
A higher-order function.
*/
const getBlockRendererFn = (getEditorState, onChange) => (block) => {
  const type = block.getType()
  switch (type) {
    case TODO_TYPE:
      return {
        component: TodoBlock,
        props: {
          onChange,
          getEditorState,
        },
      }
    default:
      return null
  }
}

class TodoBlock extends Component {
  constructor(props) {
    super(props)
    this.updateData = this.updateData.bind(this)
  }

  updateData() {
    const { block, blockProps } = this.props

    // This is the reason we needed a higher-order function for blockRendererFn
    const { onChange, getEditorState } = blockProps
    const data = block.getData()
    const checked = (data.has('checked') && data.get('checked') === true)
    const newData = data.set('checked', !checked)
    onChange(updateDataOfBlock(getEditorState(), block, newData))
  }

  render() {
    const data = this.props.block.getData()
    const checked = data.get('checked') === true
    return (
      <div className={checked ? 'block-todo-completed' : ''}>
        <input type="checkbox" checked={checked} onChange={this.updateData} />
        <EditorBlock {...this.props} />
      </div>
    )
  }
}

const updateDataOfBlock = (editorState, block, newData) => {
  const contentState = editorState.getCurrentContent()
  const newBlock = block.merge({
    data: newData,
  })
  const newContentState = contentState.merge({
    blockMap: contentState.getBlockMap().set(block.getKey(), newBlock),
  })
  return EditorState.push(editorState, newContentState, 'change-block-type')
}
