import React from 'react';
import tt from 'counterpart';
import { EditorState } from 'draft-js';

import { Label } from 'semantic-ui-react'
import { Form } from 'formsy-semantic-ui-react'

import HtmlEditor from '../HtmlEditor/HtmlEditor';

export default class PostFormFieldBody extends React.Component {
  constructor(props) {
    super(props);
    const st = HtmlEditor.getStateFromHtml(props.value);
    this.state = {
      rteState: st
    };
    if (this.props.handleChange) {
      this.props.handleChange(this, {name: 'body', value: st.toString('html')});
    }
  }

  componentWillReceiveProps(nextProps) {
    if (!this.props.rootUsage && nextProps && nextProps.value && nextProps.value != this.props.value) {
        let es = HtmlEditor.getStateFromHtml(nextProps.value).getEditorState();
        es = EditorState.moveFocusToEnd(es);
        this.setState({
            rteState: this.state.rteState.setEditorState(es)
        });
    }
  }

  _onHtmlEditorChange = state => {
      this.setState(
          {
              rteState: state,
          }
      , () => {
        if (this.props.handleChange) {
          this.props.handleChange(this, {name: 'body', value: state.toString('html')});
        }
      });
  };

  render() {
    return (
      <HtmlEditor
        name="body"
        placeholder={tt('post_form.body')}
        ref="editor"
        value={this.state.rteState}
        onChange={this._onHtmlEditorChange}
      />
    )
  }
}
