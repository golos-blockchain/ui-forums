import React from 'react'
import { Helmet } from 'react-helmet';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { goToTop } from 'react-scrollable-anchor';
import tt from 'counterpart';
import ttGetByKey from '../../utils/ttGetByKey';
import golos from 'golos-classic-js';
import { key_utils } from 'golos-classic-js/lib/auth/ecc';
import { validateAccountName } from 'golos-classic-js/lib/utils';
import { jsPDF } from 'jspdf';

import { Header, Label, Button, Icon } from 'semantic-ui-react';
import { Form } from 'formsy-semantic-ui-react';

import * as CONFIG from '../../../config';
import * as breadcrumbActions from '../../actions/breadcrumbActions';

class CreateAccount extends React.Component {

    constructor(props) {
        super(props);
        goToTop();
        this.state = {
            alreadyExists: false,
            generatedPassword: 'P' + key_utils.get_random_key().toWif(),
            code: null,
            email: null,
            authType: 'email',
            methods: []
        };
        this.getMethods = this.getMethods.bind(this);
        this.getMethods()
    }

    async getMethods() {
        try {
            let uri = CONFIG.REST_API + '/auth';
            const response = await fetch(uri);
            if (response.ok) {
                const result = await response.json();
                this.setState({
                    methods: result.data.methods
                });
            } else {
                console.error(response.status);
            }
        } catch(e) {
            console.error(e);
        }
    }

    componentWillMount() {
        this.props.actions.setBreadcrumb([
            {
                name: tt('login.sign_up'),
                link: `/create_account`
            }
        ]);
    }

    getRandomArbitrary = (min, max) => {
        return parseInt(Math.random() * (max - min) + min);
    };

    handleFetchError = (err) => {
        alert('Cannot register: ' + err);
        console.error(err);
    }

    onValidSubmit = async (data) => {
        try {
            const { authType } = this.state;
            let keys = golos.auth.generateKeys(data.username, data.pass, ['owner', 'active', 'posting', 'memo']);

            let uri;
            if (authType === 'email') {
                uri = CONFIG.REST_API + '/auth/send_email/' + data.email + '/' + tt.getLocale() + '/';
            } else {
                uri = CONFIG.REST_API + '/auth/verify_email/-/-/';
            }
            uri += data.username + '/' + keys.owner + '/' + keys.active + '/' + keys.posting + '/' + keys.memo;

            const response = await fetch(uri, { credentials: 'include'}); // credentials are for not email case
            if (response.ok) {
                const result = await response.json();
                if (authType !== 'email' && result.status === 'ok') {
                    alert('Поздравляем! Вы успешно зарегистрировались');
                    window.location.href = '/';
                } else if (authType === 'email' && result.data === data.email) {
                    this.setState({
                        code: true,
                        email: data.email
                    });
                } else {
                    this.handleFetchError(JSON.stringify(result));
                }
            } else {
                this.handleFetchError(response.status);
            }
        } catch (e) {
            this.handleFetchError(e);
        }
    };

    onValidSubmitCode = async (data) => {
        try {
            let uri = CONFIG.REST_API + '/auth/verify_email/' + this.state.email + '/' + data.ver_code;
            const response = await fetch(uri);
            if (response.ok) {
                const result = await response.json();
                if (result.status === 'ok') {
                    alert('Поздравляем! Вы успешно зарегистрировались');
                    window.location.href = '/';
                } else if (result.data === 'Wrong code') {
                    alert('Неверный код подтверждения!');
                } else {
                    this.handleFetchError(result.data);
                }
            } else {
                this.handleFetchError(response.status);
            }
        } catch (e) {
            this.handleFetchError(e);
        }
    };

    useVk = (e) => {
        e.preventDefault();
        const doc = new jsPDF();

doc.text("Hello world!", 10, 10);
doc.save('keys.pdf');
        this.setState({
            authType: 'ВКонтакте'
        });
        window.open(CONFIG.REST_API + '/auth/vk', '_blank');
        document.getElementsByName('username')[0].focus();
        return false;
    };

    useFacebook = (e) => {
        e.preventDefault();
        this.setState({
            authType: 'Facebook'
        });
        window.open(CONFIG.REST_API + '/auth/facebook', '_blank');
        document.getElementsByName('username')[0].focus();
        return false;
    };

