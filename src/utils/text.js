import tt from 'counterpart';
import ttGetByKey from '@/utils/ttGetByKey';

export function getForumName(forum) {
    return ((tt.getLocale() === 'ru') ?
        (forum.name_ru || forum.name) :
        (forum.name || forum.name_ru)
    ) || '';
};

export function getPageTitle(title) {
    return ((title && title.length) ? `${title} | ` : ``) + ttGetByKey($GLS_Config.forum, 'page_title');
};
