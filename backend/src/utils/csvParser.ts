export function parseEmailsFromText(text: string): string[] {
    // Email regex pattern
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

    const matches = text.match(emailRegex);
    if (!matches) {
        return [];
    }

    // Remove duplicates and validate
    const uniqueEmails = Array.from(new Set(matches));
    return uniqueEmails.filter(isValidEmail);
}

export function isValidEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
}

export function parseCSV(csvText: string): string[] {
    const lines = csvText.split(/\r?\n/);
    const emails: string[] = [];

    for (const line of lines) {
        // Try to extract emails from each line
        const lineEmails = parseEmailsFromText(line);
        emails.push(...lineEmails);
    }

    return Array.from(new Set(emails)); // Remove duplicates
}
