export interface IEvent {
    id: string;
    name: string;
    description: string;
    start_date: string;
    end_date: string;
    start_time: string;
    end_time: string;
    all_day: boolean;
    venue?: string;
    is_online: boolean;
    online_link?: string;
    no_of_participants?: number;
    open_to_all: boolean;
    no_of_sessions?: number;
    registration_type: string;
    registration_link?: string;
    circular_id: string;
    department_id: string;
    college_id: string;

    created_by: string;
    created_at: string;

    updated_by: string;
    updated_at: string;

    deleted_by: string;
    deleted_at: string;
}

export interface IEventCreate {
    name: string;
    description: string;
    start_date: string;
    end_date: string;
    start_time: string;
    end_time: string;
    all_day: boolean;
    venue?: string;
    is_online: boolean;
    online_link?: string;
    no_of_participants?: number;
    open_to_all: boolean;
    no_of_sessions?: number;
    registration_type: string;
    registration_link?: string;
    circular_id: string;
    department_id: string;
    college_id: string;
}
