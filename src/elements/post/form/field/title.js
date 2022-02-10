import React from 'react';
import tt from 'counterpart';

import { Label } from 'semantic-ui-react';
import { Form } from 'formsy-semantic-ui-react';

export default class PostFormFieldTitle extends React.Component {
    render() {
        const { value } = this.props;
        return (
            <Form.Field>
                <Form.Input
                    name='title'
                    className='PostFormTitle'
                    maxLength='70'
                    defaultValue={value}
                    placeholder={tt('post_form.title')}
                    validationErrors={{
                        isDefaultRequiredValue: 'A title is required'
                    }}
                    errorLabel={<Label color='red' pointing/>}
                />
            </Form.Field>
        );
    }
}
