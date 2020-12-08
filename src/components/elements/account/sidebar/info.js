import React from 'react';
import tt from 'counterpart';

import { Table } from 'semantic-ui-react'
import TimeAgo from 'react-timeago'

import NumericLabel from '../../../../utils/NumericLabel'
import TimeAgoWrapper from '../../../../utils/TimeAgoWrapper'

export default class AccountSidebarInfo extends React.Component {
  render() {
    const { username } = this.props.match.params,
          account = this.props.chainstate.accounts[username],
          numberFormat = {
            shortFormat: true,
            shortFormatMinValue: 1000
          }
    return (
      <Table definition size="small">
        <Table.Body>
          <Table.Row>
            <Table.Cell>{tt('account.last_post')}</Table.Cell>
            <Table.Cell>
              <TimeAgoWrapper date={`${account.last_post}Z`} />
            </Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>{tt('account.post_count')}</Table.Cell>
            <Table.Cell>{account.post_count}</Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>{tt('account.tip_balance')}</Table.Cell>
            <Table.Cell>
              <NumericLabel params={numberFormat}>{account.tip_balance}</NumericLabel>
            </Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>
    )
  }
}
