import truncate from 'lodash/truncate';

export function getMemoKey(account) {
    return account.memoKey || window.memoKey;
};

export function saveMemoKeyInSession(memoKey) {
	window.memoKey = memoKey;
}

export function displayQuoteMsg(body) {
    body = truncate(body, { length: 50, omission: '...', });
    return body.split('\n').join(' ');
}
