import axios from 'axios';

import Storage from './storage';

const ACTION_DELETE = 2;
const DEFAULT_ITEMS_COUNT = 1000;

export default class API {
    static async makeThingsRequest(url) {
        const pass = Storage.get(Storage.PASS);
        const email = Storage.get(Storage.EMAIL);

        if (!pass || !email) {
            return false;
        }

        const res = await axios.request({
            method: 'GET',
            url: `https://cloud.culturedcode.com/version/1${url}`,
            headers: {
                Authorization: `Password ${pass}`,
                'Content-Type': 'application/json',
                Accept: 'application/json',
                'Content-Encoding': 'UTF8',
                'Accept-Language': 'en-us',
            },
        });

        return res.data;
    }

    static buildTasksList(previousTasks, items) {
        items.forEach((item) => {
            for (const id in item) {
                if (!item.hasOwnProperty(id)) continue;

                const thingsObject = item[id];

                if (thingsObject.e && thingsObject.e.indexOf('Task') > -1) {
                    const taskDelta = thingsObject.p;

                    previousTasks[id] = Object.assign({ id }, previousTasks[id], taskDelta);

                    if (thingsObject.t === ACTION_DELETE) {
                        previousTasks[id].hasActionDelete = true;
                    }
                }
            }
        });

        // Чтобы список всегда был чистым
        for (const id in previousTasks) {
            const task = previousTasks[id];
            if (task.hasActionDelete
                || (
                    task.tr === undefined
                    && task.ss === undefined
                    && task.st === undefined
                )
            ) {
                delete previousTasks[id];
            } else {
                ['pr', 'rt', 'dl', 'ar', 'agr'].forEach((propToRemove) => {
                    delete previousTasks[id][propToRemove];
                });
            }
        }

        return previousTasks;
    }

    static filterTodayTask(allTasks) {
        let todayTasks = [];

        for (const id in allTasks) {
            const task = allTasks[id];

            if (
                task.tr === false
                && task.ss === 0
                && task.st === 1
                && task.tt // Title
                && task.tp === 0 // type
                && task.sr // startDate
                && !task.hasActionDelete
            ) {
                todayTasks.push(task);
            }
        }

        todayTasks = todayTasks.sort((taskA, taskB) => Number(taskB.tir) - Number(taskA.tir));

        return todayTasks;
    }


    static async getHistoryItems(historyId, startIndex = 0) {
        return this.makeThingsRequest(`/history/${historyId}/items?start-index=${startIndex}`);
    }

    static async getHistory(historyId) {
        return this.makeThingsRequest(`/history/${historyId}`);
    }

    static async getOwnHistories() {
        const email = Storage.get('email');

        return this.makeThingsRequest(`/account/${email}/own-history-keys`);
    }

    static async updateHistory() {
        let historyId = Storage.get(Storage.HISTORY_ID);
        let allItems = Storage.get(Storage.ALL_ITEMS) || {};
        let lastHistoryIndex = Storage.get(Storage.LAST_HISTORY_INDEX);

        if (!historyId) {
            const ownHistoryRes = await this.getOwnHistories();
            if (!ownHistoryRes) return;

            historyId = ownHistoryRes[0];

            Storage.set(Storage.HISTORY_ID, historyId);
        }

        if (!lastHistoryIndex) {
            const res = await this.getHistory(historyId);
            lastHistoryIndex = Math.max(Number(res['latest-server-index']) - DEFAULT_ITEMS_COUNT, 0);

            Storage.set(Storage.LAST_HISTORY_INDEX, lastHistoryIndex);
        }

        const historyRes = await this.getHistoryItems(historyId, lastHistoryIndex);

        allItems = this.buildTasksList(allItems, historyRes.items);

        Storage.set(Storage.LAST_HISTORY_INDEX, historyRes['current-item-index']);
        Storage.set(Storage.ALL_ITEMS, allItems);
    }
}
