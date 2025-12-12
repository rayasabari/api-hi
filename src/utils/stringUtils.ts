export const camelCaseToTitleCase = (input: string): string => {
  if (!input) {
    return '';
  }
  // Add space before capital letters, then capitalize the first letter of the string
  const spaced = input.replace(/([A-Z])/g, ' $1');
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
};
