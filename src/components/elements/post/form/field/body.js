import React from 'react';
import tt from 'counterpart';

import { Label } from 'semantic-ui-react'
import { Form } from 'formsy-semantic-ui-react'
import HtmlEditor from '../HtmlEditor/HtmlEditor'

export default class PostFormFieldTitle extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      rteState: HtmlEditor.getStateFromHtml('')
    };
  }
  processBody = (string) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(string, "text/html").querySelector("body");
    // Remove automatically appended footer before rendering
    let elements = doc.getElementsByClassName('chainbb-footer');
    while(elements.length > 0){
      elements[0].parentNode.removeChild(elements[0]);
    }
    // Return HTML
    return doc.innerHTML
  }

  _onHtmlEditorChange = state => {
      this.setState(
          {
              rteState: state,
          }
      );
  };

  render() {
    const { disableAutoFocus, value } = this.props
    let content = false
    if(value) {
      content = this.processBody(value)
    }
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
      /*<Form.TextArea
        name="body"
        placeholder={tt('post_form.body')}
        autoFocus={!disableAutoFocus}
        rows={14}
        defaultValue={content}
        errorLabel={errorLabel}
        validationErrors={{
          isDefaultRequiredValue: 'A post body is required.',
        }}
      />*/
  }
}
