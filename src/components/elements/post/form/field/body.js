import React from 'react';
import tt from 'counterpart';

import { Label, Button, Icon } from 'semantic-ui-react';
import { Form } from 'formsy-semantic-ui-react';

import MarkdownEditor from '../MarkdownEditor/MarkdownEditor';
import isMobile from '../../../../../utils/isMobile';

export default class PostFormFieldBody extends React.Component {
    constructor(props) {
        super(props);
        if (this.props.handleChange) {
            this.props.handleChange(this, {name: 'body', value: props.value});
        }
        this.state = {
            showMarkupGuide: false
        };
    }

    onChange = (data) => {
        if (this.props.handleChange) {
            this.props.handleChange(this, {name: 'body', value: data});
        }
    };

    onChange2 = (e, data) => {
        if (this.props.handleChange) {
            this.props.handleChange(this, {name: 'body', value: data.value});
        }
    };

    toggleMarkupGuide = () => {
        this.setState({ showMarkupGuide: !this.state.showMarkupGuide });
    };

    render() {
        const errorLabel = <Label color="red" pointing />;
        return (
            <div>
            {isMobile() ? <div><a onClick={this.toggleMarkupGuide}>{tt('post_form.how_to_markup')}</a>
            {this.state.showMarkupGuide ? (<div dangerouslySetInnerHTML={{__html: tt('post_form.how_to_markup_html')}}></div>): null}
            </div> : null}
            {!isMobile() ? <MarkdownEditor
                ref="editor"
                initialValue={this.props.value}
                placeholder={tt('post_form.body')}
                previewEnabled={this.props.previewEnabled}
                onChangeNotify={this.onChange} />
            : <Form.TextArea
                name="body"
                autoFocus={true}
                placeholder={tt('post_form.body')}
                rows={5}
                defaultValue={this.props.value}
                errorLabel={errorLabel}
                onChange={this.onChange2}
            />}
            </div>
        )
    }
}
