import React, { Component } from 'react'
import tt from 'counterpart';

import Pagination from 'rc-pagination';
import localeEn from 'rc-pagination/es/locale/en_US';
import localeRu from 'rc-pagination/es/locale/ru_RU';
if (typeof(document) !== 'undefined') import('rc-pagination/assets/index.css');

export default class Paginator extends Component {

  changePage = (data) => {
    this.props.callback(data, `comments-page-${data}`)
  }

  render() {
    let { page, perPage, total } = this.props
    return (
      <Pagination
        showLessItems
        defaultPageSize={perPage}
        current={page}
        onShowSizeChange={this.onShowSizeChange}
        onChange={this.changePage}
        total={total}
        style={{ float: 'right', margin: 0 }}
        locale={tt.getLocale() === 'ru' ? localeRu : localeEn}
      />
    )
  }
}
