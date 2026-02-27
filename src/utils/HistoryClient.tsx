export const formatDate = (date: string | null) => {
    if (!date) return '-';
    const [year, month, day] = date.split('-');
    return `${day}-${month}-${year}`;
}