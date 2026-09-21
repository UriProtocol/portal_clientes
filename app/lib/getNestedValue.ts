export default function getNestedValue(obj: any, path: string) {
    return path.split(".").reduce((acc, part) => {
        if (acc === null || acc === undefined) return undefined;

        const match = part.match(/(\w+)\[(\d+)\]/);
        if (match) {
            const [_, key, index] = match;
            return acc[key]?.[parseInt(index, 10)];
        }

        return acc[part];
    }, obj);
};