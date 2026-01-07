export const calculateStreak = (lastStudyDate: Date | undefined, currentDate: Date): number => {
    if (!lastStudyDate) return 1;

    const diffTime = Math.abs(currentDate.getTime() - lastStudyDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
        return 1; // Increment streak logic handled in controller
    } else if (diffDays > 1) {
        return 0; // Streak broken
    }
    return 0; // Same day
};
