import account from '@/reducers/account';
import accounts from '@/reducers/accounts';
import breadcrumb from '@/reducers/breadcrumb';
import chainstate from '@/reducers/chainstate';
import forum from '@/reducers/forum';
import moderation from '@/reducers/moderation';
import post from '@/reducers/post';
import preferences from '@/reducers/preferences';
import search from '@/reducers/search';
import status from '@/reducers/status';
import subscriptions from '@/reducers/subscriptions';

const forumReducer = {
    account,
    accounts,
    breadcrumb,
    chainstate,
    forum,
    moderation,
    post,
    preferences,
    search,
    status,
    subscriptions,
};

export default forumReducer;
