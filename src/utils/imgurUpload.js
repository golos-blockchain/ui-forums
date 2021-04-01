import tt from 'counterpart';

import * as CONFIG from '../../config';

function makeRequest (method, url, data, headersInitializer) {
    return new Promise((resolve, reject) => {
        let xhr = new XMLHttpRequest();
        xhr.open(method, url);
        if (headersInitializer) headersInitializer(xhr);
        xhr.onload = function () {
            if (this.status >= 200 && this.status < 300) {
                resolve(xhr.response);
            } else {
                reject({
                    status: this.status,
                    statusText: xhr.statusText
                });
            }
        };
        xhr.onerror = function () {
            reject({
                status: this.status,
                statusText: xhr.statusText
            });
        };
        xhr.send(data);
    });
}

export async function imgurUpload(image, sizeLimit = CONFIG.STM_Config.max_upload_image_bytes) {
    const formData = new FormData();
    formData.append('image', image);

    let res = null;
    try {
        res = await makeRequest('POST', CONFIG.STM_Config.upload_image, formData, (xhr) => {
            xhr.setRequestHeader('Authorization', 'Client-ID ' + CONFIG.STM_Config.client_id);
        });
    } catch (error) {
        console.error(error);
        alert(tt('account.cannot_load_image_try_again') + ' Error: ' + JSON.stringify(error));
        return false;
    }

    console.debug(res);

    const data = JSON.parse(res);
    if (!data.success) {
        alert(tt('account.cannot_load_image_try_again'));
        return false;
    }

    if (sizeLimit && data.data.size > sizeLimit) {
        alert(tt('g.too_big_file'));
        return false;
    }

    return data.data;
}
