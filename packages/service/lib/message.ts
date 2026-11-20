/** What a form shows for something that was thrown. */
export const messageOf = (error: unknown): string => {
  return error instanceof Error && error.message
    ? error.message
    : 'The form could not be submitted.';
};
