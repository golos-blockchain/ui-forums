import * as types from '@/actions/actionTypes';

export default function forum(state = {last: null}, action) {
    switch (action.type) {
        case types.FORUM_LOAD_RESOLVED:
            let { forum } = action.payload;
            forum = setProgression(forum);
            return Object.assign({}, state, forum);
        case types.FORUM_CONFIG_PROCESSING:
        case types.FORUM_CONFIG_RESOLVED:
        case types.FORUM_CONFIG_RESOLVED_ERROR:
        case types.FORUM_RESERVATION_PROCESSING:
        case types.FORUM_RESERVATION_RESOLVED:
        case types.FORUM_RESERVATION_RESOLVED_ERROR:
            return Object.assign({}, state, {last: action});
        default:
            return state;
    }
}

export function setProgression(forum) {
    const increment = 25;
    const steps = [1.375, 4.050, 7.959, 14.300, 23.587, 35.625, 50.225, 67.200, 86.362, 107.525, 130.500, 155.100, 178.450, 200.550];
    const initialCost = 2;
    if (!forum) return forum;
    let { funded } = forum;
    if (!funded) funded = 0;
    let current = funded;
    let level = 0;
    let required = 0;
    let previous = 0;
    let progress = 0;
    let split = 100;
    let next = false;
    for (var i = 0, len = steps.length; i < len; i++) {
        // Storing progression into current level
        progress = Math.floor((funded - (initialCost + previous)) * 1000) / 1000;
        // If the funding is greater than the next level + 10 (initial creation)
        if(funded >= steps[i] + initialCost) {
            level = i;
            split += increment;
          //   progress = steps[i] + initialCost
        } else {
            next = steps[i] + initialCost;
            required = Math.floor((steps[i] - previous) * 1000) / 1000;
            break;
        }
        previous = steps[i];
    }
    forum['progression'] = {
        current,
        level,
        next,
        progress,
        required,
        split,
    };
    return forum;
}