    render() {
        const { methods, authType } = this.state;
        const errorLabel = (<Label color='red' pointing/>);
        let form = null;
        if (!this.state.code) {
            form = (
                <Form
                    ref={ref => this.form = ref }
                    onValidSubmit={this.onValidSubmit}>
                    {authType === 'email' ? <Form.Input
                        name='email'
                        label={tt('login.enter_email')}
                        autoFocus
                        focus
                        required
                        validations='isEmail'
                        validationErrors={{
                            isDefaultRequiredValue: tt('g.this_field_required'),
                            isEmail: tt('g.should_be_email')
                        }}
                        errorLabel={ errorLabel }
                    /> : null}
                    {methods.includes('vk') ? (<Button color='vk' onClick={this.useVk}>
                        <Icon name='vk' /> VK
                    </Button>) : null }
                    {methods.includes('facebook') ? (<Button color='facebook' onClick={this.useFacebook}>
                        <Icon name='facebook' /> Facebook
                    </Button>) : null }
                    {methods.includes('google') ? (<Button color='google plus'>
                        <Icon name='google plus' /> Google Plus
                    </Button>) : null }
                    {authType !== 'email' ? (<div><br/><Icon color='green' name='checkmark' /><b>{tt('login.authorized_with') + authType}.</b></div>) : null}
                    {methods.length > 1 ? (<div style={{height: '20px'}} />) : null}
                    <Form.Input
                        name='username'
                        label={tt('login.enter_username')}
                        focus
                        required
                        validations={{
                            isAccountName: (values, value) => {
                                const { error } = validateAccountName(value);
                                return error ? tt('validation.' + error) : true;
                            },
                            isNoSuchAccount: (values, value) => {
                                golos.api.getAccounts([value], (err, res) => {
                                    this.setState({
                                        alreadyExists: res.length > 0
                                    });
                                });
                                return true;
                            }
                        }}
                        errorLabel={ errorLabel }
                        />
                    {this.state.alreadyExists ? <Label color='red' pointing>{tt('validation.account_name_used')}</Label> : ''}
                    <Form.Input
                        name='gen_pass'
                        label={tt('login.generate_password')}
                        focus
                        readOnly
                        value={this.state.generatedPassword}
                        />
                    <Form.Input
                        name='pass'
                        label={tt('login.enter_password')}
                        focus
                        required
                        type='password'
                        validationErrors={{
                            isDefaultRequiredValue: tt('g.this_field_required')
                        }}
                        errorLabel={ errorLabel }
                        />
                    {tt('login.warning_password')}<br/><br/>
                    <Form.Checkbox
                        name='is_agree'
                        label={tt('login.checkbox_password')}
                        type='checkbox'
                        validations='isTrue'
                        />
                    <Form.Button color='green'>{tt('login.create_account')}</Form.Button>
                    <br/>
                </Form>);
        } else {
            form = (
                <Form
                    ref={ref => this.form = ref }
                    onValidSubmit={this.onValidSubmitCode}>
                    <Form.Input
                        name='ver_code'
                        label={tt('g.enter_code')}
                        focus
                        required
                        validationErrors={{
                            isDefaultRequiredValue: tt('g.this_field_required')
                        }}
                        errorLabel={ errorLabel }
                      />
                    <Form.Button color='green'>{tt('g.continue')}</Form.Button>
                    <br/>
                </Form>);
        }
        return (
            <div style={{width: '600px'}}>
                <Helmet>
                    <title>{tt('login.sign_up') + ' | ' + ttGetByKey(CONFIG.FORUM, 'page_title')}</title>
                </Helmet>
                <Header size='huge'>
                    <Header.Content>{tt('login.sign_up')}
                    </Header.Content>
                </Header>
                {form}
            </div>
        );
    }
}

function mapStateToProps(state, ownProps) {
    return {
    };
}

function mapDispatchToProps(dispatch) {
    return {actions: bindActionCreators({
        ...breadcrumbActions,
    }, dispatch)};
}

export default connect(mapStateToProps, mapDispatchToProps)(CreateAccount);
