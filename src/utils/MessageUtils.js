export function assignDecodedMessageFields(msg, decoded) {
    msg.message = decoded.body;
    msg.type = decoded.type || 'text';
    msg.width = decoded.width;
    msg.height = decoded.height;
    msg.previewWidth = decoded.previewWidth;
    msg.previewHeight = decoded.previewHeight;
}
