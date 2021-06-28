export function RemoveExtraWhitespaces(input: string): string {
    const formattedText = input.split(' ').filter(n => n).join(' ');
    return formattedText;
}
