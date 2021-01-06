import React from 'react';
import tt from 'counterpart';

import { Label, Button, Icon } from 'semantic-ui-react';
import { Form } from 'formsy-semantic-ui-react';

export default class PostFormFieldBody extends React.Component {
  constructor(props) {
    super(props);
    if (this.props.handleChange) {
      this.props.handleChange(this, {name: 'body', value: props.value});
    }
  }

  onChange = (e, data) => {
    if (this.props.handleChange) {
      this.props.handleChange(this, {name: 'body', value: data.value});
    }
  };

  render() {
    const errorLabel = <Label color="red" pointing />;
    return (
      <div>
      <Button.Group color='blue'>
        <Button icon>
          <Icon name='bold' />
        </Button>
        <Button icon>
          <Icon name='italic' />
        </Button>
        <Button icon>
          <Icon name='strikethrough' />
        </Button>
      </Button.Group>
      {' '}
      <Button.Group color='blue'>
        <Button icon>
          <Icon name='linkify' />
        </Button>
        <Button icon>
          <Icon name='unlinkify' />
        </Button>
      </Button.Group>
      {' '}
      <Button.Group color='blue'>
        <Button icon>
          <Icon name='picture' />
        </Button>
      </Button.Group>
      <Form.TextArea
        name="body"
        autoFocus={true}
        placeholder={tt('post_form.body')}
        rows={5}
        defaultValue={this.props.value}
        errorLabel={errorLabel}
        onChange={this.onChange}
      />
      </div>
    )
  }
}
