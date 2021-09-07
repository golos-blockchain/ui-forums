import React from 'react';
import { Helmet } from 'react-helmet';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { goToTop } from 'react-scrollable-anchor';
import tt from 'counterpart';
import ttGetByKey from '../../utils/ttGetByKey';
import golos from 'golos-lib-js';
import { PrivateKey, key_utils } from 'golos-lib-js/lib/auth/ecc';
import { validateAccountName, Asset } from 'golos-lib-js/lib/utils';
import { jsPDF } from 'jspdf';

import { Header, Label, Button, Icon, Loader } from 'semantic-ui-react';
import { Form } from 'formsy-semantic-ui-react';

import * as CONFIG from '../../../config';
import * as breadcrumbActions from '../../actions/breadcrumbActions';

import './create.css';

class CreateAccount extends React.Component {

    constructor(props) {
        super(props);
        if (process.browser) goToTop();
        this.state = {
            alreadyExists: false,
            inviteData: null,
            generatedPassword: 'P' + key_utils.get_random_key().toWif(),
            code: null,
            email: null,
            authType: 'email',
            authSuccessType: null,
            methods: [],
            allValid: false,
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

    componentDidMount() {
        const invite = new URLSearchParams(window.location.search).get('invite');
        if (invite) {
            this.setState({
                authType: 'invite',
                defaultInviteCode: invite,
            });
        }
    }

    getRandomArbitrary = (min, max) => {
        return parseInt(Math.random() * (max - min) + min);
    };

    handleFetchError = (err) => {
        alert('Cannot register: ' + err);
        console.error(err);
    }

    createPdf = (username, privateKeys) => {
        this.keysPDFFileName = 'keys-' + username + '.pdf';
        this.keysPDF = new jsPDF();
        let pdf = this.keysPDF;

        /*"pdf_title": "Ключи от аккаунта @",
        "pdf_desc": "Это приватные ключи, которые дают доступ к вашему аккаунту. Храните этот файл в надежном месте.",
        "pdf_password_desc": "Пароль (используйте для входа на форум): ",
        "pdf_posting_desc": "Posting-ключ (также подходит в качестве пароля на форуме): ",
        "pdf_active_desc": "Active-ключ: ",
        "pdf_owner_desc": "Owner-ключ: ",
        "pdf_memo_desc": "Memo-ключ: "*/

        pdf.setFontSize(28);
        pdf.text(10, 20, tt('login.pdf_title') + username);

        pdf.setFontSize(10);
        pdf.text(10, 30, tt('login.pdf_desc'));

        pdf.setFontSize(12);
        pdf.text(10, 40, tt('login.pdf_password_desc'));
        pdf.text(10, 45, privateKeys.password);

        pdf.text(10, 55, tt('login.pdf_posting_desc'));
        pdf.text(10, 60, privateKeys.posting);

        pdf.text(10, 70, tt('login.pdf_active_desc'));
        pdf.text(10, 75, privateKeys.active);

        pdf.text(10, 85, tt('login.pdf_owner_desc'));
        pdf.text(10, 90, privateKeys.owner);

        pdf.text(10, 100, tt('login.pdf_memo_desc'));
        pdf.text(10, 105, privateKeys.memo);
    };

    onValidSubmit = async (data) => {
        try {
            const { authType } = this.state;
            let keys = golos.auth.getPrivateKeys(data.username, data.pass, ['owner', 'active', 'posting', 'memo']);

            this.createPdf(data.username, {...keys, password: data.pass});
            delete keys.owner;
            delete keys.posting;
            delete keys.active;

            let uri;
            if (authType === 'email') {
                uri = CONFIG.REST_API + '/auth/send_email/' + data.email + '/' + tt.getLocale() + '/';
            } else if (authType === 'invite') {
                uri = CONFIG.REST_API + '/auth/verify_email/.invite/' + data.invite + '/';
            } else {
                uri = CONFIG.REST_API + '/auth/verify_email/-/-/';
            }
            uri += data.username + '/' + keys.ownerPubkey + '/' + keys.activePubkey + '/' + keys.postingPubkey + '/' + keys.memoPubkey;

            const response = await fetch(uri, { credentials: 'include'}); // credentials are for not email case
            if (response.ok) {
                const result = await response.json();
                if (authType !== 'email' && result.status === 'ok') {
                    alert('Поздравляем! Вы успешно зарегистрировались. Сейчас скачается PDF-файл, содержащий ваши ключи. Сохраните его.');
                    this.keysPDF.save(this.keysPDFFileName);
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
                    alert('Поздравляем! Вы успешно зарегистрировались. Сейчас скачается PDF-файл, содержащий ваши ключи. Сохраните его.');
                    this.keysPDF.save(this.keysPDFFileName);
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

    checkSocAuth = async (event) => {
        console.log('check');
        window.addEventListener('focus', this.checkSocAuth, {once: true});

        const response = await fetch(CONFIG.REST_API + '/auth/check_soc_auth', { credentials: 'include'});
        if (response.ok) {
            const result = await response.json();
            if (result.soc_id_type) {
                this.setState({
                    authSuccessType: result.soc_id_type,
                    inviteData: null,
                });
                window.removeEventListener('focus', this.checkSocAuth);
            } else if (!event) {
                setTimeout(this.checkSocAuth, 5000);
            } else {
                console.log('event from focus');
            }
        }
    };

    useVk = (e) => {
        e.preventDefault();
        this.setState({
            authType: 'ВКонтакте'
        });
        window.open(CONFIG.REST_API + '/auth/vk', '_blank');
        this.checkSocAuth();
        document.getElementsByName('username')[0].focus();
        return false;
    };

    useFacebook = (e) => {
        e.preventDefault();
        this.setState({
            authType: 'Facebook'
        });
        window.open(CONFIG.REST_API + '/auth/facebook', '_blank');
        this.checkSocAuth();
        document.getElementsByName('username')[0].focus();
        return false;
    };

    useMailru = (e) => {
        e.preventDefault();
        this.setState({
            authType: 'Mail.Ru'
        });
        window.open(CONFIG.REST_API + '/auth/mailru', '_blank');
        this.checkSocAuth();
        document.getElementsByName('username')[0].focus();
        return false;
    };

    useYandex = (e) => {
        e.preventDefault();
        this.setState({
            authType: 'Яндекс'
        });
        window.open(CONFIG.REST_API + '/auth/yandex', '_blank');
        this.checkSocAuth();
        document.getElementsByName('username')[0].focus();
        return false;
    };

    toggleInvite = (e) => {
        e.preventDefault();
        this.setState({
            authType: this.state.authType === 'invite' ? 'email' : 'invite',
            inviteData: null,
        });
    };

    onValid = () => {
        this.setState({ allValid: true });
    };

    onInvalid = () => {
        this.setState({ allValid: false });
    };

    render() {
        const { methods, authType, authSuccessType, alreadyExists, inviteData, defaultInviteCode, allValid } = this.state;
        const errorLabel = (<Label color='red' pointing/>);
        let form = null;
        if (!this.state.code) {
            form = (
                <Form
                    ref={ref => this.form = ref }
                    onValid={this.onValid}
                    onInvalid={this.onInvalid}
                    onValidSubmit={this.onValidSubmit}
                    >
                    {(authType === 'email' || authType === 'invite') ? (<div>
                        <a href='#' onClick={this.toggleInvite}>{tt(
                            authType === 'email' ? 'login.i_have_invite_key' : 'login.i_have_no_invite_key')}</a>
                    </div>) : null}
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
                    {authType === 'invite' ? <Form.Input
                        name='invite'
                        label={tt('login.enter_invite')}
                        autoFocus
                        focus
                        defaultValue={defaultInviteCode}
                        required
                        validations={{
                            isInviteKey: (values, value) => {
                                // the workaround with inviteData is need because validations aren't support async fetch
                                if (!value) {
                                    this.setState({
                                        inviteData: null,
                                    });
                                    return true;
                                }
                                let pk;
                                try {
                                    pk = PrivateKey.fromWif(value);
                                } catch (e) {
                                    this.setState({
                                        inviteData: null,
                                    });
                                    return tt('login.invite_wrong_format');
                                }
                                fetch(CONFIG.REST_API + '/invite/' + pk.toPublicKey().toString())
                                    .then(response => {
                                        return response.json();
                                    })
                                    .then(data => {
                                        this.setState({
                                            inviteData: data.status === 'ok' ? data.data : false,
                                        });
                                    });
                                return true;
                            },
                        }}
                        validationErrors={{
                            isDefaultRequiredValue: tt('g.this_field_required'),
                        }}
                        errorLabel={ errorLabel }
                    /> : null}
                    {inviteData === false ? <div>
                            <Label color='red' pointing style={{marginTop: '0em', marginBottom: '1em'}}>
                                {tt('login.invite_no_such')}
                            </Label>
                        </div> : ''}
                    {inviteData ? <div>
                            <Label color='green' pointing style={{marginTop: '0em', marginBottom: '1em'}}>
                                {tt('login.invite_new_account_will_receive', {amount: Asset(inviteData.balance).toString(0)})}
                            </Label>
                        </div> : ''}
                    {tt('login.authorized_with_socials')}<br/>
                    {methods.includes('vk') ? (<Button color='vk' onClick={this.useVk}>
                        <Icon name='vk' /> ВКонтакте
                    </Button>) : null }
                    {methods.includes('facebook') ? (<Button color='facebook' onClick={this.useFacebook}>
                        <Icon name='facebook' /> Facebook
                    </Button>) : null }
                    {methods.includes('mailru') ? (<Button color='blue' onClick={this.useMailru}>
                        <Icon name='mail' color='yellow' /> Mail.ru
                    </Button>) : null }
                    {methods.includes('yandex') ? (<Button color='white' onClick={this.useYandex}>
                        <Icon name='yahoo' color='red' /> Yandex
                    </Button>) : null }
                    {authType !== 'email' && authType !== 'invite' && !authSuccessType ? (<div><br/>
                        <Loader inline active size='tiny' />
                        <b className='createacc-authorizing'>{tt('login.authorizing_with') + authType}...</b>
                    </div>) : null}
                    {authSuccessType ? (<div><br/>
                        <Icon color='green' name='checkmark' />
                        <b className='createacc-authorized'>{tt('login.authorized_with') + authType}.</b>
                    </div>) : null}
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
                    {alreadyExists ? <Label color='red' pointing>{tt('validation.account_name_used')}</Label> : ''}
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
                    <Form.Button
                        disabled={!allValid || alreadyExists || (inviteData === false) || (authType !== 'email' && authType !== 'invite' && !authSuccessType)}
                        color='green'>{tt('login.create_account')}</Form.Button>
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
