export default async function importNoty() {
    if (typeof(document) !== 'undefined') {
        const Noty = await import('noty');
        return Noty.default;
    }
    else
        return undefined;
}
