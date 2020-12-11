import React from 'react'
import { Helmet } from "react-helmet";
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux'
import tt from 'counterpart';
import ttGetByKey from '../../utils/ttGetByKey';
import validate_account_name from '../../utils/validate_account_name';
import golos from 'golos-classic-js'
import { key_utils } from 'golos-classic-js/lib/auth/ecc';

import { Grid, Header, Label } from 'semantic-ui-react'
import { goToTop } from 'react-scrollable-anchor'
import { Form } from 'formsy-semantic-ui-react'

import * as CONFIG from '../../../config';
import * as breadcrumbActions from '../../actions/breadcrumbActions'

class CreateAccount extends React.Component {

  constructor(props) {
    super(props);
    goToTop()
    this.state = {
      alreadyExists: false,
      generatedPassword: 'P' + key_utils.get_random_key().toWif(),
      code: null,
      email: null
    };
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
  }

  handleFetchError = (err) => {
    alert('Cannot register: ' + err);
    console.error(err);
  }

  onValidSubmit = async (data) => {
    try {
      let keys = golos.auth.generateKeys(data.username, data.pass, ['owner', 'active', 'posting', 'memo']);
      
      let uri = CONFIG.REST_API + '/send_email/' + data.email + '/' + tt.getLocale() + '/';
      uri += data.username + '/' + keys.owner + '/' + keys.active + '/' + keys.posting + '/' + keys.memo;
      const response = await fetch(uri);
      if (response.ok) {
        const result = await response.json();
        if (result.data == data.email) {
          this.setState({
            code: true,
            email: data.email
          })
        } else {
          this.handleFetchError(JSON.stringify(result));
        }
      } else {
        this.handleFetchError(response.status);
      }
    } catch (e) {
      this.handleFetchError(e);
    }
  }

  onValidSubmitCode = async (data) => {
    try {
      let uri = CONFIG.REST_API + '/verify_email/' + this.state.email + '/' + data.ver_code;
      const response = await fetch(uri);
      if (response.ok) {
        const result = await response.json();
        if (result.status == 'ok') {

          alert('Поздравляем! Вы успешно зарегистрировались');
          window.location.href = '/';
        } else if (result.data == 'Wrong code') {
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
  }

  render() {
    const errorLabel = <Label color="red" pointing/>
    let form = null;
    if (!this.state.code) {
      form = (
          <Form
              ref={ref => this.form = ref }
              onValidSubmit={this.onValidSubmit}>
            <Form.Input
              name='email'
              label={tt('login.enter_email')}
              autoFocus
              focus
              required
              validations="isEmail"
              validationErrors={{
                isDefaultRequiredValue: tt('g.this_field_required'),
                isEmail: tt('g.should_be_email')
              }}
              errorLabel={ errorLabel }
              />
            <Form.Input
              name='username'
              label={tt('login.enter_username')}
              focus
              required
              validations={{
                isAccountName: function (values, value) {
                  return validate_account_name(value);
                },
                isNoSuchAccount: (values, value) => {
                  golos.api.getAccountsAsync([value], (err, res) => {
                    this.setState({
                      alreadyExists: res.length > 0
                    });
                  });
                  return true;
                }
              }}
              errorLabel={ errorLabel }
              />
              {this.state.alreadyExists ? <Label color="red" pointing>{tt('validation.account_name_used')}</Label> : ''}
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
              validations="isTrue"
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
    )
  }
}

function mapStateToProps(state, ownProps) {
  return {
  }
}

function mapDispatchToProps(dispatch) {
  return {actions: bindActionCreators({
    ...breadcrumbActions,
  }, dispatch)}
}

export default connect(mapStateToProps, mapDispatchToProps)(CreateAccount);
