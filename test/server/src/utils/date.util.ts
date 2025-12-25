export const isSameDay = (d1: Date, d2: Date): boolean => {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
};

export const differenceInDays = (d1: Date, d2: Date): number => {
  const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
  // Reset times to midnight to ensure accurate day difference
  const firstDate = new Date(d1.getFullYear(), d1.getMonth(), d1.getDate());
  const secondDate = new Date(d2.getFullYear(), d2.getMonth(), d2.getDate());

  return Math.round((firstDate.getTime() - secondDate.getTime()) / oneDay);
};
