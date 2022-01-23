import React from 'react';
import tt from 'counterpart';

import { Button, Header, Icon, Modal } from 'semantic-ui-react'
import { Form, TextArea } from 'formsy-semantic-ui-react'

export default class PostFormError extends React.Component {
  render() {
    const { error } = this.props
    if(!error) return false
    const message = window.location.href + "\n\n" + error.err.message
    return (
      <Modal
        open={this.props.open}
        onClose={this.props.onClose}
        basic
        size='small'
        >
        <Header icon='alarm outline' content={tt('post_form.error_submitting')} />
        <Modal.Content>
          <Header color='red'>{error.message}</Header>
          <Form>
           <Form.Field
             control={TextArea}
             defaultValue={message}
             name='error'
           />
           <p>{tt('post_form.error_submitting_description')}</p>
         </Form>
        </Modal.Content>
        <Modal.Actions>
          <Button color='green' onClick={this.props.onClose} inverted>
            <Icon name='checkmark' /> OK
          </Button>
        </Modal.Actions>
      </Modal>
    )
  }
}
