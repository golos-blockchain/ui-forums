import React from 'react';
import DropZone from 'react-dropzone';
import tt from 'counterpart';
import invoke from 'lodash/invoke';

import { Button, Icon, Modal, Divider, Dimmer, Loader, Label } from 'semantic-ui-react';
import { Form } from 'formsy-semantic-ui-react';

import * as CONFIG from '../../../config';

import { imgurUpload } from '../../utils/imgurUpload';

export default class AddImageDialog extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            imageUploading: false,
        };
    }

    _showPreloading = (enabled) => {
        this.setState({ imageUploading: enabled });
    };

    _onDropImage = async (acceptedFiles, rejectedFiles) => {
        const file = acceptedFiles[0];

        if (!file) {
            if (rejectedFiles.length) {
                alert(
                    tt('post_form.please_insert_only_image_files')
                );
            }
            return;
        }

        this._showPreloading(true);

        let result;
        try {
            result = await imgurUpload(file);
        } catch (ex) {
             // Internal error case
            invoke(this.props, 'onResult', ex);
            this._showPreloading(false);
            return;
        }

        if (result && result.link) {
            invoke(this.props, 'onResult', result);
        } else {
             // TODO: Non-internal error case, add error data from result
            invoke(this.props, 'onResult', false);
        }

        this._showPreloading(false);
    };

    _onAddImage = (formData) => {
        this._showPreloading(true);

        let url = CONFIG.STM_Config.img_proxy_prefix + '0x0/' + formData.link;
        let img = new Image();
        img.onerror = img.onabort = () => {
            alert(tt('account.cannot_load_image_try_again'));
            invoke(this.props, 'onResult', false); // TODO: Add error message text
            this._showPreloading(false);
        };
        img.onload = () => {
            invoke(this.props, 'onResult', {
                link: formData.link, width: img.width, height: img.height });
            this._showPreloading(false);
        };
        img.src = url;
    };

    _onClose = (event) => {
        invoke(this.props, 'onClose', event);
    };

    render() {
        const { open } = this.props;
        const { imageUploading } = this.state;

        const errorLabel = (<Label color='red' pointing />);

        return (
            <Modal size='small' open={!!open}>
                <Modal.Header>{tt('post_form.add_image')}</Modal.Header>
                <Modal.Content>
                    <Modal.Description>
                        {imageUploading ? 
                        <Dimmer inverted active style={{minHeight: '100px', display: 'block'}}>
                            <Loader size='large'/>
                        </Dimmer> : null}
                        <DropZone
                            multiple={false}
                            style={{ cursor: 'pointer', fontWeight: 'bold', color: '#2185d0' }}
                            accept='image/*'
                            onDrop={this._onDropImage}
                        >
                            <Icon name='picture' size='large' />
                            <span style={{ borderBottom: '1px dashed #2185d0' }}>
                                {tt('post_form.add_image_from_computer')}
                            </span>
                        </DropZone>
                        <Divider />
                        <Form
                            ref={ref => this.addImageForm = ref }
                            onValidSubmit={this._onAddImage}>
                            <Form.Input
                                name='link'
                                label={tt('post_form.add_image_via_link') + ':'}
                                autoFocus
                                focus
                                required
                                validationErrors={{
                                    isDefaultRequiredValue: tt('g.this_field_required')
                                }}
                                errorLabel={ errorLabel }
                            />
                            <Button floated='right' primary>OK</Button>
                            <Button color='orange' 
                                onClick={this._onClose}>{tt('g.cancel')}</Button>
                        </Form>
                    </Modal.Description>
                </Modal.Content>
            </Modal>);
    }
}

