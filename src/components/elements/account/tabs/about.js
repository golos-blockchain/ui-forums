import React from 'react';
import tt from 'counterpart';
import golos from 'golos-classic-js';

import { Segment, Icon, Label, Button, Input } from 'semantic-ui-react';
import { Form } from 'formsy-semantic-ui-react';

import * as CONFIG from '../../../../../config';

export default class AccountAbout extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            valid: false,
            avatarUploading: false
        };
    }

     makeRequest = (method, url, data, headersInitializer) => {
        return new Promise((resolve, reject) => {
            let xhr = new XMLHttpRequest();
            xhr.open(method, url);
            if (headersInitializer) headersInitializer(xhr);
            xhr.onload = function () {
                if (this.status >= 200 && this.status < 300) {
                    resolve(xhr.response);
                } else {
                    reject({
                        status: this.status,
                        statusText: xhr.statusText
                    });
                }
            };
            xhr.onerror = function () {
                reject({
                    status: this.status,
                    statusText: xhr.statusText
                });
            };
            xhr.send(data);
        });
    };

    imgurUpload = async (image) => {
        const formData = new FormData();
        formData.append('image', image);

        let res = null
        try {
            res = await this.makeRequest('POST', CONFIG.STM_Config.upload_image, formData, (xhr) => {
                xhr.setRequestHeader('Authorization', 'Client-ID ' + CONFIG.STM_Config.client_id);
            });
        } catch (error) {
            this.setState({ avatarUploading: false });
            console.error(error);
            alert(tt('account.cannot_load_image_try_again') + ' Error: ' + JSON.stringify(error));
            return false;
        }

        this.setState({ avatarUploading: false });

        console.log(res);

        const data = JSON.parse(res);
        if (!data.success) {
            alert(tt('account.cannot_load_image_try_again'));
            return false;
        }

        if (data.data.size > CONFIG.STM_Config.max_upload_file_bytes) {
            alert(tt('g.too_big_file'));
            return false;
        }

        this.setState({
            profile_image: data.data.link
        });

        return data.data.link;
    }

    onValid = () => {
        this.setState({ valid: true });
    };

    onInvalid = () => {
        this.setState({ valid: false });
    };

    onValidSubmit = async (formData) => {
        let profile_image = formData.profile_image;
        if (formData.profile_image && !formData.profile_image.includes('imgur')) {
            profile_image = await this.imgurUpload(formData.profile_image);
            if (!profile_image) {
                return;
            }
        }

        const { username } = this.props.match.params;
        const accounts = this.props.chainstate.accounts;
        const acc = accounts[username];

        let meta = {profile: {about: '', website: '', location: ''}};
        try {
            meta = JSON.parse(acc.json_metadata);
        } catch (ex) {
        }
        meta.profile = meta.profile || {};
        meta.profile.profile_image = profile_image;
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

    upload = (e) => {
        e.preventDefault();
        document.getElementsByName('avatar_file')[0].click();
    };

    uploaded = async (e) => {
        const file = document.getElementsByName('avatar_file')[0].files[0];
        if (!file) return;

        if (file.size > CONFIG.STM_Config.max_upload_file_bytes) {
            alert(tt('g.too_big_file'));
            return;
        }

        this.setState({ avatarUploading: true });

        await this.imgurUpload(file, (url) => {});
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
                                <table>
                                <tbody>
                                <tr>
                                <td width='100%'>
                                <Form.Input
                                    name='profile_image'
                                    label={tt('account.avatar')}
                                    value={this.state.profile_image || profile_image}
                                    validations='maxLength:512'
                                    validationErrors={{
                                        maxLength: tt('validation.should_not_be_longer_THAN', {THAN: 512})
                                    }}
                                    focus
                                    errorLabel={ errorLabel }
                                />
                                </td>
                                <td>
                                <Button
                                    inverted
                                    color='green'
                                    icon='upload'
                                    labelPosition='left'
                                    content={tt('g.upload')}
                                    style={{ marginTop: '23px'}}
                                    loading={this.state.avatarUploading || undefined}
                                    onClick={this.upload}
                                />
                                <input
                                    hidden
                                    name='avatar_file'
                                    type='file'
                                    accept='image/*'
                                    onChange={this.uploaded} />
                                </td>
                                </tr>
                                </tbody>
                                </table>
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
                        {website != '' ? (<div>{tt('account.website')}&nbsp;<a target="_blank" rel="nofollow noopener" href={website}>{website}</a></div>) : null}
                        {about != '' ? (<div><br />{about}</div>) : null}
                    </Segment>
                );
            }
        }
        return content;
    }
}
