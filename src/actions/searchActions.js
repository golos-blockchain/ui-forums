import * as types from './actionTypes';
import * as CONFIG from '../../config';

export function search(query) {
    return async dispatch => {
        //alert(query.value);

        let url = new URL(CONFIG.ELASTIC_SEARCH.url);
        url += 'blog/post/_search?pretty';
        let sort = {};
        let main = [];
        if (query.value) {
            main = [{
                "bool": {
                    "should": [
                        {
                            "match": {
                                "title": query.value
                            }
                        },
                        {
                            "match": {
                                "body": query.value
                            }
                        } 
                    ]
                }
            }];
        } else {
            sort = {
                "sort": {
                    "created": {
                        "order": "desc"
                    }
                }
            };
        }
        let body = {
            "_source": false,
            "from": (query.page - 1) * 20,
            "size": 20,
            "query": {
                "bool": {
                    "must": [
                        {
                            "match_phrase_prefix": {
                                "category": "fm-" + CONFIG.FORUM._id + "-"
                            }
                        },
                        ...main,
                        ...query.filters
                    ]
                }
            },
            ...sort,
            "highlight": {
                "fragment_size" : 350,
                "fields": {
                    "title": {
                    },
                    "body": {
                    }
                }
            },
            "fields": ["author", "permlink", "category", "root_title", "body", "root_author", "root_permlink", "created"]
        };
        const response = await fetch(url, {
            method: 'post',
            headers: new Headers({
                'Authorization': 'Basic ' + btoa(CONFIG.ELASTIC_SEARCH.login + ':' + CONFIG.ELASTIC_SEARCH.password),
                'Content-Type': 'application/json'
            }),
            body: JSON.stringify(body)
        });
        if (response.ok) {
            const result = await response.json();
            //alert(JSON.stringify(result, null, 2));
            dispatch(searchResolved(result));
        } else {
            console.error(response.status);
            const result = await response.json();
            alert(JSON.stringify(result, null, 2));
            dispatch(searchResolved());
        }
    };
}

export function searchResolved(payload = {}) {
    return {
        type: types.SEARCH_RESOLVED,
        payload: payload
    };
}

export function searchBegin() {
    return {
        type: types.SEARCH
    };
}
