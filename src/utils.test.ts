import { timeSince } from './utils';

describe('timeSince', () => {
    it('should return "1 second" for a date 1 second ago', () => {
        const date = new Date(new Date().getTime() - 1000);
        expect(timeSince(date)).toBe('1 second');
    });

    it('should return "2 seconds" for a date 2 seconds ago', () => {
        const date = new Date(new Date().getTime() - 2000);
        expect(timeSince(date)).toBe('2 seconds');
    });

    it('should return "1 minute" for a date 1 minute ago', () => {
        const date = new Date(new Date().getTime() - 60000);
        expect(timeSince(date)).toBe('1 minute');
    });

    it('should return "2 minutes" for a date 2 minutes ago', () => {
        const date = new Date(new Date().getTime() - 120000);
        expect(timeSince(date)).toBe('2 minutes');
    });

    it('should return "1 hour" for a date 1 hour ago', () => {
        const date = new Date(new Date().getTime() - 3600000);
        expect(timeSince(date)).toBe('1 hour');
    });

    it('should return "2 hours" for a date 2 hours ago', () => {
        const date = new Date(new Date().getTime() - 7200000);
        expect(timeSince(date)).toBe('2 hours');
    });

    it('should return "1 day" for a date 1 day ago', () => {
        const date = new Date(new Date().getTime() - 86400000);
        expect(timeSince(date)).toBe('1 day');
    });

    it('should return "2 days" for a date 2 days ago', () => {
        const date = new Date(new Date().getTime() - 172800000);
        expect(timeSince(date)).toBe('2 days');
    });

    it('should return "1 month" for a date 1 month ago', () => {
        const date = new Date(new Date().getTime() - 2592000000);
        expect(timeSince(date)).toBe('1 month');
    });

    it('should return "2 months" for a date 2 months ago', () => {
        const date = new Date(new Date().getTime() - 5184000000);
        expect(timeSince(date)).toBe('2 months');
    });

    it('should return "1 year" for a date 1 year ago', () => {
        const date = new Date(new Date().getTime() - 31536000000);
        expect(timeSince(date)).toBe('1 year');
    });

    it('should return "2 years" for a date 2 years ago', () => {
        const date = new Date(new Date().getTime() - 63072000000);
        expect(timeSince(date)).toBe('2 years');
    });
});