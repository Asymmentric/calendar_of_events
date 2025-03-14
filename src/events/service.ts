import moment from "moment";
import EventsDB from "./db";
import { IEventCreate } from "./types/interface";
import AnotherError from "../utils/errors/anotherError";
import { validateURL } from "../utils/util";
import { RegistrationType } from "./types/enum";
import { IAuthData } from "../users/types/interface";
import { UserRoles } from "../users/types/enum";
import { v4 } from "uuid";

class EventService {
    private eventDB;
    constructor() {
        this.eventDB = new EventsDB();
    }

    public createEvent = async (authData: IAuthData, data: IEventCreate) => {
        const {
            name,
            description,
            start_date,
            end_date,
            start_time,
            end_time,
            all_day,
            venue,
            is_online,
            online_link,
            no_of_participants,
            open_to_all,
            no_of_sessions,
            registration_type,
            registration_link,
            circular_id,
            department_id,
        } = data;

        if (moment().format(start_date) > moment().format(end_date)) {
            throw new AnotherError(
                "INVALID_INPUT",
                "Start date cannot be greater than end date"
            );
        }

        if (moment().format(start_time) > moment().format(end_time)) {
            throw new AnotherError(
                "INVALID_INPUT",
                "Start time cannot be greater than end time"
            );
        }

        if (is_online) {
            if (!online_link?.length) {
                throw new AnotherError(
                    "INVALID_INPUT",
                    "Online link is required"
                );
            }

            if (!validateURL(online_link)) {
                throw new AnotherError(
                    "INVALID_INPUT",
                    "Online link is invalid"
                );
            }
        }

        if (registration_type !== RegistrationType.OFFLINE) {
            if (!registration_link?.length) {
                throw new AnotherError(
                    "INVALID_INPUT",
                    "Registration link is required"
                );
            }

            if (!validateURL(registration_link)) {
                throw new AnotherError(
                    "INVALID_INPUT",
                    "Registration link is invalid"
                );
            }
        }

        if (
            [UserRoles.FACULTY, UserRoles.HOD, UserRoles.STUDENT].includes(
                authData.role
            ) &&
            department_id !== authData.department_id
        ) {
            throw new AnotherError(
                "NOT_ALLOWED_ACCESS",
                "You are not allowed to create event for this department"
            );
        }

        const createEventObj = {
            id: v4(),
            name,
            description,
            start_date,
            end_date,
            start_time,
            end_time,
            all_day,
            venue,
            is_online,
            online_link,
            no_of_participants,
            open_to_all,
            no_of_sessions,
            registration_type,
            registration_link,
            circular_id,
            department_id,
            college_id: authData.college_id,
            created_at: moment().format(),
            updated_at: moment().format(),
        };
    };
}
