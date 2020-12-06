import tt from 'counterpart';

// Note: recommended way is errorStr.includes(errid) if error has errid
export default function (op, error) {
	let errorStr = JSON.stringify(error);
	switch (op) {
		case 'vote':
			if (errorStr.includes('voter_has_used_maximum_vote_changes')) {
				return tt('voting.vote_changes_exceed');
			}
			return errorStr;
		break;
		default:
			return errorStr; 
		break;
	}
}