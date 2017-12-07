import React, { Component } from 'react'
import { Map } from 'immutable'
import {
  Editor,
  EditorState,
  DefaultDraftBlockRenderMap,
  EditorBlock,
  RichUtils,
} from 'draft-js'

export default class BasicEditor extends Component {
  constructor(props) {
    super(props)

    this.state = {
      editorState: this.props.editorState
    }

    this.blockRenderMap = Map({
      [TODO_TYPE]: {
        element: 'div',
      }
    }).merge(DefaultDraftBlockRenderMap);

    this.onChange = (editorState) => {
      this.setState({ editorState })
      // this.props.onChange ? this.props.onChange(editorState) : null;
      // this.props.onChange ? this.props.onChange(convertToRaw(editorState.getCurrentContent())) : null;
    }

    this.getEditorState = () => this.state.editorState
    // this.getEditorState = () => this.props.editorState;

    this.blockRendererFn = getBlockRendererFn(this.getEditorState, this.onChange);

    this.handleBeforeInput = this.handleBeforeInput.bind(this)
    this.handleKeyCommand = this.handleKeyCommand.bind(this)
    this.focus = this.focus.bind(this)
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.editorState !== this.props.editorState) {
      this.setState({ editorState: nextProps.editorState })
    }
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

  render() {
    return (
      <div onClick={this.focus}>
        <Editor
          ref="editor"
          placeholder={this.props.placeholder ? this.props.placeholder : null}
          editorState={this.state.editorState}
          onChange={this.onChange}
          blockStyleFn={blockStyleFn}
          blockRenderMap={this.blockRenderMap}
          blockRendererFn={this.blockRendererFn}
          handleBeforeInput={this.handleBeforeInput}
          handleKeyCommand={this.handleKeyCommand}
          readOnly={this.props.readOnly} />
      </div>
    )
  }
}

const TODO_TYPE = 'todo'

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

const blockStyleFn = block => {
  switch (block.getType()) {
    case TODO_TYPE:
      return 'block block-todo'
    default:
      return 'block'
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
