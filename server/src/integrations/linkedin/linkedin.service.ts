export const getLinkedinStats = async (_profile: string) => {
  // LinkedIn data cannot be reliably fetched without OAuth + permissions.
  // Scraping is against LinkedIn ToS.
  // This project intentionally does NOT implement LinkedIn OAuth.
  // Result: we only store the student-provided profile URL in the user record.
  return null;
};
