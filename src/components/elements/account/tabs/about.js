import React from 'react';
import tt from 'counterpart';
import golos from 'golos-classic-js';

import { Segment, Icon, Label, Button } from 'semantic-ui-react';
import { Form } from 'formsy-semantic-ui-react';

export default class AccountAbout extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            valid: false
        };
    }

    onValid = () => {
        this.setState({ valid: true });
    };

    onInvalid = () => {
        this.setState({ valid: false });
    };

    onValidSubmit = (formData) => {
        const { username } = this.props.match.params;
        const accounts = this.props.chainstate.accounts;
        const acc = accounts[username];

        let meta = {profile: {about: '', website: '', location: ''}};
        try {
            meta = JSON.parse(acc.json_metadata);
        } catch (ex) {
        }
        meta.profile = meta.profile || {};
        meta.profile.profile_image = formData.profile_image;
        meta.profile.about = formData.about;
        meta.profile.website = formData.website;
        meta.profile.location = formData.location;
        golos.broadcast.accountMetadata(this.props.account.key, username,
            JSON.stringify(meta),
            (err, result) => {
                if (err) {
                    alert(err);
                    return;
                }
                setTimeout(() => window.location.reload(), 500);
            });
    };

    render() {
        let content = (<Segment attached padded="very" loading />);
        if (this.props.chainstate && this.props.chainstate.accounts) {
            const { username } = this.props.match.params;
            const accounts = this.props.chainstate.accounts;
            if (accounts[username]) {
                const acc = accounts[username];

                let about = '';
                let website = '';
                let location = '';
                let profile_image = '';
                let meta = null;
                try {
                    meta = JSON.parse(acc.json_metadata);
                } catch (ex) {
                }
                if (meta && meta.profile) {
                    website = meta.profile.website || '';
                    about = meta.profile.about || '';
                    location = meta.profile.location || '';
                    profile_image = meta.profile.profile_image || '';
                }
                if (this.props.account.name === username) {
                    const errorLabel = (<Label color="red" pointing/>);
                    content = (
                        <Segment attached>
                            <Form
                                ref={ref => this.form = ref}
                                onValid={this.onValid}
                                onInvalid={this.onInvalid}
                                onValidSubmit={this.onValidSubmit}>
                                <Form.Input
                                    name='profile_image'
                                    label={tt('account.avatar')}
                                    value={profile_image}
                                    validations='maxLength:512'
                                    validationErrors={{
                                        maxLength: tt('validation.should_not_be_longer_THAN', {THAN: 512})
                                    }}
                                    focus
                                    errorLabel={ errorLabel }
                                />
                                <Form.Input
                                    name='location'
                                    label={tt('account.location')}
                                    value={location}
                                    validations='maxLength:30'
                                    validationErrors={{
                                        maxLength: tt('validation.should_not_be_longer_THAN', {THAN: 30})
                                    }}
                                    focus
                                    errorLabel={ errorLabel }
                                />
                                <Form.Input
                                    name='website'
                                    label={tt('account.website')}
                                    value={website}
                                    validations='maxLength:512'
                                    validationErrors={{
                                        maxLength: tt('validation.should_not_be_longer_THAN', {THAN: 512})
                                    }}
                                    focus
                                    errorLabel={ errorLabel }
                                />
                                <Form.Input
                                    name='about'
                                    label={tt('account.about_yourself')}
                                    value={about}
                                    validations='maxLength:160'
                                    validationErrors={{
                                        maxLength: tt('validation.should_not_be_longer_THAN', {THAN: 160})
                                    }}
                                    focus
                                    errorLabel={ errorLabel }
                                />
                                <Form.Button color={this.state.valid ? 'blue' : undefined}>{tt('g.update')}</Form.Button>
                            </Form>
                        </Segment>
                    );
                    return content;
                }
                content = (
                    <Segment attached>
                        {location != '' ? (<div>{tt('account.location')}&nbsp;<Icon name='location arrow' color='blue' />{location}</div>) : null}
                        {website != '' ? (<div>{tt('account.website')}&nbsp;<a href={website}>{website}</a></div>) : null}
                        {about}
                    </Segment>
                );
            }
        }
        return content;
    }
}
