import account from '@/reducers/account';
import accounts from '@/reducers/accounts';
import breadcrumb from '@/reducers/breadcrumb';
import chainstate from '@/reducers/chainstate';
import forum from '@/reducers/forum';
import moderation from '@/reducers/moderation';
import post from '@/reducers/post';
import search from '@/reducers/search';

const forumReducer = {
    account,
    accounts,
    breadcrumb,
    chainstate,
    forum,
    moderation,
    post,
    search,
};

export default forumReducer;
