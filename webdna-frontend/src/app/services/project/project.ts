function formatMillis(millis: number): string {
    let result = '';

    const dayInMillis = 24 * 60 * 60 * 1000;
    const hourInMillis = 60 * 60 * 1000;
    const minuteInMillis = 60 * 1000;
    const secondInMillis = 1000;

    if (millis > dayInMillis) {
        result += Math.floor(millis / dayInMillis) + 'd ';
        millis = millis % dayInMillis;
    }

    if (millis > hourInMillis) {
        result += Math.floor(millis / hourInMillis) + 'h ';
        millis = millis % hourInMillis;
    }

    result += Math.floor(millis / minuteInMillis) + 'm ';
    millis = millis % minuteInMillis;

    result += Math.floor(millis / secondInMillis) + 's';

    return result;
}

export class Job {
    id?: string;
    project: string;
    start_time: Date;
    finish_time: Date;
    process_name: string;
    terminated: boolean;
}

export class Project {
    id?: string;
    user: string;
    name: string;
    created_on: Date;
    job: Job;

    get running(): boolean {
        return this.job && !this.job.finish_time;
    }

    get hasOutput(): boolean {
        return !!this.job;
    }

    get executionTime(): string {
        if (this.hasOutput) {
            let prefix = 'Running: ';
            const startTime: number = new Date(this.job.start_time).getTime();
            let currentTime: number = new Date().getTime();

            if (!this.running) {
                currentTime = new Date(this.job.finish_time).getTime();

                if (this.job.terminated) {
                    prefix = 'Finished (stopped): ';
                } else {
                    prefix = 'Finished (success): ';
                }
            }

            const millis = currentTime - startTime;

            return prefix + formatMillis(millis);
        } else {
            return 'Never run';
        }
    }

    constructor(other?: Project) {
        if (other) {
            this.id = other.id;
            this.user = other.user;
            this.name = other.name;
            this.created_on = other.created_on;
            this.job = other.job;
        }
    }
}

export enum ProjectFileType {
    SEQUENCE = 'SEQUENCE',
    TRAJECTORY_DAT = 'TRAJECTORY_DAT',
    EXTERNAL_FORCES = 'EXTERNAL_FORCES',
    CADNANO = 'CADNANO'
}

export class LogResponse {
    running: boolean;
    log: string;
    stdout: string;
}
