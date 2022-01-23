import React from 'react';
import tt from 'counterpart';

import { Label } from 'semantic-ui-react';
import { Form } from 'formsy-semantic-ui-react';

import MarkdownEditor from '@/elements/post/form/MarkdownEditor/MarkdownEditor';

export default class PostFormFieldBody extends React.Component {
    constructor(props) {
        super(props);
        if (this.props.handleChange) {
            this.props.handleChange(this, {name: 'body', value: props.value});
        }
        this.state = {
            showMarkupGuide: false,
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

    focus = () => {
        if (this.refs.editor) {
            this.refs.editor.focus();
        } else {
            document.getElementsByName('body')[0].focus();
        }
    };

    setValue = (value) => {
        if (this.refs.editor) {
            this.refs.editor.setValue(value);
        }
    };

    render() {
        const errorLabel = (<Label color='red' pointing />);
        return (
            <div>
            {window.IS_MOBILE ? <div><a onClick={this.toggleMarkupGuide}>{tt('post_form.how_to_markup')}</a>
            {this.state.showMarkupGuide ? (<div dangerouslySetInnerHTML={{__html: tt('post_form.how_to_markup_html')}}></div>): null}
            </div> : null}
            {!window.IS_MOBILE ? <MarkdownEditor
                ref='editor'
                initialValue={this.props.value}
                placeholder={tt('post_form.body')}
                previewEnabled={this.props.previewEnabled}
                onChangeNotify={this.onChange} />
            : <Form.TextArea
                name='body'
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
