import React from 'react';
import tt from 'counterpart';

import { Label, Button, Icon } from 'semantic-ui-react';
import { Form } from 'formsy-semantic-ui-react';

import MarkdownEditor from '../MarkdownEditor/MarkdownEditor';

export default class PostFormFieldBody extends React.Component {
  constructor(props) {
    super(props);
    if (this.props.handleChange) {
      this.props.handleChange(this, {name: 'body', value: props.value});
    }
  }

  onChange = (data) => {
    if (this.props.handleChange) {
      this.props.handleChange(this, {name: 'body', value: data});
    }
  };

  render() {
    const errorLabel = <Label color="red" pointing />;
    return (
      <div>
      <MarkdownEditor
        ref="editor"
        initialValue={this.props.value}
        placeholder={tt('post_form.body')}
        previewEnabled={this.props.previewEnabled}
        onChangeNotify={this.onChange}
      />
      {/*<Form.TextArea
        name="body"
        autoFocus={true}
        placeholder={tt('post_form.body')}
        rows={5}
        defaultValue={this.props.value}
        errorLabel={errorLabel}
        onChange={this.onChange}
      />*/}
      </div>
    )
  }
}
