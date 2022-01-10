


export default class Storage {
    static LAST_HISTORY_INDEX = 'lastHistoryIndex';
    static HISTORY_ID = 'historyId';
    static ALL_ITEMS = 'allItems';
    static PASS = 'pass';
    static EMAIL = 'email';

    static get(key) {
        const val = localStorage.getItem(key);

        try {
            return JSON.parse(val);
        } catch (e) {
            return val;
        }
    }

    static set(key, val) {
        return localStorage.setItem(key, typeof val === 'string' ? val : JSON.stringify(val))
    }

    static remove(key) {
        return localStorage.setItem(key, '');
    }
}
