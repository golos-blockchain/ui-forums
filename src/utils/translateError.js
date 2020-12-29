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
        case 'donate':
            if (errorStr.includes('insufficient_funds')) {
                return tt('donating.not_enough');
            }
            return errorStr;
        default:
            return errorStr;
    }
}