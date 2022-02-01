import tt from 'counterpart';
import ttGetByKey from '@/utils/ttGetByKey';

import * as CONFIG from '@/config';

export function getForumName(forum) {
    return ((tt.getLocale() === 'ru') ?
        (forum.name_ru || forum.name) :
        (forum.name || forum.name_ru)
    ) || '';
};

export function getPageTitle(title) {
    return ((title && title.length) ? `${title} | ` : ``) + ttGetByKey(CONFIG.forum, 'page_title');
};
