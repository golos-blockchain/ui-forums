import * as types from '@/actions/actionTypes';

export function search(query) {
    return async dispatch => {
        //alert(query.value);

        let url = new URL($GLS_Config.elastic_search.url);
        url += 'blog/post/_search?pretty';
        let sort = {};
        let main = [];
        if (query.value) {
            let queryTrimmed = query.value.trim();
            let queryOp = 'match';
            if (queryTrimmed.length >= 3 && queryTrimmed[0] === '"' && queryTrimmed[queryTrimmed.length - 1] === '"') {
                queryOp = 'match_phrase';
            }
            main = [{
                "bool": {
                    "should": [
                        {
                            [queryOp]: {
                                "title": query.value
                            }
                        },
                        {
                            [queryOp]: {
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
                                "category": "fm-" + $GLS_Config.forum._id + "-"
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
                'Authorization': 'Basic ' + btoa($GLS_Config.elastic_search.login + ':' + $GLS_Config.elastic_search.password),
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
