export function assignDecodedMessageFields(msg, decoded) {
    msg.message = decoded.body;
    msg.type = decoded.type || 'text';
}
