import React from 'react';
import tt from 'counterpart';

import { Label } from 'semantic-ui-react'
import { Form } from 'formsy-semantic-ui-react'
import HtmlEditor from '../HtmlEditor/HtmlEditor'

export default class PostFormFieldBody extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      rteState: HtmlEditor.getStateFromHtml(props.value)
    };
  }

  componentWillReceiveProps(nextProps) {
    if(nextProps && nextProps.value && nextProps.value != this.props.value) {
    this.setState({
      rteState: HtmlEditor.getStateFromHtml(nextProps.value)
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
    const { disableAutoFocus, value } = this.props
    const errorLabel = <Label color="red" pointing />
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
