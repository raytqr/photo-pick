/**
 * List of known disposable/temporary email domains
 * This list blocks common temp email services to prevent abuse
 */

export const DISPOSABLE_EMAIL_DOMAINS = new Set([
    // Popular temp email services
    "10minutemail.com",
    "10minutemail.net",
    "10minmail.com",
    "20minutemail.com",
    "guerrillamail.com",
    "guerrillamail.org",
    "guerrillamail.net",
    "guerrillamailblock.com",
    "tempmail.com",
    "temp-mail.org",
    "temp-mail.io",
    "tempmail.net",
    "throwaway.email",
    "throwawaymail.com",
    "mailinator.com",
    "mailinator.net",
    "mailinater.com",
    "mailnesia.com",
    "maildrop.cc",
    "getairmail.com",
    "getnada.com",
    "yopmail.com",
    "yopmail.fr",
    "yopmail.net",
    "fakeinbox.com",
    "fakemailgenerator.com",
    "sharklasers.com",
    "spam4.me",
    "grr.la",
    "dispostable.com",
    "discard.email",
    "discardmail.com",
    "emailondeck.com",
    "anonbox.net",
    "anonymbox.com",
    "tempinbox.com",
    "burnermail.io",
    "emailfake.com",
    "mohmal.com",
    "10minemail.com",
    "minutemail.com",
    "mintemail.com",
    "tempemailaddress.com",
    "trashmail.com",
    "trashmail.net",
    "trash-mail.com",
    "spamgourmet.com",
    "spamex.com",
    "spamfree24.org",
    "inboxalias.com",
    "sneakemail.com",
    "jetable.org",
    "kasmail.com",
    "mytrashmail.com",
    "mailexpire.com",
    "mailmoat.com",
    "mailcatch.com",
    "tempmailaddress.com",
    "tmpmail.org",
    "tmpmail.net",
    "tempr.email",
    "tempsky.com",
    "throwam.com",
    "wegwerfmail.de",
    "wegwerfmail.net",
    "wegwerfmail.org",
    "get2mail.fr",
    "pokemail.net",
    "mailsac.com",
    "spamherelots.com",
    "meltmail.com",
    "mailnator.com",
    "imgof.com",
    "guerrillamail.biz",
    "guerrillamail.de",
    "guerrillamail.info",
    "einrot.com",
    "crazymailing.com",
    "emkei.cz",
    "emailtemporar.ro",
    "fakemailgenerator.net",
    "onewaymail.com",
    "shortmail.net",
    "sofimail.com",
    "spamobox.com",
    "mailnull.com",
    "binkmail.com",
    "safetymail.info",
    "spamspot.com",
    "mailforspam.com",
    "quickmail.nl",
    "klzlv.com",
    "dropmail.me",
    "emailsensei.com",
    "fakemail.fr",
    "instantemailaddress.com",
    "dontmail.net",
    "mail-temporaire.fr",
    "filzmail.com",
    "privacy.net",
    "mailslite.com",
]);

/**
 * Check if an email address is from a disposable/temporary email provider
 * @param email - Email address to check
 * @returns true if email is disposable, false if valid
 */
export function isDisposableEmail(email: string): boolean {
    if (!email || !email.includes("@")) return false;

    const domain = email.split("@")[1]?.toLowerCase();
    if (!domain) return false;

    return DISPOSABLE_EMAIL_DOMAINS.has(domain);
}

/**
 * Validate email for registration
 * Returns error message if invalid, null if valid
 */
export function validateEmailForRegistration(email: string): string | null {
    if (!email) {
        return "Email is required";
    }

    if (!email.includes("@")) {
        return "Please enter a valid email address";
    }

    if (isDisposableEmail(email)) {
        return "Temporary/disposable emails are not allowed. Please use a permanent email address.";
    }

    return null;
}
