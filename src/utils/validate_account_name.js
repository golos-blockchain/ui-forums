import tt from 'counterpart';

export default function (value) {
    let i, label, len, length, ref, suffix;

    suffix = tt('validation.account_name_should');
    if (!value) {
        return suffix + tt('validation.not_be_empty');
    }
    length = value.length;
    if (length < 3) {
        return suffix + tt('validation.be_longer');
    }
    if (length > 16) {
        return suffix + tt('validation.be_shorter');
    }
    if (/\./.test(value)) {
        suffix = tt('validation.each_account_segment_should');
    }
    ref = value.split('.');
    for (i = 0, len = ref.length; i < len; i++) {
        label = ref[i];
        if (!/^[a-z]/.test(label)) {
            return suffix + tt('validation.start_with_a_letter');
        }
        if (!/^[a-z0-9-]*$/.test(label)) {
            return suffix + tt('validation.have_only_letters_digits_or_dashes');
        }
        if (/--/.test(label)) {
            return suffix + tt('validation.have_only_one_dash_in_a_row');
        }
        if (!/[a-z0-9]$/.test(label)) {
            return suffix + tt('validation.end_with_a_letter_or_digit');
        }
        if (!(label.length >= 3)) {
            return suffix + tt('validation.be_longer');
        }
    }
    return true;
}

