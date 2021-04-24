export function getMemoKey(account) {
    return account.memoKey || window.memoKey;
};

export function saveMemoKeyInSession(memoKey) {
	window.memoKey = memoKey;
}
