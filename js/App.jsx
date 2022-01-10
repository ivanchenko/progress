import React from 'react';

import API from './api';
import Storage from './storage';


export default class App extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            showSettings: false,
            email: Storage.get(Storage.EMAIL) || '',
            pass: Storage.get(Storage.PASS) || '',
            percent: this.calcPercent(),
            tasks: this.getToday(),
        };
    }

    async componentDidMount() {
        // Обновляем процент
        setInterval(() => {
            this.setState({
                percent: this.calcPercent(),
            });
        }, 1000);

        // Обновляем задачи
        await API.updateHistory();
        this.setState({ tasks: this.getToday() });
    }

    getToday = () => {
        const allTasks = API.filterTodayTask(Storage.get(Storage.ALL_ITEMS)) || [];
        return allTasks.map(task => ({ id: task.id, title: task.tt }));
    }

    calcPercent = () => {
        const startDate = new Date();
        startDate.setMonth(0, 1);
        startDate.setHours(0, 0, 0, 0);

        const finishDate = new Date(startDate);
        finishDate.setFullYear(startDate.getFullYear() + 1);

        const percent = (Date.now() - startDate) / (finishDate - startDate - 24 * 60 * 60 * 1000);

        return (percent * 100).toFixed(2);
    }

    showSettings = () => {
        this.setState({ showSettings: true });
    }

    hideSettings = async () => {
        const { email, pass } = this.state;
        this.setState({ showSettings: false });

        const oldPass = Storage.get(Storage.PASS);
        const oldEmail = Storage.get(Storage.EMAIL);

        if (email && pass && (oldPass !== pass || oldEmail !== email)) {
            Storage.set(Storage.EMAIL, email);
            Storage.set(Storage.PASS, pass);

            Storage.remove(Storage.ALL_ITEMS);
            Storage.remove(Storage.LAST_HISTORY_INDEX);
            Storage.remove(Storage.HISTORY_ID);

            await API.updateHistory();
            this.setState({ tasks: this.getToday() });
        }

        if (!email && !pass) {
            Storage.remove(Storage.EMAIL);
            Storage.remove(Storage.PASS);
            Storage.remove(Storage.ALL_ITEMS);
            Storage.remove(Storage.LAST_HISTORY_INDEX);
            Storage.remove(Storage.HISTORY_ID);
        }
    }

    render() {
        const {
            tasks, percent, showSettings, email, pass,
        } = this.state;

        return (
            <div className="app">
                <h1>
                    {percent}
                    {' '}
                    %
                </h1>
                <div className="tasks">
                    {tasks.map(task => (
                        <div key={task.id} className="task">{task.title}</div>
                    ))}
                </div>

                <div className="settings">
                    {showSettings ? (
                        <img className="img-hide-settings" src="/img/cross.svg" onClick={this.hideSettings} />
                    ) : (
                        <img className="img-show-settings" src="/img/settings.svg" onClick={this.showSettings} />
                    )}

                    {showSettings && (
                        <div className="settings-form">
                            <label htmlFor="email">
                                Things Cloud Login
                                <input
                                    type="text"
                                    className="email"
                                    id="email"
                                    value={email}
                                    onChange={e => this.setState({ email: e.target.value })}
                                />
                            </label>

                            <label htmlFor="pass">
                                Password
                                <input
                                    type="password"
                                    className="pass"
                                    id="pass"
                                    value={pass}
                                    onChange={e => this.setState({ pass: e.target.value })}
                                />
                            </label>
                        </div>
                    )}
                </div>
            </div>
        );
    }
}
