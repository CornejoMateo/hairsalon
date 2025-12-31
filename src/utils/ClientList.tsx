export const getInitials = (name: string | null) => {
    if (!name) return '?';
    return name
        .split(' ')
        .map((word) => word[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
};