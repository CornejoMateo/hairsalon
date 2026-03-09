export const formatDateForDB = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export const formatDateForDisplay = (dateString: string): string => {
  // convert yyyy-mm-dd to dd-mm-yyyy
  const [year, month, day] = dateString.split("-");
  return `${day}-${month}-${year}`;
};

export const parseDateFromDB = (dateString: string): Date => {
  const [year, month, day] = dateString.split("-");
  return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
};
